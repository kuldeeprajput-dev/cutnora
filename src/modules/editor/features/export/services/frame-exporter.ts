import {
  ALL_FORMATS,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  UrlSource,
  WebMOutputFormat,
  canEncodeAudio,
  canEncodeVideo,
  type InputVideoTrack,
  type WrappedCanvas,
} from "mediabunny";
import type { Project } from "@/modules/projects/types";
import type { TimelineClip } from "@/modules/editor/types";
import { db } from "@/modules/core/db/database";
import {
  resolveMediaAssetBlob,
  resolveMediaAssetUrl,
} from "@/modules/core/storage/media-source-service";
import { loadTextFonts } from "@/modules/editor/features/text/utils/text-fonts";
import { renderExportFrame, type ExportMediaSource } from "./exportCompositor";
import { loadExportMediaElement } from "./export-media-loader";
import {
  EXPORT_SAMPLE_RATE,
  mixExportAudioBlock,
  type ExportAudioClip,
} from "./offline-audio-mixer";
import type { ExportCallbacks, ExportSettings } from "./exportService";
import type { ExportPreflightResult } from "./export-preflight";

export interface FrameEncodingSupport {
  videoCodec: "avc" | "vp8";
  audioCodec: "aac" | "opus";
}
export class FrameExportUnsupportedError extends Error {}
let aacRegistration: Promise<void> | undefined;
const supportCache = new Map<string, Promise<FrameEncodingSupport | null>>();

export function getFrameEncodingSupport(
  settings: ExportSettings,
  width: number,
  height: number,
  bitrate: number,
  hasAudio: boolean,
) {
  const key = [
    settings.format,
    settings.fps,
    width,
    height,
    bitrate,
    hasAudio,
  ].join(":");
  const cached = supportCache.get(key);
  if (cached) return cached;
  const probe = (async (): Promise<FrameEncodingSupport | null> => {
    if (
      typeof VideoEncoder === "undefined" ||
      typeof VideoDecoder === "undefined"
    )
      return null;
    const videoCodec = settings.format === "mp4" ? "avc" : "vp8";
    const audioCodec = settings.format === "mp4" ? "aac" : "opus";
    if (
      !(await canEncodeVideo(videoCodec, {
        width,
        height,
        bitrate,
        frameRate: settings.fps,
        latencyMode: "quality",
        hardwareAcceleration: "no-preference",
      }))
    )
      return null;
    if (hasAudio) {
      const audioOptions = {
        sampleRate: EXPORT_SAMPLE_RATE,
        numberOfChannels: 2,
        bitrate: 192_000,
      };
      if (!(await canEncodeAudio(audioCodec, audioOptions))) {
        if (audioCodec !== "aac") return null;
        aacRegistration ??= import("@mediabunny/aac-encoder").then(
          ({ registerAacEncoder }) => registerAacEncoder(),
        );
        await aacRegistration;
        if (!(await canEncodeAudio(audioCodec, audioOptions))) return null;
      }
    }
    return { videoCodec, audioCodec };
  })().catch(() => null);
  if (supportCache.size >= 32) supportCache.clear();
  supportCache.set(key, probe);
  return probe;
}

interface VideoClip {
  clip: TimelineClip;
  track: InputVideoTrack;
  iterator?: AsyncGenerator<WrappedCanvas | null, void, unknown>;
}

