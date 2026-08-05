'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import type { TimelineClip } from '@/modules/editor/types';

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
      if (!asset || !asset.blobId) return;

      const cached = objectUrlManager.getUrl(asset.blobId);
      if (cached) {
        if (isMounted) setImageUrl(cached);
        return;
      }

      const blobRecord = await db.blobs.get(asset.blobId);
      if (blobRecord && isMounted) {
        const url = objectUrlManager.createUrl(asset.blobId, blobRecord.blob);
        setImageUrl(url);
      }
    }

    loadImageBlob();

    return () => {
      isMounted = false;
    };
  }, [clip.assetId]);

  if (!imageUrl) return null;

  const { transform, adjustments } = clip;
  const objectFit = transform.fitMode === 'cover' ? 'cover' : transform.fitMode === 'fill' ? 'fill' : 'contain';

  const filterStyle = `
    brightness(${adjustments.brightness})
    contrast(${adjustments.contrast})
    saturate(${adjustments.saturation})
    blur(${adjustments.blur}px)
    grayscale(${adjustments.grayscale})
    sepia(${adjustments.sepia})
  `;

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
        transform: `scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
      }}
    />
  );
}
