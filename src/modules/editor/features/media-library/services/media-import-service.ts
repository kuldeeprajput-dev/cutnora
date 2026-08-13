import { nanoid } from "nanoid";
import {
  db,
  type StoredBlob,
  type StoredThumbnail,
} from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { MediaAsset } from "@/modules/projects/types";
import { extractAudioPeaks } from "@/modules/editor/features/audio/utils/audio-peaks";
import {
  assertStorageCapacity,
  createMediaOpfsPath,
  deleteOpfsFile,
  supportsOpfs,
  writeFileToOpfs,
} from "@/modules/core/storage/opfs-media-storage";
import { resolveMediaAssetBlob } from "@/modules/core/storage/media-source-service";

export interface ImportResult {
  asset: MediaAsset;
  blobUrl: string;
  thumbnailUrl?: string;
}

export type ImportPhase =
  "validating" | "copying" | "analyzing" | "ready" | "error";

export interface ImportProgress {
  phase: ImportPhase;
  fileName: string;
  bytesProcessed: number;
  totalBytes: number;
  percentage: number;
}

export interface ImportOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ImportProgress) => void;
}

const THUMBNAIL_WIDTH = 640;
const THUMBNAIL_HEIGHT = 360;
const IMAGE_THUMBNAIL_RENDER_VERSION = 2;
const INDEXEDDB_FALLBACK_LIMIT = 256 * 1024 * 1024;
const WAVEFORM_SIZE_LIMIT = 128 * 1024 * 1024;
const WAVEFORM_DURATION_LIMIT = 20 * 60;
const verifiedThumbnailIds = new Set<string>();

export function detectAssetType(
  mimeType: string,
  filename: string,
): "video" | "image" | "audio" | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (
    mimeType.startsWith("video/") ||
    ["mp4", "webm", "mov", "m4v", "mkv"].includes(ext || "")
  ) {
    return "video";
  }
  if (
    mimeType.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "")
  ) {
    return "image";
  }
  if (
    mimeType.startsWith("audio/") ||
    ["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext || "")
  ) {
    return "audio";
  }
  return null;
}

