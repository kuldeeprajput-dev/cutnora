'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/core/db/database';
import { resolveMediaAssetUrl } from '@/modules/core/storage/media-source-service';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import type { TimelineClip, Track } from '@/modules/editor/types';

interface AudioClipPlayerProps {
  clip: TimelineClip;
  track: Track;
}

function AudioClipPlayer({ clip, track }: AudioClipPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const playhead = usePlaybackStore((state) => state.playhead);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const playbackRate = usePlaybackStore((state) => state.playbackRate);
  const previewMuted = usePlaybackStore((state) => state.previewMuted);

  // Refs to track transitions and avoid frame-by-frame seeks
  const wasPlayingRef = useRef(false);
  const lastPlayheadRef = useRef<number | null>(null);

  const asset = useLiveQuery(
    () => (clip.assetId ? db.assets.get(clip.assetId) : undefined),
    [clip.assetId],
    null,
  );

  // Resolve media asset URL (OPFS, indexedDB blob, or remote)
  useEffect(() => {
    let isMounted = true;
    async function loadAudio() {
      if (!asset) return;
      try {
        const url = await resolveMediaAssetUrl(asset);
        if (isMounted) setAudioUrl(url);
      } catch (err) {
        console.warn('Failed to resolve audio asset URL for clip ' + clip.id + ':', err);
      }
    }
    void loadAudio();
    return () => {
      isMounted = false;
    };
  }, [asset, clip.id]);

  // Synchronize audio properties (volume, muted, speed) smoothly without stopping audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const speed = Math.max(0.0625, Math.min(16, (clip.speed || 1) * playbackRate));
    const isTrackMuted = track.muted || track.hidden;
    const isClipMuted = clip.audio?.muted ?? false;
    const isMuted = previewMuted || isTrackMuted || isClipMuted;
    const volume = Math.max(0, Math.min(1, clip.audio?.volume ?? 1));

    if (audio.playbackRate !== speed) {
      audio.playbackRate = speed;
    }
    if (audio.muted !== isMuted) {
      audio.muted = isMuted;
    }
    if (audio.volume !== (isMuted ? 0 : volume)) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [audioUrl, playbackRate, previewMuted, clip.speed, clip.audio?.muted, clip.audio?.volume, track.muted, track.hidden]);

  // Playhead & Play/Pause state synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const speed = Math.max(0.25, Math.min(4, clip.speed || 1));
    const isTrackMuted = track.muted || track.hidden;
    const isClipMuted = clip.audio?.muted ?? false;
    const isMuted = isTrackMuted || isClipMuted;

    const isInsideClip =
      playhead >= clip.timelineStart &&
      playhead < clip.timelineStart + clip.timelineDuration;

    const targetTime = Math.max(
      0,
      clip.sourceStart + (playhead - clip.timelineStart) * speed,
    );

    const safeTarget =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.min(targetTime, Math.max(0, audio.duration - 0.005))
        : targetTime;

    const prevPlaying = wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;

    const prevPlayhead = lastPlayheadRef.current;
    lastPlayheadRef.current = playhead;

    // Detect manual scrubbing / timeline clicking (jumps > 0.35s)
    const isManualSeek =
      prevPlayhead !== null &&
      Math.abs(playhead - prevPlayhead) > 0.35 * speed;

    if (!isInsideClip) {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    if (isPlaying && !isMuted) {
      if (!prevPlaying || audio.paused || isManualSeek) {
        // Playback just started or user jumped playhead: seek & start smoothly
        if (Math.abs(audio.currentTime - safeTarget) > 0.05) {
          audio.currentTime = safeTarget;
        }
        void audio.play().catch(() => {});
      } else {
        // While actively playing normally, NEVER seek currentTime unless catastrophic drift (> 1.2s)
        // Setting currentTime on playing audio flushes decoder buffer and creates crackling / pauses
        const drift = Math.abs(audio.currentTime - safeTarget);
        if (drift > 1.2) {
          audio.currentTime = safeTarget;
        }
      }
    } else {
      // Paused state: pause audio immediately and seek smoothly while dragging playhead
      if (!audio.paused) {
        audio.pause();
      }
      if (Math.abs(audio.currentTime - safeTarget) > 0.03) {
        audio.currentTime = safeTarget;
      }
    }
  }, [
    playhead,
    isPlaying,
    audioUrl,
    clip.timelineStart,
    clip.timelineDuration,
    clip.sourceStart,
    clip.speed,
    clip.audio?.muted,
    track.muted,
    track.hidden,
  ]);

  // Ensure audio is paused if component unmounts
  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl && !audioEl.paused) {
        audioEl.pause();
      }
    };
  }, []);

  if (!audioUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      preload="auto"
      className="hidden"
      playsInline
    />
  );
}

export function AudioPlaybackManager() {
  const currentProject = useProjectStore((state) => state.currentProject);

  if (!currentProject) return null;

  const audioClips: { clip: TimelineClip; track: Track }[] = [];
  for (const track of currentProject.tracks) {
    for (const clip of track.clips) {
      if (clip.type === 'audio') {
        audioClips.push({ clip, track });
      }
    }
  }

  return (
    <div className="hidden" aria-hidden="true">
      {audioClips.map(({ clip, track }) => (
        <AudioClipPlayer key={clip.id} clip={clip} track={track} />
      ))}
    </div>
  );
}
