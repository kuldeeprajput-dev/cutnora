import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import { getOpfsFile } from "./opfs-media-storage";
import type { MediaAsset, MediaSourceRef } from "@/modules/projects/types";

export function getMediaSourceRef(asset: MediaAsset): MediaSourceRef {
  if (asset.source) return asset.source;
  if (asset.remoteUrl) return { kind: "remote", url: asset.remoteUrl };
  return { kind: "indexeddb", blobId: asset.blobId };
}

export async function resolveMediaAssetBlob(asset: MediaAsset): Promise<Blob> {
  const source = getMediaSourceRef(asset);
  if (source.kind === "opfs") return getOpfsFile(source.path);
  if (source.kind === "indexeddb") {
    const record = await db.blobs.get(source.blobId);
    if (!record)
      throw new Error('Local media for "' + asset.name + '" is missing.');
    if (!asset.source) {
      void db.assets.update(asset.id, { source }).catch(() => undefined);
    }
    return record.blob;
  }
  throw new Error("Remote media does not have a local Blob.");
}

export async function resolveMediaAssetUrl(asset: MediaAsset): Promise<string> {
  const source = getMediaSourceRef(asset);
  if (source.kind === "remote") return source.url;

  const key = source.kind === "opfs" ? "opfs:" + source.path : source.blobId;
  const cached = objectUrlManager.getUrl(key);
  if (cached) return cached;
  const blob = await resolveMediaAssetBlob(asset);
  return objectUrlManager.createUrl(key, blob);
}

export function revokeMediaAssetUrl(asset: MediaAsset): void {
  const source = getMediaSourceRef(asset);
  if (source.kind === "remote") return;
  objectUrlManager.revokeUrl(
    source.kind === "opfs" ? "opfs:" + source.path : source.blobId,
  );
}

export async function mediaAssetSourceExists(
  asset: MediaAsset,
): Promise<boolean> {
  const source = getMediaSourceRef(asset);
  if (source.kind === "remote") return true;
  try {
    await resolveMediaAssetBlob(asset);
    return true;
  } catch {
    return false;
  }
}