// Encode timeline timestamps directly: slow rendering never drops or stretches a frame.
export async function runFrameExport(
  project: Project,
  settings: ExportSettings,
  preflight: ExportPreflightResult,
  encoding: FrameEncodingSupport,
  callbacks: ExportCallbacks,
): Promise<Blob> {
  const inputs = new Map<string, Input>();
  const media = new Map<string, ExportMediaSource>();
  const videos: VideoClip[] = [];
  const audio: ExportAudioClip[] = [];
  let output: Output | undefined;
  const duration = Math.max(0.5, project.settings.duration);
  const checkCancelled = () => {
    if (callbacks.checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
  };
  try {
    callbacks.onStatus?.("Preparing media…");
    const tracks = project.tracks.filter((track) => !track.hidden);
    const activeClips = tracks.flatMap((track) =>
      track.clips.filter(
        (clip) =>
          !(clip as { hidden?: boolean }).hidden &&
          clip.timelineStart < duration &&
          clip.timelineStart + clip.timelineDuration > 0,
      ),
    );
    const assetIds = [
      ...new Set(
        activeClips.flatMap((clip) => (clip.assetId ? [clip.assetId] : [])),
      ),
    ];
    const assets = await db.assets.bulkGet(assetIds);
    for (const asset of assets) {
      checkCancelled();
      if (!asset)
        throw new Error(
          "A timeline media file is missing. Restore it before exporting.",
        );
      if (asset.type === "image") {
        const image = new Image();
        if (asset.remoteUrl || asset.source?.kind === "remote")
          image.crossOrigin = "anonymous";
        await loadExportMediaElement(
          image,
          await resolveMediaAssetUrl(asset),
          callbacks.checkIsCancelled,
        );
        media.set(asset.id, image);
      } else {
        const source =
          asset.remoteUrl || asset.source?.kind === "remote"
            ? new UrlSource(await resolveMediaAssetUrl(asset))
            : new BlobSource(await resolveMediaAssetBlob(asset));
        const input = new Input({ formats: ALL_FORMATS, source });
        inputs.set(asset.id, input);
        if (!(await input.canRead()))
          throw new FrameExportUnsupportedError(
            "This media needs compatibility export.",
          );
      }
    }
    await loadTextFonts(
      activeClips.flatMap((clip) =>
        clip.type === "text" && clip.textStyle ? [clip.textStyle] : [],
      ),
    );
    for (const track of tracks) {
      for (const clip of track.clips) {
        checkCancelled();
        if (!activeClips.includes(clip) || !clip.assetId) continue;
        const input = inputs.get(clip.assetId);
        if (!input) continue;
        if (clip.type === "video") {
          const videoTrack = await input.getPrimaryVideoTrack();
          if (!videoTrack || !(await videoTrack.canDecode()))
            throw new FrameExportUnsupportedError(
              "This video needs compatibility export.",
            );
          videos.push({ clip, track: videoTrack });
        }
        if (
          preflight.hasAudio &&
          !track.muted &&
          !clip.audio?.muted &&
          (clip.audio?.volume ?? 1) > 0
        ) {
          const audioTrack = await input.getPrimaryAudioTrack();
          if (audioTrack) {
            if (
              (await audioTrack.getNumberOfChannels()) > 2 ||
              !(await audioTrack.canDecode())
            )
              throw new FrameExportUnsupportedError(
                "This audio needs compatibility export.",
              );
            audio.push({ clip, track: audioTrack });
          }
        }
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = preflight.width;
    canvas.height = preflight.height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Could not create an export canvas.");
    ctx.imageSmoothingQuality = settings.quality === "high" ? "high" : "medium";
    const target = new BufferTarget();
    output = new Output({
      format:
        settings.format === "mp4"
          ? new Mp4OutputFormat({ fastStart: "in-memory" })
          : new WebMOutputFormat(),
      target,
    });
    const videoSource = new CanvasSource(canvas, {
      codec: encoding.videoCodec,
      quality: new Quality({ bitrate: preflight.videoBitrate }),
      keyFrameInterval: 2,
      latencyMode: "quality",
      hardwareAcceleration: "no-preference",
    });
    output.addVideoTrack(videoSource, { frameRate: settings.fps });
    const audioSource = audio.length
      ? new AudioBufferSource({
          codec: encoding.audioCodec,
          quality: new Quality({ bitrate: 192_000 }),
        })
      : null;
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();
    callbacks.onStatus?.("Exporting video…");
    const frameCount = Math.ceil(duration * settings.fps);
    const totalSamples = Math.round(duration * EXPORT_SAMPLE_RATE);
    let samplesWritten = 0;
    let lastUpdate = performance.now();
    for (let frame = 0; frame < frameCount; frame++) {
      checkCancelled();
      const time = frame / settings.fps;
      await Promise.all(
        videos.map(async (state) => {
          const clipEnd =
            state.clip.timelineStart + state.clip.timelineDuration;
          if (time >= clipEnd) {
            await state.iterator?.return();
            state.iterator = undefined;
            media.delete(state.clip.id);
            return;
          }
          if (time < state.clip.timelineStart) return;
          if (!state.iterator) {
            const firstFrame = frame;
            function* timestamps() {
              for (
                let index = firstFrame;
                index < frameCount && index / settings.fps < clipEnd;
                index++
              ) {
                yield Math.max(
                  0,
                  state.clip.sourceStart +
                    (index / settings.fps - state.clip.timelineStart) *
                      (state.clip.speed || 1),
                );
              }
            }
            state.iterator = new CanvasSink(state.track, {
              poolSize: 1,
            }).canvasesAtTimestamps(timestamps());
          }
          const next = await state.iterator.next();
          if (!next.done && next.value)
            media.set(state.clip.id, next.value.canvas);
        }),
      );
      renderExportFrame({
        canvas,
        ctx,
        project,
        currentTime: time,
        exportWidth: preflight.width,
        exportHeight: preflight.height,
        mediaElementsMap: media,
      });
      await videoSource.add(time, 1 / settings.fps);
      if (audioSource) {
        const until = Math.min(
          totalSamples,
          Math.round(((frame + 1) / settings.fps) * EXPORT_SAMPLE_RATE),
        );
        while (samplesWritten < until) {
          const length = Math.min(
            Math.floor(EXPORT_SAMPLE_RATE / 4),
            totalSamples - samplesWritten,
          );
          const block = await mixExportAudioBlock(
            audio,
            samplesWritten,
            length,
            project.settings.masterVolume ?? 1,
            checkCancelled,
          );
          await audioSource.add(block);
          samplesWritten += length;
        }
      }
      if (performance.now() - lastUpdate >= 100) {
        callbacks.onProgress(
          time,
          duration,
          Math.round(((frame + 1) / frameCount) * 90),
          "rendering",
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
        lastUpdate = performance.now();
      }
    }
    checkCancelled();
    callbacks.onStatus?.("Finalizing video…");
    videoSource.close();
    audioSource?.close();
    await output.finalize();
    checkCancelled();
    if (!target.buffer)
      throw new Error("The exported video could not be finalized.");
    return new Blob([target.buffer], {
      type: settings.format === "mp4" ? "video/mp4" : "video/webm",
    });
  } finally {
    for (const state of videos) await state.iterator?.return();
    for (const state of audio) await state.iterator?.return();
    if (output && output.state !== "finalized" && output.state !== "canceled")
      await output.cancel();
    for (const input of inputs.values()) input.dispose();
  }
}
