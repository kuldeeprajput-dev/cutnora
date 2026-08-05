import { nanoid } from 'nanoid';
import type { Track, TimelineClip } from '../types';

export function calculateProjectDuration(tracks: Track[]): number {
  let maxEnd = 0;
  for (const track of tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.timelineStart + clip.timelineDuration;
      if (clipEnd > maxEnd) {
        maxEnd = clipEnd;
      }
    }
  }
  return maxEnd > 0 ? Number(maxEnd.toFixed(2)) : 10;
}

export function preventClipOverlap(
  clipsOnTrack: TimelineClip[],
  targetClipId: string,
  proposedStart: number,
  duration: number
): number {
  const otherClips = clipsOnTrack
    .filter((c) => c.id !== targetClipId)
    .sort((a, b) => a.timelineStart - b.timelineStart);

  let start = Math.max(0, proposedStart);
  let end = start + duration;

  for (const other of otherClips) {
    const otherStart = other.timelineStart;
    const otherEnd = other.timelineStart + other.timelineDuration;

    // Check collision: overlap occurs if start < otherEnd AND end > otherStart
    if (start < otherEnd && end > otherStart) {
      const proposedMid = proposedStart + duration / 2;
      const otherMid = otherStart + other.timelineDuration / 2;

      if (proposedMid >= otherMid) {
        start = otherEnd;
      } else {
        start = Math.max(0, otherStart - duration);
      }
      end = start + duration;
    }
  }

  // Second pass to guarantee no residual overlaps
  for (const other of otherClips) {
    const otherStart = other.timelineStart;
    const otherEnd = other.timelineStart + other.timelineDuration;

    if (start < otherEnd && start + duration > otherStart) {
      start = otherEnd;
    }
  }

  return Number(Math.max(0, start).toFixed(3));
}

export function addClipToTrack(tracks: Track[], targetTrackId: string, newClip: TimelineClip): Track[] {
  return tracks.map((track) => {
    if (track.id === targetTrackId) {
      const safeStart = preventClipOverlap(track.clips, newClip.id, newClip.timelineStart, newClip.timelineDuration);
      return {
        ...track,
        clips: [...track.clips, { ...newClip, trackId: targetTrackId, timelineStart: safeStart }].sort(
          (a, b) => a.timelineStart - b.timelineStart
        ),
      };
    }
    return track;
  });
}

export function moveClipInTimeline(
  tracks: Track[],
  clipId: string,
  targetTrackId: string,
  newStart: number
): Track[] {
  let foundClip: TimelineClip | null = null;

  const tracksWithoutClip = tracks.map((track) => {
    const clipIndex = track.clips.findIndex((c) => c.id === clipId);
    if (clipIndex !== -1) {
      foundClip = { ...track.clips[clipIndex] };
      return {
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      };
    }
    return track;
  });

  if (!foundClip) return tracks;

  const targetTrack = tracksWithoutClip.find((t) => t.id === targetTrackId);
  const otherClipsOnTarget = targetTrack ? targetTrack.clips : [];
  const safeStart = preventClipOverlap(otherClipsOnTarget, clipId, newStart, (foundClip as TimelineClip).timelineDuration);

  const updatedClip: TimelineClip = {
    ...(foundClip as TimelineClip),
    trackId: targetTrackId,
    timelineStart: safeStart,
  };

  return tracksWithoutClip.map((track) => {
    if (track.id === targetTrackId) {
      return {
        ...track,
        clips: [...track.clips, updatedClip].sort((a, b) => a.timelineStart - b.timelineStart),
      };
    }
    return track;
  });
}

