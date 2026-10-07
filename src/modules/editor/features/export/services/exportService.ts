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
import { getExportFilename } from "./export-settings";
import { loadTextFonts } from "@/modules/editor/features/text/utils/text-fonts";
import { loadExportMediaElement } from "./export-media-loader";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";

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
  onStatus?: (status: string) => void;
  onComplete: (
    blobUrl: string,
    downloadName?: string,
    cleanup?: () => Promise<void>,
  ) => void;
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
  let completedSourceCleanup: (() => Promise<void>) | undefined;
  const activeAssetIds = new Set<string>();
  let wakeLock: ScreenWakeLock | null = null;
  const publishExport = async (
    blob: Blob | null,
    extension: "mp4" | "webm",
    duration: number,
  ) => {
    const name = getExportFilename(settings.filename, extension);
    let url = "";
    if (blob) {
      if (!blob.size) throw new Error("The exported file is empty.");
      await blob.slice(0, 1).arrayBuffer();
      if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
      url = URL.createObjectURL(blob);
    }
    onComplete(url, name, completedSourceCleanup);
    completedSourceCleanup = undefined;
    onProgress(duration, duration, 100, "completed");
    if (url) triggerFileDownload(url, name);
    useToastStore
      .getState()
      .showToast("Export completed successfully", "success");
  };

  try {
    let preflight =
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
    usePlaybackStore.getState().setIsPlaying(false);

    if (preflight.frameEncoding) {
      const { runFrameExport, FrameExportUnsupportedError } =
        await import("./frame-exporter");
      try {
        const blob = await runFrameExport(
          project,
          settings,
          preflight,
          preflight.frameEncoding,
          callbacks,
          outputTarget,
        );
        let finalBlob = blob;
        if (outputTarget) {
          finalBlob = await outputTarget.close();
          completedSourceCleanup = outputTarget.dispose;
          outputTarget = null;
        }
        await publishExport(
          finalBlob,
          settings.format,
          project.settings.duration,
        );
        return;
      } catch (error) {
        if (!(error instanceof FrameExportUnsupportedError)) throw error;
        preflight = await buildExportPreflight(project, settings, false);
        if (preflight.blockingReason) throw new Error(preflight.blockingReason);
        if (preflight.isLongExport && !outputTarget) {
          outputTarget = await createExportOutputTarget(
            project.id,
            settings.filename,
            {
              ...preflight,
              destinationStrategy: "opfs",
            },
          );
        }
        callbacks.onStatus?.("Preparing compatibility export…");
      }
    }

    await loadTextFonts(
      project.tracks.flatMap((track) =>
        track.clips.flatMap((clip) =>
          clip.type === "text" && clip.textStyle ? [clip.textStyle] : [],
        ),
      ),
    );

    // Each timeline clip needs its own player, even when clips reuse one asset.
    const clips = project.tracks
      .filter((track) => !track.hidden)
      .flatMap((track) =>
        track.clips.filter(
          (clip) =>
            clip.assetId &&
            clip.timelineStart < project.settings.duration &&
            clip.timelineStart + clip.timelineDuration > 0,
        ),
      );
    const ids = [...new Set(clips.map((clip) => clip.assetId!))];
    const assets = await db.assets.bulkGet(ids);
    const assetsById = new Map(ids.map((id, index) => [id, assets[index]]));
    for (const clip of clips) {
      if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
      const asset = assetsById.get(clip.assetId!);
      if (!asset)
        throw new Error(
          "A timeline media file is missing. Restore it before exporting.",
        );
      const url = await resolveMediaAssetUrl(asset);
      if (asset.type === "image") {
        const image = new Image();
        if (asset.remoteUrl || asset.source?.kind === "remote")
          image.crossOrigin = "anonymous";
        await loadExportMediaElement(image, url, checkIsCancelled);
        mediaElementsMap.set(clip.id, image);
      } else {
        const element = document.createElement(
          asset.type === "video" ? "video" : "audio",
        );
        element.muted = true;
        element.preload = "auto";
        if (element instanceof HTMLVideoElement) element.playsInline = true;
        await loadExportMediaElement(element, url, checkIsCancelled);
        mediaElementsMap.set(clip.id, element);
      }
    }
    if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
    const exportW = preflight.width;
    const exportH = preflight.height;

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
    // Frames are pushed manually after each render, so the recorder never
    // captures a half-drawn canvas or duplicates a stale frame.
    const canPushFrames =
      typeof CanvasCaptureMediaStreamTrack !== "undefined" &&
      "requestFrame" in CanvasCaptureMediaStreamTrack.prototype;
    const canvasStream = offscreenCanvas.captureStream(
      canPushFrames ? 0 : settings.fps,
    );
    const [videoTrack] = canvasStream.getVideoTracks() as Array<
      MediaStreamTrack & { requestFrame?: () => void }
    >;
    const pushFrame = () => {
      if (canPushFrames) videoTrack?.requestFrame?.();
    };
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
      videoBitsPerSecond: preflight.videoBitrate,
      ...(preflight.hasAudio
        ? { audioBitsPerSecond: preflight.audioBitrate || 192_000 }
        : {}),
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
    const frameIntervalMs = 1000 / settings.fps;

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
    pushFrame();
    callbacks.onStatus?.("Exporting video…");

    const startedAt = performance.now();
    let pausedMs = 0;
    let lastProgressAt = startedAt;
    let currentTime = 0;
    while (currentTime < totalDuration) {
      if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
      if (chunkWriteError) throw chunkWriteError;
      if (document.visibilityState === "hidden") {
        const pauseStartedAt = performance.now();
        callbacks.onStatus?.("Paused — return to this tab to continue");
        if (mediaRecorder.state === "recording") mediaRecorder.pause();
        await audioSession?.audioCtx.suspend();
        pauseExportMedia(mediaElementsMap);
        while (document.visibilityState === "hidden") {
          if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
        pausedMs += performance.now() - pauseStartedAt;
        await audioSession?.audioCtx.resume();
        if (mediaRecorder.state === "paused") mediaRecorder.resume();
        callbacks.onStatus?.("Exporting video…");
        activeAssetIds.clear();
        wakeLock = await acquireScreenWakeLock();
      }

      const frameStartedAt = performance.now();
      currentTime = (frameStartedAt - startedAt - pausedMs) / 1000;
      if (currentTime >= totalDuration) break;
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
      pushFrame();

      // Update Audio Nodes envelope
      if (audioSession) {
        audioSession.updateAudioFrame(currentTime);
      }

      const pct = Math.min(99, Math.round((currentTime / totalDuration) * 90));
      if (frameStartedAt - lastProgressAt >= 100) {
        onProgress(currentTime, totalDuration, pct, "rendering");
        lastProgressAt = frameStartedAt;
      }
      // Wait for the next slot on a fixed frame grid so timing errors don't accumulate.
      const elapsedMs = performance.now() - startedAt - pausedMs;
      const nextFrameMs =
        (Math.floor(elapsedMs / frameIntervalMs) + 1) * frameIntervalMs;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, nextFrameMs - elapsedMs)),
      );
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
    completedSourceCleanup = outputTarget?.dispose;
    outputTarget = null;

    if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");

    let finalExportBlob = encodedBlob;
    let fileExtension = preflight.extension;

    if (
      !preflight.isLongExport &&
      !preflight.requiresMp4Conversion &&
      fileExtension === "webm" &&
      encodedBlob
    ) {
      callbacks.onStatus?.("Finalizing video…");
      const { finalizeRecordedWebM } = await import("./finalize-recorded-webm");
      finalExportBlob = await finalizeRecordedWebM(
        encodedBlob,
        settings.fps,
        checkIsCancelled,
      );
    }

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

    await publishExport(finalExportBlob, fileExtension, totalDuration);
  } catch (err: unknown) {
    await outputTarget?.abort().catch(() => undefined);
    outputTarget = null;
    if (err instanceof Error && err.message === "EXPORT_CANCELLED") {
      onProgress(0, 0, 0, "cancelled");
      useToastStore
        .getState()
        .showToast("Export cancelled. You can export again anytime.", "info", 4000);
    } else {
      console.error("Export error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      useToastStore.getState().showToast(`Export failed: ${errMsg}`, "error");
      onError(errMsg);
    }
  } finally {
    await completedSourceCleanup?.().catch(() => undefined);
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
