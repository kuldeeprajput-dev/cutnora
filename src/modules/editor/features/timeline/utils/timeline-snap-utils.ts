import type { Track } from '@/modules/editor/types';

export interface TimelineSnapResult {
  snappedTime: number;
  isSnapped: boolean;
  snapTargetTime?: number;
}

export function snapTimelineTime(
  rawTime: number,
  tracks: Track[],
  playhead: number,
  ignoreClipId?: string,
  zoom = 50,
  enabled = true
): TimelineSnapResult {
  if (!enabled) {
    return { snappedTime: Math.max(0, rawTime), isSnapped: false };
  }

  const snapThresholdSecs = 8 / Math.max(10, zoom); // 8px threshold in seconds
  const snapTargets = new Set<number>([0, playhead]);

  // Collect all clip start and end times from all tracks
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (clip.id === ignoreClipId) continue;
      snapTargets.add(clip.timelineStart);
      snapTargets.add(clip.timelineStart + clip.timelineDuration);
    }
  }

  // If zoomed in close, add whole second boundaries
  if (zoom >= 60) {
    const minSec = Math.max(0, Math.floor(rawTime - 2));
    const maxSec = Math.ceil(rawTime + 2);
    for (let s = minSec; s <= maxSec; s++) {
      snapTargets.add(s);
    }
  }

  let closestTarget: number | undefined;
  let minDistance = snapThresholdSecs;

  for (const target of snapTargets) {
    const dist = Math.abs(rawTime - target);
    if (dist < minDistance) {
      minDistance = dist;
      closestTarget = target;
    }
  }

  if (closestTarget !== undefined) {
    return {
      snappedTime: Math.max(0, closestTarget),
      isSnapped: true,
      snapTargetTime: closestTarget,
    };
  }

  return {
    snappedTime: Math.max(0, rawTime),
    isSnapped: false,
  };
}
