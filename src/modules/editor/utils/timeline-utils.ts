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
  return maxEnd > 0 ? Number(maxEnd.toFixed(2)) : 0;
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

        const orderedClips = [...track.clips].sort(
          (a, b) =>
            a.timelineStart - b.timelineStart || a.id.localeCompare(b.id),
        );
        const clipIndex = orderedClips.findIndex((item) => item.id === clipId);
        const prevClip = clipIndex > 0 ? orderedClips[clipIndex - 1] : undefined;
        const nextClip =
          clipIndex >= 0 && clipIndex < orderedClips.length - 1
            ? orderedClips[clipIndex + 1]
            : undefined;
        let safeStart = Math.max(0, newStart);

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
    const splitGroupId = clipToSplit.splitGroupId ?? nanoid();

    const firstClip: TimelineClip = {
      ...clipToSplit,
      splitGroupId,
      timelineDuration: firstHalfDuration,
    };

    const secondClip: TimelineClip = {
      ...clipToSplit,
      id: nanoid(),
      splitGroupId,
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

const SPLIT_JOIN_EPSILON = 0.05;

function areLegacySplitNeighbors(left: TimelineClip, right: TimelineClip) {
  if (
    !left.assetId ||
    left.assetId !== right.assetId ||
    left.type !== right.type ||
    Math.abs((left.speed || 1) - (right.speed || 1)) > SPLIT_JOIN_EPSILON
  ) {
    return false;
  }

  const timelineAdjacent =
    Math.abs(
      left.timelineStart + left.timelineDuration - right.timelineStart,
    ) <= SPLIT_JOIN_EPSILON;
  const sourceAdjacent =
    Math.abs(
      left.sourceStart + left.timelineDuration * (left.speed || 1) -
        right.sourceStart,
    ) <= SPLIT_JOIN_EPSILON;

  return timelineAdjacent && sourceAdjacent;
}

export function resetClipToOriginal(tracks: Track[], clipId: string): Track[] {
  const selectedTrack = tracks.find((track) =>
    track.clips.some((clip) => clip.id === clipId),
  );
  const selectedClip = selectedTrack?.clips.find((clip) => clip.id === clipId);
  if (!selectedTrack || !selectedClip) return tracks;

  const orderedClips = [...selectedTrack.clips].sort(
    (a, b) => a.timelineStart - b.timelineStart || a.id.localeCompare(b.id),
  );
  let splitClips: TimelineClip[];

  if (selectedClip.splitGroupId) {
    splitClips = orderedClips.filter(
      (clip) => clip.splitGroupId === selectedClip.splitGroupId,
    );
  } else {
    const selectedIndex = orderedClips.findIndex(
      (clip) => clip.id === selectedClip.id,
    );
    let firstIndex = selectedIndex;
    let lastIndex = selectedIndex;

    while (
      firstIndex > 0 &&
      areLegacySplitNeighbors(
        orderedClips[firstIndex - 1],
        orderedClips[firstIndex],
      )
    ) {
      firstIndex -= 1;
    }
    while (
      lastIndex < orderedClips.length - 1 &&
      areLegacySplitNeighbors(
        orderedClips[lastIndex],
        orderedClips[lastIndex + 1],
      )
    ) {
      lastIndex += 1;
    }

    splitClips = orderedClips.slice(firstIndex, lastIndex + 1);
  }

  const speed = selectedClip.speed > 0 ? selectedClip.speed : 1;
  const fullTimelineDuration = Number(
    Math.max(0.1, selectedClip.sourceDuration / speed).toFixed(3),
  );

  if (splitClips.length < 2) {
    return trimClipBounds(
      tracks,
      clipId,
      selectedClip.timelineStart,
      fullTimelineDuration,
      0,
    );
  }

  const splitIds = new Set(splitClips.map((clip) => clip.id));
  const originalTimelineStart = Math.max(
    0,
    Math.min(
      ...splitClips.map(
        (clip) => clip.timelineStart - clip.sourceStart / (clip.speed || 1),
      ),
    ),
  );
  const unrelatedClips = selectedTrack.clips.filter(
    (clip) => !splitIds.has(clip.id),
  );
  const safeTimelineStart = preventClipOverlap(
    unrelatedClips,
    selectedClip.id,
    originalTimelineStart,
    fullTimelineDuration,
  );
  const restoredClip: TimelineClip = {
    ...selectedClip,
    timelineStart: safeTimelineStart,
    timelineDuration: fullTimelineDuration,
    sourceStart: 0,
    splitGroupId: undefined,
  };

  return tracks.map((track) =>
    track.id === selectedTrack.id
      ? {
          ...track,
          clips: [...unrelatedClips, restoredClip].sort(
            (a, b) => a.timelineStart - b.timelineStart,
          ),
        }
      : track,
  );
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
          splitGroupId: undefined,
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
