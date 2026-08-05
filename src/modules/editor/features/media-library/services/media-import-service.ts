import { nanoid } from 'nanoid';
import { db, type StoredBlob, type StoredThumbnail } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import type { MediaAsset } from '@/modules/projects/types';

export interface ImportResult {
  asset: MediaAsset;
  blobUrl: string;
  thumbnailUrl?: string;
}

export function detectAssetType(mimeType: string, filename: string): 'video' | 'image' | 'audio' | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'mkv'].includes(ext || '')) {
    return 'video';
  }
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) {
    return 'image';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext || '')) {
    return 'audio';
  }
  return null;
}

export async function processAndStoreMediaFile(file: File, projectId: string): Promise<ImportResult> {
  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty (0 bytes).`);
  }

  const assetType = detectAssetType(file.type, file.name);
  if (!assetType) {
    throw new Error(`Unsupported file format for "${file.name}".`);
  }

  const blobId = nanoid();
  const thumbnailBlobId = assetType === 'audio' ? undefined : nanoid();
  const tempUrl = URL.createObjectURL(file);

  try {
    let width: number | undefined;
    let height: number | undefined;
    let duration = 5; // Default 5s for images
    let thumbnailBlob: Blob | undefined;
    let waveformPeaks: number[] | undefined;

    if (assetType === 'video') {
      const metadata = await extractVideoMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = metadata.duration;
      thumbnailBlob = await generateVideoThumbnail(tempUrl, metadata.duration);
    } else if (assetType === 'image') {
      const metadata = await extractImageMetadata(tempUrl);
      width = metadata.width;
      height = metadata.height;
      duration = 5;
      thumbnailBlob = await generateImageThumbnail(tempUrl);
    } else if (assetType === 'audio') {
      const metadata = await extractAudioMetadata(tempUrl);
      duration = metadata.duration;
      waveformPeaks = generateDummyWaveformPeaks(60);
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
      metadataStatus: 'ready',
    };

    await db.assets.put(asset);

    // Register persistent Object URLs
    const persistentBlobUrl = objectUrlManager.createUrl(blobId, file);
    let persistentThumbnailUrl: string | undefined;
    if (thumbnailBlobId && thumbnailBlob) {
      persistentThumbnailUrl = objectUrlManager.createUrl(thumbnailBlobId, thumbnailBlob);
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

function getFallbackMimeType(type: 'video' | 'image' | 'audio'): string {
  switch (type) {
    case 'video':
      return 'video/mp4';
    case 'image':
      return 'image/png';
    case 'audio':
      return 'audio/mpeg';
  }
}

function extractVideoMetadata(videoUrl: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Video metadata reading timed out.'));
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
      reject(new Error('Failed to load video file format.'));
    };
  });
}

function extractImageMetadata(imageUrl: string): Promise<{ width: number; height: number }> {
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
      reject(new Error('Failed to load image file.'));
    };
  });
}

function extractAudioMetadata(audioUrl: string): Promise<{ duration: number }> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
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

function generateVideoThumbnail(videoUrl: string, duration: number): Promise<Blob> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = videoUrl;

    const seekTime = Math.min(0.5, duration / 2);
    video.currentTime = seekTime;

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 144;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/jpeg', 0.8);
    };

    video.onerror = () => {
      resolve(createFallbackThumbnailBlob());
    };
  });
}

function generateImageThumbnail(imageUrl: string): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 144;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/jpeg', 0.8);
    };

    img.onerror = () => {
      resolve(createFallbackThumbnailBlob());
    };
  });
}

function createFallbackThumbnailBlob(): Blob {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 144;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1D2027';
    ctx.fillRect(0, 0, 256, 144);
    ctx.fillStyle = '#FF5A36';
    ctx.font = '14px sans-serif';
    ctx.fillText('Media Asset', 80, 75);
  }
  let fallbackBlob = new Blob();
  canvas.toBlob((b) => {
    if (b) fallbackBlob = b;
  }, 'image/jpeg');
  return fallbackBlob;
}

function generateDummyWaveformPeaks(count: number): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    peaks.push(Math.round((0.2 + Math.random() * 0.8) * 100) / 100);
  }
  return peaks;
}
