import type { Project } from "@/modules/projects/types";
import { db } from "@/modules/core/db/database";
import { resolveMediaAssetUrl } from "@/modules/core/storage/media-source-service";
import {
  createExportOutputTarget,
  type ExportOutputTarget,
} from "./export-output-target";
import { renderExportFrame } from "./exportCompositor";
import { createAudioExporterSession } from "./audioExporter";
import {
  buildExportPreflight,
  type ExportPreflightResult,
} from "./export-preflight";
import { pauseExportMedia, synchronizeExportMedia } from "./export-media-sync";
import type {
  ExportFormat,
  ExportResolution,
  ExportQuality,
  ExportPhase,
} from "@/modules/editor/store/useExportStore";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";

export interface ExportSettings {
  filename: string;
  format: ExportFormat;
  resolution: ExportResolution;
  fps: 24 | 30 | 60;
  quality: ExportQuality;
}

export interface ExportCallbacks {
  onProgress: (
    currentTime: number,
    totalDuration: number,
    percentage: number,
    phase: ExportPhase,
  ) => void;
  onComplete: (blobUrl: string) => void;
  onError: (error: string) => void;
  checkIsCancelled: () => boolean;
}

export async function runExportTask(
  project: Project,
  settings: ExportSettings,
  callbacks: ExportCallbacks,
  preparedPreflight?: ExportPreflightResult,
) {
  const { onProgress, onComplete, onError, checkIsCancelled } = callbacks;

  let offscreenCanvas: HTMLCanvasElement | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let combinedStream: MediaStream | null = null;
  let audioSession: ReturnType<typeof createAudioExporterSession> = null;
  const mediaElementsMap = new Map<
    string,
    HTMLVideoElement | HTMLImageElement | HTMLAudioElement
  >();
  let outputTarget: ExportOutputTarget | null = null;
  const activeAssetIds = new Set<string>();
  let wakeLock: ScreenWakeLock | null = null;

  try {
    const preflight =
      preparedPreflight || (await buildExportPreflight(project, settings));
    if (preflight.isMobileBlocked) {
      throw new Error(
        "Long exports are available on desktop. You can still edit and preview this project on mobile.",
      );
    }
    if (!preflight.hasEnoughStorage) {
      throw new Error("Not enough free storage for the estimated export size.");
    }
    if (preflight.isLongExport) {
      outputTarget = await createExportOutputTarget(
        project.id,
        settings.filename,
        preflight,
      );
    }
    wakeLock = await acquireScreenWakeLock();

    onProgress(0, project.settings.duration, 0, "rendering");

    // 1. Preload Media Elements (Images, Videos, & Audio) from IndexedDB
    for (const assetId of project.assetIds) {
      if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
      const asset = await db.assets.get(assetId);
      if (!asset) continue;

      const mediaUrl = await resolveMediaAssetUrl(asset).catch(() => null);
      if (!mediaUrl) continue;

      if (asset.type === "video") {
        const videoEl = document.createElement("video");
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.preload = "metadata";
        videoEl.src = mediaUrl;

        await new Promise<void>((resolve) => {
          videoEl.onloadedmetadata = () => resolve();
          videoEl.onerror = () => resolve();
        });
        mediaElementsMap.set(asset.id, videoEl);
      } else if (asset.type === "audio") {
        const audioEl = document.createElement("audio");
        audioEl.preload = "metadata";
        audioEl.src = mediaUrl;

        await new Promise<void>((resolve) => {
          audioEl.onloadedmetadata = () => resolve();
          audioEl.onerror = () => resolve();
        });
        mediaElementsMap.set(asset.id, audioEl);
      } else if (asset.type === "image") {
        const imgEl = new Image();
        if (asset.remoteUrl) imgEl.crossOrigin = "anonymous";
        imgEl.src = mediaUrl;

        await new Promise<void>((resolve) => {
          imgEl.onload = () => resolve();
          imgEl.onerror = () => resolve();
        });
        mediaElementsMap.set(asset.id, imgEl);
      }
    }

    if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");

    // 2. Resolution Setup
    const projW = project.settings.width || 1920;
    const projH = project.settings.height || 1080;
    let exportW = projW;
    let exportH = projH;

    if (settings.resolution === "720p" || settings.resolution === "1280x720") {
      exportW = 1280;
      exportH = 720;
    } else if (
      settings.resolution === "1080p" ||
      settings.resolution === "1920x1080"
    ) {
      exportW = 1920;
      exportH = 1080;
    }

    // 3. Create Offscreen Composition Canvas
    offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = exportW;
    offscreenCanvas.height = exportH;
    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx)
      throw new Error(
        "Could not create 2D canvas rendering context for export.",
      );

    // 4. Setup Web Audio Session
    audioSession = createAudioExporterSession(project, mediaElementsMap);

    // 5. Build Combined MediaStream
    const canvasStream = offscreenCanvas.captureStream(settings.fps);
    combinedStream = new MediaStream();

    canvasStream.getVideoTracks().forEach((vt) => combinedStream?.addTrack(vt));
    if (audioSession) {
      audioSession.destination.stream
        .getAudioTracks()
        .forEach((at) => combinedStream?.addTrack(at));
    }

    const mimeType = preflight.mimeType;
    const recordedChunks: Blob[] = [];
    let chunkWrite = Promise.resolve();
    let chunkWriteError: unknown = null;

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: getBitrateForQuality(settings.quality),
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        if (outputTarget) {
          chunkWrite = chunkWrite
            .then(() => outputTarget!.write(e.data))
            .catch((error) => {
              chunkWriteError = error;
            });
        } else {
          recordedChunks.push(e.data);
        }
      }
    };

    // 6. Frame Loop Execution
    const totalDuration = Math.max(0.5, project.settings.duration);
    const fps = settings.fps;
    const frameIntervalSec = 1 / fps;

    await synchronizeExportMedia(project, 0, mediaElementsMap, activeAssetIds);
    renderExportFrame({
      canvas: offscreenCanvas,
      ctx,
      project,
      currentTime: 0,
      exportWidth: exportW,
      exportHeight: exportH,
      mediaElementsMap,
    });
    mediaRecorder.start(preflight.isLongExport ? 1000 : 200);

    let currentTime = 0;
    while (currentTime < totalDuration) {
      if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
      if (chunkWriteError) throw chunkWriteError;
      if (document.visibilityState === "hidden") {
        if (mediaRecorder.state === "recording") mediaRecorder.pause();
        pauseExportMedia(mediaElementsMap);
        while (document.visibilityState === "hidden") {
          if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
        if (mediaRecorder.state === "paused") mediaRecorder.resume();
        activeAssetIds.clear();
        wakeLock = await acquireScreenWakeLock();
      }

      const frameStartedAt = performance.now();
      await synchronizeExportMedia(
        project,
        currentTime,
        mediaElementsMap,
        activeAssetIds,
      );

      // Render offscreen canvas frame
      renderExportFrame({
        canvas: offscreenCanvas,
        ctx,
        project,
        currentTime,
        exportWidth: exportW,
        exportHeight: exportH,
        mediaElementsMap,
      });

      // Update Audio Nodes envelope
      if (audioSession) {
        audioSession.updateAudioFrame(currentTime);
      }

      const pct = Math.min(99, Math.round((currentTime / totalDuration) * 90));
      onProgress(currentTime, totalDuration, pct, "rendering");

      currentTime += frameIntervalSec;
      const remainingFrameMs = Math.max(
        0,
        frameIntervalSec * 1000 - (performance.now() - frameStartedAt),
      );
      await new Promise((resolve) => setTimeout(resolve, remainingFrameMs));
    }

    await new Promise<void>((resolve, reject) => {
      if (!mediaRecorder) return reject(new Error("MediaRecorder unavailable"));
      mediaRecorder.onstop = () => resolve();
      mediaRecorder.stop();
    });
    await chunkWrite;
    if (chunkWriteError) throw chunkWriteError;

    const encodedBlob = outputTarget
      ? await outputTarget.close()
      : new Blob(recordedChunks, { type: mimeType });
    outputTarget = null;

    if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");

    let finalExportBlob = encodedBlob;
    let fileExtension = preflight.extension;

    // 7. MP4 Local WASM Transcoding if MP4 selected
    if (preflight.requiresMp4Conversion && encodedBlob) {
      onProgress(totalDuration, totalDuration, 95, "converting");
      try {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { fetchFile } = await import("@ffmpeg/util");

        const ffmpeg = new FFmpeg();
        await ffmpeg.load();

        const inputName = "input.webm";
        const outputName = "output.mp4";

        await ffmpeg.writeFile(inputName, await fetchFile(encodedBlob));
        await ffmpeg.exec([
          "-i",
          inputName,
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-preset",
          "ultrafast",
          outputName,
        ]);

        const mp4Data = await ffmpeg.readFile(outputName);
        finalExportBlob = new Blob([mp4Data as unknown as BlobPart], {
          type: "video/mp4",
        });
        fileExtension = "mp4";

        // Clean up FFmpeg virtual files
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch {}
      } catch (ffmpegErr) {
        console.warn("FFmpeg MP4 conversion fallback to WebM:", ffmpegErr);
        // Fallback to WebM if FFmpeg WASM fails or SharedArrayBuffer is unsupported
        finalExportBlob = encodedBlob;
        fileExtension = preflight.extension;
      }
    }

    onProgress(totalDuration, totalDuration, 100, "completed");

    let exportUrl = "";
    if (finalExportBlob) {
      exportUrl = URL.createObjectURL(finalExportBlob);
      triggerFileDownload(
        exportUrl,
        `${settings.filename || "video-export"}.${fileExtension}`,
      );
    }
    useToastStore
      .getState()
      .showToast("Export completed successfully", "success");
    onComplete(exportUrl);
  } catch (err: unknown) {
    await outputTarget?.abort().catch(() => undefined);
    outputTarget = null;
    if (err instanceof Error && err.message === "EXPORT_CANCELLED") {
      onProgress(0, 0, 0, "cancelled");
      useToastStore.getState().showToast("Export cancelled", "info");
    } else {
      console.error("Export error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      useToastStore.getState().showToast(`Export failed: ${errMsg}`, "error");
      onError(errMsg);
    }
  } finally {
    // Teardown Stream Tracks & Contexts
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      try {
        mediaRecorder.stop();
      } catch {}
    }
    if (combinedStream) {
      combinedStream.getTracks().forEach((t) => t.stop());
    }
    if (audioSession) {
      audioSession.cleanup();
    }
    mediaElementsMap.forEach((el) => {
      if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
        el.pause();
        el.src = "";
        el.load();
      }
    });
    await wakeLock?.release().catch(() => undefined);
  }
}

function getBitrateForQuality(quality: ExportQuality): number {
  switch (quality) {
    case "draft":
      return 3_000_000; // 3 Mbps
    case "high":
      return 15_000_000; // 15 Mbps
    case "standard":
    default:
      return 8_000_000; // 8 Mbps
  }
}

interface ScreenWakeLock {
  release: () => Promise<void>;
}

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<ScreenWakeLock>;
  };
};

async function acquireScreenWakeLock(): Promise<ScreenWakeLock | null> {
  try {
    return (
      (await (navigator as WakeLockNavigator).wakeLock?.request("screen")) ||
      null
    );
  } catch {
    return null;
  }
}
function triggerFileDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
