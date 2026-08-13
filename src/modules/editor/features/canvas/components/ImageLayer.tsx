"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/modules/core/db/database";
import { resolveMediaAssetUrl } from "@/modules/core/storage/media-source-service";
import type { TimelineClip } from "@/modules/editor/types";

export interface ImageLayerProps {
  clip: TimelineClip;
}

export function ImageLayer({ clip }: ImageLayerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImageBlob() {
      if (!clip.assetId) return;

      const asset = await db.assets.get(clip.assetId);
      if (!asset) return;

      if (asset.remoteUrl) {
        if (isMounted) setImageUrl(asset.remoteUrl);
        return;
      }

      const url = await resolveMediaAssetUrl(asset);
      if (isMounted) setImageUrl(url);
    }

    loadImageBlob();

    return () => {
      isMounted = false;
    };
  }, [clip.assetId]);

  if (!imageUrl) return null;

  const { transform, adjustments } = clip;
  const objectFit =
    transform.fitMode === "cover"
      ? "cover"
      : transform.fitMode === "fill"
        ? "fill"
        : "contain";

  const filterStyle = `
    brightness(${adjustments.brightness})
    contrast(${adjustments.contrast})
    saturate(${adjustments.saturation})
    blur(${adjustments.blur}px)
    grayscale(${adjustments.grayscale})
    sepia(${adjustments.sepia})
  `;

  const clipPathStyle = transform.crop
    ? `inset(${transform.crop.top}% ${transform.crop.right}% ${transform.crop.bottom}% ${transform.crop.left}%)`
    : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={clip.name}
      className="h-full w-full pointer-events-none"
      style={{
        objectFit,
        opacity: transform.opacity,
        filter: filterStyle,
        clipPath: clipPathStyle,
        transform: `scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
      }}
    />
  );
}
