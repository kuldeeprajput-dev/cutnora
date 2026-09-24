"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import { resolveMediaAssetUrl } from "@/modules/core/storage/media-source-service";
import type { TimelineClip } from "@/modules/editor/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";

export interface VideoLayerProps {
  clip: TimelineClip;
  trackMuted?: boolean;
}

export function VideoLayer({ clip, trackMuted = false }: VideoLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const { playhead, isPlaying } = usePlaybackStore();
  const asset = useLiveQuery(
    () => (clip.assetId ? db.assets.get(clip.assetId) : undefined),
    [clip.assetId],
    null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadVideoBlob() {
      if (!asset) return;

      if (asset.remotePreviewUrl) {
        if (isMounted) setPosterUrl(asset.remotePreviewUrl);
      } else if (asset.thumbnailBlobId) {
        const cachedPoster = objectUrlManager.getUrl(asset.thumbnailBlobId);
        if (cachedPoster) {
          if (isMounted) setPosterUrl(cachedPoster);
        } else {
          const thumbnail = await db.thumbnails.get(asset.thumbnailBlobId);
          if (thumbnail?.blob && isMounted) {
            setPosterUrl(
              objectUrlManager.createUrl(asset.thumbnailBlobId, thumbnail.blob),
            );
          }
        }
      }

      const url = await resolveMediaAssetUrl(asset);
      if (isMounted) setVideoUrl(url);
    }

    void loadVideoBlob();

    return () => {
      isMounted = false;
    };
  }, [asset, clip.assetId]);

  const wasPlayingRef = useRef(false);
  const lastPlayheadRef = useRef<number | null>(null);

  // Synchronize playback time and play/pause state without video decoding stutters
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const speed = clip.speed || 1;
    const isMuted = trackMuted || clip.audio?.muted;
    video.playbackRate = speed;
    video.muted = isMuted;
    video.volume = isMuted ? 0 : (clip.audio?.volume ?? 1);

    const targetTime = Math.max(
      0,
      clip.sourceStart + (playhead - clip.timelineStart) * speed,
    );

    const safeTarget = Number.isFinite(video.duration) && video.duration > 0
      ? Math.min(targetTime, Math.max(0, video.duration - 0.005))
      : targetTime;

    const prevPlaying = wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;

    const prevPlayhead = lastPlayheadRef.current;
    lastPlayheadRef.current = playhead;

    const isManualSeek =
      prevPlayhead !== null &&
      Math.abs(playhead - prevPlayhead) > 0.35 * speed;

    try {
      if (isPlaying) {
        if (!prevPlaying || video.paused || isManualSeek) {
          if (Math.abs(video.currentTime - safeTarget) > 0.05) {
            video.currentTime = safeTarget;
          }
          void video.play().catch(() => {});
        } else {
          // While actively playing, only resynchronize if drift > 0.8s
          const drift = Math.abs(video.currentTime - safeTarget);
          if (drift > 0.8) {
            video.currentTime = safeTarget;
          }
        }
      } else {
        if (!video.paused) video.pause();
        if (Math.abs(video.currentTime - safeTarget) > 0.03) {
          video.currentTime = safeTarget;
        }
      }
    } catch {
      // Mobile browsers can reject seeks until their first decoded frame.
    }
  }, [
    playhead,
    isPlaying,
    videoUrl,
    clip.speed,
    clip.audio?.muted,
    clip.audio?.volume,
    clip.sourceStart,
    clip.timelineStart,
    trackMuted,
  ]);

  if (!videoUrl) return null;

  const { transform, adjustments } = clip;
  const objectFit =
    transform.fitMode === "cover"
      ? "cover"
      : transform.fitMode === "fill"
        ? "fill"
        : "contain";

  const hasVisualAdjustments =
    adjustments.brightness !== 1 ||
    adjustments.contrast !== 1 ||
    adjustments.saturation !== 1 ||
    adjustments.blur !== 0 ||
    adjustments.grayscale !== 0 ||
    adjustments.sepia !== 0;

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
    <video
      ref={videoRef}
      src={videoUrl}
      poster={posterUrl ?? undefined}
      preload="metadata"
      controls={false}
      muted={trackMuted || clip.audio?.muted}
      playsInline
      className="h-full w-full pointer-events-none"
      style={{
        objectFit,
        opacity: transform.opacity,
        filter: hasVisualAdjustments ? filterStyle : undefined,
        clipPath: clipPathStyle,
        transform: `scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
      }}
    />
  );
}