export function trimClipBounds(
  tracks: Track[],
  clipId: string,
  newStart: number,
  newDuration: number,
  newSourceStart: number
): Track[] {
  return tracks.map((track) => {
    const hasClip = track.clips.some((c) => c.id === clipId);
    if (!hasClip) return track;

    return {
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;

        const safeSourceStart = Math.max(0, newSourceStart);
        let safeDuration = Math.max(0.1, newDuration);

        if ((clip.type === 'video' || clip.type === 'audio') && clip.sourceDuration) {
          const maxAvailable = Math.max(0.1, (clip.sourceDuration - safeSourceStart) / (clip.speed || 1));
          safeDuration = Math.min(maxAvailable, safeDuration);
        }

        const otherClips = track.clips.filter((c) => c.id !== clipId);
        let safeStart = Math.max(0, newStart);

        const prevClip = otherClips.filter((c) => c.timelineStart + c.timelineDuration <= clip.timelineStart).pop();
        const nextClip = otherClips.find((c) => c.timelineStart >= clip.timelineStart + clip.timelineDuration);

        if (prevClip && safeStart < prevClip.timelineStart + prevClip.timelineDuration) {
          safeStart = prevClip.timelineStart + prevClip.timelineDuration;
          safeDuration = Math.max(0.1, clip.timelineStart + clip.timelineDuration - safeStart);
        }

        if (nextClip && safeStart + safeDuration > nextClip.timelineStart) {
          safeDuration = Math.max(0.1, nextClip.timelineStart - safeStart);
        }

        return {
          ...clip,
          timelineStart: safeStart,
          timelineDuration: safeDuration,
          sourceStart: safeSourceStart,
        };
      }),
    };
  });
}

export function splitClipAtTime(tracks: Track[], clipId: string, splitTime: number): Track[] {
  return tracks.map((track) => {
    const clipToSplit = track.clips.find((c) => c.id === clipId);
    if (!clipToSplit) return track;

    const relativeSplit = splitTime - clipToSplit.timelineStart;
    if (relativeSplit <= 0.1 || relativeSplit >= clipToSplit.timelineDuration - 0.1) {
      return track;
    }

    const firstHalfDuration = Number(relativeSplit.toFixed(3));
    const secondHalfDuration = Number((clipToSplit.timelineDuration - relativeSplit).toFixed(3));
    const speed = clipToSplit.speed || 1;

    const firstClip: TimelineClip = {
      ...clipToSplit,
      timelineDuration: firstHalfDuration,
    };

    const secondClip: TimelineClip = {
      ...clipToSplit,
      id: nanoid(),
      timelineStart: splitTime,
      timelineDuration: secondHalfDuration,
      sourceStart: Number((clipToSplit.sourceStart + firstHalfDuration * speed).toFixed(3)),
    };

    return {
      ...track,
      clips: track.clips.flatMap((c) => (c.id === clipId ? [firstClip, secondClip] : [c])),
    };
  });
}

export function deleteClipsFromTracks(tracks: Track[], clipIds: string[]): Track[] {
  const idsToRemove = new Set(clipIds);
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.filter((clip) => !idsToRemove.has(clip.id)),
  }));
}

export function duplicateClipsInTracks(tracks: Track[], clipIds: string[]): Track[] {
  const idsToDup = new Set(clipIds);
  return tracks.map((track) => {
    const duplicatedClips: TimelineClip[] = [];
    for (const clip of track.clips) {
      duplicatedClips.push(clip);
      if (idsToDup.has(clip.id)) {
        const proposedStart = clip.timelineStart + clip.timelineDuration + 0.1;
        const otherClips = track.clips.filter((c) => c.id !== clip.id);
        const safeStart = preventClipOverlap(otherClips, 'new-dup', proposedStart, clip.timelineDuration);
        duplicatedClips.push({
          ...clip,
          id: nanoid(),
          timelineStart: safeStart,
        });
      }
    }
    return {
      ...track,
      clips: duplicatedClips,
    };
  });
}

export function reorderTrackLanes(tracks: Track[], startIndex: number, endIndex: number): Track[] {
  const result = Array.from(tracks);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result.map((track, index) => ({ ...track, order: index }));
}
