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
  return Math.max(10, Math.ceil(maxEnd));
}

export function addClipToTrack(tracks: Track[], targetTrackId: string, newClip: TimelineClip): Track[] {
  return tracks.map((track) => {
    if (track.id === targetTrackId) {
      return {
        ...track,
        clips: [...track.clips, { ...newClip, trackId: targetTrackId }],
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

  const updatedClip: TimelineClip = {
    ...(foundClip as TimelineClip),
    trackId: targetTrackId,
    timelineStart: Math.max(0, newStart),
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
        return {
          ...clip,
          timelineStart: Math.max(0, newStart),
          timelineDuration: Math.max(0.1, newDuration),
          sourceStart: Math.max(0, newSourceStart),
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

    const firstHalfDuration = relativeSplit;
    const secondHalfDuration = clipToSplit.timelineDuration - relativeSplit;

    const firstClip: TimelineClip = {
      ...clipToSplit,
      timelineDuration: firstHalfDuration,
      sourceDuration: firstHalfDuration * clipToSplit.speed,
    };

    const secondClip: TimelineClip = {
      ...clipToSplit,
      id: nanoid(),
      timelineStart: splitTime,
      timelineDuration: secondHalfDuration,
      sourceStart: clipToSplit.sourceStart + firstHalfDuration * clipToSplit.speed,
      sourceDuration: secondHalfDuration * clipToSplit.speed,
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
        duplicatedClips.push({
          ...clip,
          id: nanoid(),
          timelineStart: clip.timelineStart + clip.timelineDuration + 0.5,
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
