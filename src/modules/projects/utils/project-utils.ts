import type { Project } from "../types";

export function getProjectDuration(project: Project): number {
  let maxTime = 0;
  if (project.tracks && Array.isArray(project.tracks)) {
    for (const track of project.tracks) {
      if (track.clips && Array.isArray(track.clips)) {
        for (const clip of track.clips) {
          const end = (clip.timelineStart || 0) + (clip.timelineDuration || 0);
          if (end > maxTime) maxTime = end;
        }
      }
    }
  }
  return maxTime;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:10";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDate(timestamp?: number): string {
  if (!timestamp) return "Sep 19, 2026";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
