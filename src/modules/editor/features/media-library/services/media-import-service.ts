import { nanoid } from "nanoid";
import {
  db,
  type StoredBlob,
  type StoredThumbnail,
} from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { MediaAsset } from "@/modules/projects/types";
import { extractAudioPeaks } from "@/modules/editor/features/audio/utils/audio-peaks";

export interface ImportResult {
  asset: MediaAsset;
  blobUrl: string;
  thumbnailUrl?: string;
}

const THUMBNAIL_WIDTH = 640;
const THUMBNAIL_HEIGHT = 360;
const IMAGE_THUMBNAIL_RENDER_VERSION = 2;
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
): Promise<ImportResult> {
  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty (0 bytes).`);
  }

  const assetType = detectAssetType(file.type, file.name);
  if (!assetType) {
    throw new Error(`Unsupported file format for "${file.name}".`);
  }

  const blobId = nanoid();
  const thumbnailBlobId = assetType === "audio" ? undefined : nanoid();
  const tempUrl = URL.createObjectURL(file);

  try {
    let width: number | undefined;
    let height: number | undefined;
    let duration = 5; // Default 5s for images
    let thumbnailBlob: Blob | undefined;
    let waveformPeaks: number[] | undefined;

    if (assetType === "video") {
      const metadata = await extractVideoMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = metadata.duration;
      thumbnailBlob = await generateVideoThumbnail(tempUrl, metadata.duration);
      waveformPeaks = await extractAudioPeaks(file, 200);
    } else if (assetType === "image") {
      const metadata = await extractImageMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = 5;
      thumbnailBlob = await generateImageThumbnail(tempUrl);
    } else if (assetType === "audio") {
      const metadata = await extractAudioMetadata(tempUrl);
      duration = metadata.duration;
      waveformPeaks = await extractAudioPeaks(file, 200);
    }

    // Save main Blob to IndexedDB
    const storedBlob: StoredBlob = {
      id: blobId,
      blob: file,
      mimeType: file.type || getFallbackMimeType(assetType),
      createdAt: Date.now(),
    };
    await db.blobs.put(storedBlob);

    // Save thumbnail Blob if generated
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
      id: nanoid(),
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
      thumbnailBlobId,
      waveformPeaks,
      metadataStatus: "ready",
    };

    await db.assets.put(asset);

    // Register persistent Object URLs
    const persistentBlobUrl = objectUrlManager.createUrl(blobId, file);
    let persistentThumbnailUrl: string | undefined;
    if (thumbnailBlobId && thumbnailBlob) {
      persistentThumbnailUrl = objectUrlManager.createUrl(
        thumbnailBlobId,
        thumbnailBlob,
      );
    }

    return {
      asset,
      blobUrl: persistentBlobUrl,
      thumbnailUrl: persistentThumbnailUrl,
    };
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}
export async function ensureHighQualityThumbnail(
  asset: Pick<
    MediaAsset,
    "type" | "thumbnailBlobId" | "blobId" | "remoteUrl" | "duration"
  >,
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

  const original = await db.blobs.get(asset.blobId);
  if (!original) return existing?.blob ?? null;

  const sourceUrl = URL.createObjectURL(original.blob);
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
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = audioUrl;

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ duration: 10 });
    }, 5000);

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
      resolve({ duration: 10 });
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
