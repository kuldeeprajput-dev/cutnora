import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { MediaAsset } from "@/modules/projects/types";
import { deleteOpfsFile } from "./opfs-media-storage";
import { getMediaSourceRef, revokeMediaAssetUrl } from "./media-source-service";

export async function deleteStoredMediaAsset(asset: MediaAsset): Promise<void> {
  const source = getMediaSourceRef(asset);

  await db.transaction("rw", db.assets, db.blobs, db.thumbnails, async () => {
    await db.assets.delete(asset.id);
    if (source.kind === "indexeddb") await db.blobs.delete(source.blobId);
    if (asset.thumbnailBlobId)
      await db.thumbnails.delete(asset.thumbnailBlobId);
  });

  if (source.kind === "opfs") {
    await deleteOpfsFile(source.path).catch((error) => {
      console.warn("Could not remove orphaned OPFS media:", error);
    });
  }

  revokeMediaAssetUrl(asset);
  if (asset.thumbnailBlobId) objectUrlManager.revokeUrl(asset.thumbnailBlobId);
}
