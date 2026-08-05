'use client';

import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import type { TimelineClip } from '@/modules/editor/types';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';

export interface VideoLayerProps {
  clip: TimelineClip;
}

export function VideoLayer({ clip }: VideoLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { playhead, isPlaying } = usePlaybackStore();

  useEffect(() => {
    let isMounted = true;

    async function loadVideoBlob() {
      if (!clip.assetId) return;

      const asset = await db.assets.get(clip.assetId);
      if (!asset || !asset.blobId) return;

      const cached = objectUrlManager.getUrl(asset.blobId);
      if (cached) {
        if (isMounted) setVideoUrl(cached);
        return;
      }

      const blobRecord = await db.blobs.get(asset.blobId);
      if (blobRecord && isMounted) {
        const url = objectUrlManager.createUrl(asset.blobId, blobRecord.blob);
        setVideoUrl(url);
      }
    }

    loadVideoBlob();

    return () => {
      isMounted = false;
    };
  }, [clip.assetId]);

  // Synchronize playback time and play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const targetTime = clip.sourceStart + (playhead - clip.timelineStart) * clip.speed;

    if (Math.abs(video.currentTime - targetTime) > 0.15) {
      video.currentTime = Math.max(0, targetTime);
    }

    video.playbackRate = clip.speed;
    video.volume = clip.audio?.muted ? 0 : (clip.audio?.volume ?? 1);

    if (isPlaying) {
      video.play().catch(() => {
        // Handle autoplay policy restriction if any
      });
    } else {
      video.pause();
    }
  }, [playhead, isPlaying, videoUrl, clip]);

  if (!videoUrl) return null;

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
    <video
      ref={videoRef}
      src={videoUrl}
      controls={false}
      muted={clip.audio?.muted}
      playsInline
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
