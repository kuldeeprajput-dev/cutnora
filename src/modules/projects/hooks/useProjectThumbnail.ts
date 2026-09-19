"use client";

import { useState, useEffect } from "react";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { Project } from "../types";

export function useProjectThumbnail(project: Project): string | null {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadThumb() {
      try {
        const customThumbId = (project as any).thumbnailBlobId;
        if (customThumbId) {
          const cached = objectUrlManager.getUrl(customThumbId);
          if (cached) {
            if (isMounted) setThumbUrl(cached);
            return;
          }
          const thumbRecord = await db.thumbnails.get(customThumbId);
          if (thumbRecord && isMounted) {
            setThumbUrl(
              objectUrlManager.createUrl(customThumbId, thumbRecord.blob),
            );
            return;
          }
        }

        const projectAssets = await db.assets
          .where("projectId")
          .equals(project.id)
          .toArray();
        const visualAsset = projectAssets.find(
          (a) => a.type === "video" || a.type === "image",
        );

        if (visualAsset) {
          if (visualAsset.thumbnailBlobId) {
            const cached = objectUrlManager.getUrl(visualAsset.thumbnailBlobId);
            if (cached) {
              if (isMounted) setThumbUrl(cached);
              return;
            }
            const thumbRecord = await db.thumbnails.get(
              visualAsset.thumbnailBlobId,
            );
            if (thumbRecord && isMounted) {
              setThumbUrl(
                objectUrlManager.createUrl(
                  visualAsset.thumbnailBlobId,
                  thumbRecord.blob,
                ),
              );
              return;
            }
          }

          if (visualAsset.blobId) {
            const cached = objectUrlManager.getUrl(visualAsset.blobId);
            if (cached) {
              if (isMounted) setThumbUrl(cached);
              return;
            }
            const thumbRecord = await db.thumbnails.get(visualAsset.blobId);
            if (thumbRecord && isMounted) {
              setThumbUrl(
                objectUrlManager.createUrl(
                  visualAsset.blobId,
                  thumbRecord.blob,
                ),
              );
              return;
            }
            const blobRecord = await db.blobs.get(visualAsset.blobId);
            if (blobRecord && isMounted) {
              setThumbUrl(
                objectUrlManager.createUrl(visualAsset.blobId, blobRecord.blob),
              );
              return;
            }
          }
        }

        for (const track of project.tracks) {
          for (const clip of track.clips) {
            if (clip.assetId) {
              const asset = await db.assets.get(clip.assetId);
              if (asset && (asset.type === "video" || asset.type === "image")) {
                if (asset.thumbnailBlobId) {
                  const cached = objectUrlManager.getUrl(asset.thumbnailBlobId);
                  if (cached) {
                    if (isMounted) setThumbUrl(cached);
                    return;
                  }
                  const thumbRecord = await db.thumbnails.get(
                    asset.thumbnailBlobId,
                  );
                  if (thumbRecord && isMounted) {
                    setThumbUrl(
                      objectUrlManager.createUrl(
                        asset.thumbnailBlobId,
                        thumbRecord.blob,
                      ),
                    );
                    return;
                  }
                }
                if (asset.blobId) {
                  const cached = objectUrlManager.getUrl(asset.blobId);
                  if (cached) {
                    if (isMounted) setThumbUrl(cached);
                    return;
                  }
                  const blobRecord = await db.blobs.get(asset.blobId);
                  if (blobRecord && isMounted) {
                    setThumbUrl(
                      objectUrlManager.createUrl(asset.blobId, blobRecord.blob),
                    );
                    return;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed loading project thumbnail:", err);
      }
    }

    loadThumb();

    return () => {
      isMounted = false;
    };
  }, [project]);

  return thumbUrl;
}
