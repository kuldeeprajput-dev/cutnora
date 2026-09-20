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

/**
 * Strips copy suffixes from a project name to extract the original root name.
 * Handles patterns like:
 *  - "Project (Copy)"
 *  - "Project (Copy 2)"
 *  - "Project (Copy2)"
 *  - "Project (Copy) (Copy)"
 *  - "Project copy"
 *  - "Project copy 2"
 */
export function getBaseProjectName(name: string): string {
  let cleaned = name.trim();
  const copyRegex = /(?:\s*\((?:copy|copy\s*\d+)\)|\s+(?:copy|copy\s*\d+))$/i;
  while (copyRegex.test(cleaned)) {
    cleaned = cleaned.replace(copyRegex, "").trim();
  }
  return cleaned || name.trim();
}

/**
 * Generates duplicate name following the sequence:
 *  1st copy: "<Base> (Copy)"
 *  2nd copy: "<Base> (Copy 2)"
 *  3rd copy: "<Base> (Copy 3)"
 *  4th copy: "<Base> (Copy 4)"
 *  ...
 */
export function generateDuplicateProjectName(
  sourceName: string,
  existingNames: string[],
): string {
  const baseName = getBaseProjectName(sourceName);
  const lowerNames = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  // 1st copy
  const firstCopy = `${baseName} (Copy)`;
  if (!lowerNames.has(firstCopy.toLowerCase())) {
    return firstCopy;
  }

  // 2nd copy onwards: (Copy 2), (Copy 3), (Copy 4), ...
  let counter = 2;
  while (
    lowerNames.has(`${baseName} (Copy ${counter})`.toLowerCase()) ||
    lowerNames.has(`${baseName} (Copy${counter})`.toLowerCase())
  ) {
    counter++;
  }

  return `${baseName} (Copy ${counter})`;
}
