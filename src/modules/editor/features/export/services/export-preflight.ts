import type { Project } from "@/modules/projects/types";
import type { ExportSettings } from "./exportService";
import { getStorageCapacity } from "@/modules/core/storage/opfs-media-storage";

import {
  getExportDimensions,
  getExportVideoBitrate,
  hasExportAudio,
} from "./export-settings";

const LONG_DURATION_SECONDS = 30 * 60;
const LONG_OUTPUT_BYTES = 512 * 1024 * 1024;
const AUDIO_BITRATE = 192_000;

export type ExportDestinationStrategy = "memory" | "direct-file" | "opfs";

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
  hasAudio: boolean;
  blockingReason: string | null;
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
  hasAudio: boolean,
): number {
  return Math.ceil(
    ((videoBitrate + (hasAudio ? AUDIO_BITRATE : 0)) * duration * 1.2) / 8,
  );
}

export async function buildExportPreflight(
  project: Project,
  settings: ExportSettings,
): Promise<ExportPreflightResult> {
  const duration = Math.max(0.5, project.settings.duration);
  const { width, height } = getExportDimensions(project, settings.resolution);
  const videoBitrate = getExportVideoBitrate(
    width,
    height,
    settings.fps,
    settings.quality,
  );
  const hasAudio = hasExportAudio(project);
  const estimatedBytes = estimateExportBytes(duration, videoBitrate, hasAudio);
  const isLongExport =
    duration > LONG_DURATION_SECONDS || estimatedBytes > LONG_OUTPUT_BYTES;
  const nativeMp4 = getNativeMp4MimeType();
  const mimeType =
    !isLongExport && settings.format === "mp4" && nativeMp4
      ? nativeMp4
      : getNativeExportMimeType();
  const requiresMp4Conversion =
    !isLongExport &&
    settings.format === "mp4" &&
    !mimeType.startsWith("video/mp4");
  const extension = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
  const hasDirectFile =
    typeof window !== "undefined" && "showSaveFilePicker" in window;
  const destinationStrategy: ExportDestinationStrategy = isLongExport
    ? hasDirectFile
      ? "direct-file"
      : "opfs"
    : "memory";
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;
  const storage = await getStorageCapacity(false);
  const requiredStorage = Math.ceil(estimatedBytes * 1.1);
  const hasEnoughStorage =
    destinationStrategy === "direct-file" ||
    storage.available === undefined ||
    storage.available >= requiredStorage;

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
        : !canRecord
          ? "This browser cannot export this format. Try another format or an updated browser."
          : settings.format === "webm" && extension !== "webm"
            ? "WebM is unavailable in this browser. Choose MP4."
            : null;

  return {
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
    hasAudio,
    blockingReason,
  };
}