export async function processAndStoreMediaFile(
  file: File,
  projectId: string,
  options: ImportOptions = {},
): Promise<ImportResult> {
  const report = (phase: ImportPhase, percentage: number, bytesProcessed = 0) =>
    options.onProgress?.({
      phase,
      fileName: file.name,
      bytesProcessed,
      totalBytes: file.size,
      percentage,
    });

  report("validating", 0);
  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty (0 bytes).`);
  }

  const assetType = detectAssetType(file.type, file.name);
  if (!assetType) {
    throw new Error(`Unsupported file format for "${file.name}".`);
  }

  if (options.signal?.aborted) {
    throw new DOMException("Import cancelled", "AbortError");
  }

  const assetId = nanoid();
  const blobId = assetId;
  const thumbnailBlobId = assetType === "audio" ? undefined : nanoid();
  const useOpfs = supportsOpfs();
  if (!useOpfs && file.size > INDEXEDDB_FALLBACK_LIMIT) {
    throw new Error(
      "This browser cannot store files over 256 MB locally. Use a current browser with OPFS support.",
    );
  }

  let opfsPath: string | undefined;
  if (useOpfs) {
    await assertStorageCapacity(file.size);
    opfsPath = createMediaOpfsPath(projectId, assetId);
    report("copying", 1);
    await writeFileToOpfs(opfsPath, file, {
      signal: options.signal,
      onProgress: ({ bytesWritten, totalBytes }) => {
        const percentage =
          totalBytes > 0
            ? 1 + Math.round((bytesWritten / totalBytes) * 74)
            : 75;
        report("copying", percentage, bytesWritten);
      },
    });
  }

  const tempUrl = URL.createObjectURL(file);

  try {
    report("analyzing", 78, file.size);
    let width: number | undefined;
    let height: number | undefined;
    let duration = 5; // Default 5s for images
    let thumbnailBlob: Blob | undefined;
    let waveformPeaks: number[] | undefined;
    let waveformStatus: MediaAsset["waveformStatus"];

    if (assetType === "video") {
      const metadata = await extractVideoMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = metadata.duration;
      thumbnailBlob = await generateVideoThumbnail(tempUrl, metadata.duration);
      if (
        file.size <= WAVEFORM_SIZE_LIMIT &&
        duration <= WAVEFORM_DURATION_LIMIT
      ) {
        waveformPeaks = await extractAudioPeaks(file, 200);
        waveformStatus = "ready";
      } else {
        waveformStatus = "deferred";
      }
    } else if (assetType === "image") {
      const metadata = await extractImageMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = 5;
      thumbnailBlob = await generateImageThumbnail(tempUrl);
    } else if (assetType === "audio") {
      const metadata = await extractAudioMetadata(tempUrl);
      duration = metadata.duration;
      if (
        file.size <= WAVEFORM_SIZE_LIMIT &&
        duration <= WAVEFORM_DURATION_LIMIT
      ) {
        waveformPeaks = await extractAudioPeaks(file, 200);
        waveformStatus = "ready";
      } else {
        waveformStatus = "deferred";
      }
    }

    report("analyzing", 92, file.size);
    if (!useOpfs) {
      const storedBlob: StoredBlob = {
        id: blobId,
        blob: file,
        mimeType: file.type || getFallbackMimeType(assetType),
        createdAt: Date.now(),
      };
      await db.blobs.put(storedBlob);
    }

    if (thumbnailBlobId && thumbnailBlob) {
      const storedThumbnail: StoredThumbnail = {
        id: thumbnailBlobId,
        blob: thumbnailBlob,
        createdAt: Date.now(),
        renderVersion:
          assetType === "image" ? IMAGE_THUMBNAIL_RENDER_VERSION : 1,
      };
      await db.thumbnails.put(storedThumbnail);
    }

    const asset: MediaAsset = {
      id: assetId,
      projectId,
      type: assetType,
      name: file.name,
      mimeType: file.type || getFallbackMimeType(assetType),
      size: file.size,
      duration: Math.max(0.1, duration),
      width,
      height,
      createdAt: Date.now(),
      blobId,
      source: opfsPath
        ? { kind: "opfs", path: opfsPath }
        : { kind: "indexeddb", blobId },
      thumbnailBlobId,
      waveformPeaks,
      waveformStatus,
      metadataStatus: "ready",
    };

    await db.assets.put(asset);

    const mediaUrlKey = opfsPath ? "opfs:" + opfsPath : blobId;
    const persistentBlobUrl = objectUrlManager.createUrl(mediaUrlKey, file);
    let persistentThumbnailUrl: string | undefined;
    if (thumbnailBlobId && thumbnailBlob) {
      persistentThumbnailUrl = objectUrlManager.createUrl(
        thumbnailBlobId,
        thumbnailBlob,
      );
    }

    report("ready", 100, file.size);
    return {
      asset,
      blobUrl: persistentBlobUrl,
      thumbnailUrl: persistentThumbnailUrl,
    };
  } catch (error) {
    report("error", 0);
    if (opfsPath) await deleteOpfsFile(opfsPath).catch(() => undefined);
    await Promise.all([
      db.assets.delete(assetId),
      db.blobs.delete(blobId),
      thumbnailBlobId
        ? db.thumbnails.delete(thumbnailBlobId)
        : Promise.resolve(),
    ]).catch(() => undefined);
    objectUrlManager.revokeUrl(opfsPath ? "opfs:" + opfsPath : blobId);
    throw error;
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}
export async function ensureHighQualityThumbnail(
  asset: MediaAsset,
): Promise<Blob | null> {
  if (
    asset.type === "audio" ||
    !asset.thumbnailBlobId ||
    !asset.blobId ||
    asset.remoteUrl
  ) {
    return null;
  }

  const existing = await db.thumbnails.get(asset.thumbnailBlobId);
  const needsImageContainUpgrade =
    asset.type === "image" &&
    existing?.renderVersion !== IMAGE_THUMBNAIL_RENDER_VERSION;
  if (
    existing &&
    !needsImageContainUpgrade &&
    verifiedThumbnailIds.has(asset.thumbnailBlobId)
  ) {
    return existing.blob;
  }

  if (existing && !needsImageContainUpgrade) {
    const dimensions = await readBlobImageDimensions(existing.blob);
    if (
      dimensions &&
      dimensions.width >= THUMBNAIL_WIDTH &&
      dimensions.height >= THUMBNAIL_HEIGHT
    ) {
      verifiedThumbnailIds.add(asset.thumbnailBlobId);
      return existing.blob;
    }
  }

  const original = await resolveMediaAssetBlob(asset).catch(() => null);
  if (!original) return existing?.blob ?? null;

  const sourceUrl = URL.createObjectURL(original);
  try {
    const upgraded =
      asset.type === "video"
        ? await generateVideoThumbnail(sourceUrl, asset.duration)
        : await generateImageThumbnail(sourceUrl);

    if (!upgraded.size) return existing?.blob ?? null;

    await db.thumbnails.put({
      id: asset.thumbnailBlobId,
      blob: upgraded,
      createdAt: Date.now(),
      renderVersion:
        asset.type === "image" ? IMAGE_THUMBNAIL_RENDER_VERSION : 1,
    });
    objectUrlManager.revokeUrl(asset.thumbnailBlobId);
    verifiedThumbnailIds.add(asset.thumbnailBlobId);
    return upgraded;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function readBlobImageDimensions(
  blob: Blob,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    const cleanup = () => URL.revokeObjectURL(url);

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      cleanup();
      resolve(dimensions);
    };
    image.onerror = () => {
      cleanup();
      resolve(null);
    };
    image.src = url;
  });
}

function getFallbackMimeType(type: "video" | "image" | "audio"): string {
  switch (type) {
    case "video":
      return "video/mp4";
    case "image":
      return "image/png";
    case "audio":
      return "audio/mpeg";
  }
}

function extractVideoMetadata(
  videoUrl: string,
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = videoUrl;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Video metadata reading timed out."));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = () => {
      cleanup();
      resolve({
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        duration: isFinite(video.duration) ? video.duration : 10,
      });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video file format."));
    };
  });
}

function extractImageMetadata(
  imageUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      resolve({
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image file."));
    };
  });
}

function extractAudioMetadata(audioUrl: string): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = audioUrl;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Audio metadata reading timed out."));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      audio.onloadedmetadata = null;
      audio.onerror = null;
    };

    audio.onloadedmetadata = () => {
      cleanup();
      resolve({
        duration: isFinite(audio.duration) ? audio.duration : 10,
      });
    };

    audio.onerror = () => {
      cleanup();
      reject(
        new Error("This browser cannot decode the selected audio format."),
      );
    };
  });
}

function drawCoverThumbnail(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;
  let sourceX = 0;
  let sourceY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
    sourceX = (sourceWidth - cropWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    cropHeight = sourceWidth / targetRatio;
    sourceY = (sourceHeight - cropHeight) / 2;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    THUMBNAIL_WIDTH,
    THUMBNAIL_HEIGHT,
  );
}

function drawContainThumbnail(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const scale = Math.min(
    THUMBNAIL_WIDTH / sourceWidth,
    THUMBNAIL_HEIGHT / sourceHeight,
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (THUMBNAIL_WIDTH - width) / 2;
  const y = (THUMBNAIL_HEIGHT - height) / 2;

  ctx.clearRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, x, y, width, height);
}

function canvasToThumbnailBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || new Blob()), "image/webp", 0.92);
  });
}

function generateVideoThumbnail(
  videoUrl: string,
  duration: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (ctx && video.videoWidth && video.videoHeight) {
        drawCoverThumbnail(ctx, video, video.videoWidth, video.videoHeight);
      }
      void canvasToThumbnailBlob(canvas).then(resolve);
    };

    video.onerror = () => {
      void createFallbackThumbnailBlob().then(resolve);
    };
  });
}

function generateImageThumbnail(imageUrl: string): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (ctx && img.naturalWidth && img.naturalHeight) {
        drawContainThumbnail(ctx, img, img.naturalWidth, img.naturalHeight);
      }
      void canvasToThumbnailBlob(canvas).then(resolve);
    };

    img.onerror = () => {
      void createFallbackThumbnailBlob().then(resolve);
    };
  });
}

function createFallbackThumbnailBlob(): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1D2027";
    ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    ctx.fillStyle = "#FF5A36";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Media Asset", THUMBNAIL_WIDTH / 2, THUMBNAIL_HEIGHT / 2);
  }
  return canvasToThumbnailBlob(canvas);
}
