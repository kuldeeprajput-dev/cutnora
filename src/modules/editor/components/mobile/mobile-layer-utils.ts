import type { Track } from "@/modules/editor/types";

export function getMobileLayerReorderTarget(
  tracks: Track[],
  trackId: string,
  direction: -1 | 1,
  playhead: number,
) {
  const visibleTracks = [...tracks]
    .sort((a, b) => a.order - b.order)
    .filter((track) => !track.hidden && track.clips.some((clip) =>
      clip.type !== "audio" &&
      clip.transform.opacity > 0 &&
      playhead >= clip.timelineStart &&
      playhead < clip.timelineStart + clip.timelineDuration,
    ));
  const index = visibleTracks.findIndex((track) => track.id === trackId);
  const neighbor = index >= 0 ? visibleTracks[index + direction] : undefined;
  if (!neighbor) return null;
  return {
    fromIndex: tracks.findIndex((track) => track.id === trackId),
    toIndex: tracks.findIndex((track) => track.id === neighbor.id),
  };
}
