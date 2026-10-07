import type { Project } from "@/modules/projects/types";
import type { ExportSettings } from "./exportService";
import type { FrameEncodingSupport } from "./frame-exporter";
import { getStorageCapacity } from "@/modules/core/storage/opfs-media-storage";
import { db } from "@/modules/core/db/database";

import {
  getExportAudioBitrate,
  getExportDimensions,
  getExportVideoBitrate,
  hasExportAudio,
} from "./export-settings";

const LONG_DURATION_SECONDS = 30 * 60;
const LONG_OUTPUT_BYTES = 512 * 1024 * 1024;

export type ExportDestinationStrategy = "memory" | "opfs";

export interface ExportPreflightResult {
  isLongExport: boolean;
  isMobileBlocked: boolean;
  mimeType: string;
  extension: "webm" | "mp4";
  requiresMp4Conversion: boolean;
  estimatedBytes: number;
  availableStorage?: number;
  hasEnoughStorage: boolean;
  destinationStrategy: ExportDestinationStrategy;
  width: number;
  height: number;
  videoBitrate: number;
  audioBitrate: number;
  hasAudio: boolean;
  blockingReason: string | null;
  frameEncoding: FrameEncodingSupport | null;
}

export function getNativeExportMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
  ];
  return (
    candidates.find((type) => MediaRecorder.isTypeSupported(type)) ||
    "video/webm"
  );
}

export function getNativeMp4MimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || null;
}

export function estimateExportBytes(
  duration: number,
  videoBitrate: number,
  audioBitrate: number,
): number {
  // Container overhead (EBML / MP4 boxes) is ~1.5%
  return Math.ceil(((videoBitrate + audioBitrate) * duration * 1.015) / 8);
}

async function loadTimelineVideoAssets(project: Project, duration: number) {
  const ids = new Set<string>();
  for (const track of project.tracks) {
    if (track.hidden) continue;
    for (const clip of track.clips) {
      if (
        clip.type === "video" &&
        clip.assetId &&
        clip.timelineStart < duration &&
        clip.timelineStart + clip.timelineDuration > 0
      )
        ids.add(clip.assetId);
    }
  }
  return ids.size ? db.assets.bulkGet([...ids]) : [];
}

export async function buildExportPreflight(
  project: Project,
  settings: ExportSettings,
  allowFrameEncoding = true,
): Promise<ExportPreflightResult> {
  const duration = Math.max(0.5, project.settings.duration);
  const { width, height } = getExportDimensions(project, settings.resolution);
  const videoAssets = await loadTimelineVideoAssets(project, duration);
  const videoBitrate = getExportVideoBitrate(
    width,
    height,
    settings.fps,
    settings.quality,
    videoAssets,
  );
  const hasAudio = hasExportAudio(project);
  const audioBitrate = getExportAudioBitrate(hasAudio, settings.quality);

  // Frame encoding renders every frame at its exact timestamp offline,
  // guaranteeing buttery-smooth playback at the requested FPS without dropped frames.
  const frameEncoding = allowFrameEncoding
    ? await (
        await import("./frame-exporter")
      ).getFrameEncodingSupport(settings, width, height, videoBitrate, hasAudio)
    : null;

  const estimatedBytes = estimateExportBytes(
    duration,
    videoBitrate,
    audioBitrate,
  );
  const isLongExport =
    duration > LONG_DURATION_SECONDS || estimatedBytes > LONG_OUTPUT_BYTES;
  const nativeMp4 = getNativeMp4MimeType();
  const mimeType = frameEncoding
    ? settings.format === "mp4"
      ? "video/mp4"
      : "video/webm"
    : !isLongExport && settings.format === "mp4" && nativeMp4
      ? nativeMp4
      : getNativeExportMimeType();
  const requiresMp4Conversion =
    !frameEncoding &&
    !isLongExport &&
    settings.format === "mp4" &&
    !mimeType.startsWith("video/mp4");
  const extension =
    frameEncoding || settings.format === "mp4"
      ? settings.format
      : mimeType.startsWith("video/mp4")
        ? "mp4"
        : "webm";
  const destinationStrategy: ExportDestinationStrategy = isLongExport
    ? "opfs"
    : "memory";
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;
  const storage = await getStorageCapacity(false);
  const requiredStorage = Math.ceil(estimatedBytes * 1.1);
  const hasEnoughStorage =
    storage.available === undefined || storage.available >= requiredStorage;

  const canRecord =
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype &&
    MediaRecorder.isTypeSupported(mimeType);

  const blockingReason =
    isLongExport && isMobile
      ? "For this export size, use a desktop browser."
      : !hasEnoughStorage
        ? "Not enough local storage for this export."
        : !frameEncoding && !canRecord
          ? "This browser cannot export this format. Try another format or an updated browser."
          : settings.format === "webm" && extension !== "webm"
            ? "WebM is unavailable in this browser. Choose MP4."
            : null;

  return {
    frameEncoding,
    isLongExport,
    isMobileBlocked: isLongExport && isMobile,
    mimeType,
    extension,
    estimatedBytes,
    requiresMp4Conversion,
    availableStorage: storage.available,
    hasEnoughStorage,
    destinationStrategy,
    width,
    height,
    videoBitrate,
    audioBitrate,
    hasAudio,
    blockingReason,
  };
}
