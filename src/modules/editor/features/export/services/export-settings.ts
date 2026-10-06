import type { Project } from "@/modules/projects/types";
import type { ExportQuality, ExportResolution } from "@/modules/editor/store/useExportStore";

export const EXPORT_QUALITY_OPTIONS: Record<ExportQuality, { label: string; description: string }> = {
  draft: { label: "Smaller file", description: "Lower bitrate for drafts and quick sharing." },
  standard: { label: "Balanced", description: "Recommended for everyday sharing and uploads." },
  high: { label: "High quality", description: "More detail, with a larger file size." },
};

export function getExportDimensions(
  project: Project,
  resolution: ExportResolution,
) {
  const projectWidth = Math.max(2, project.settings.width || 1920);
  const projectHeight = Math.max(2, project.settings.height || 1080);
  const shortEdge =
    resolution === "720p" || resolution === "1280x720" ? 720 :
    resolution === "1080p" || resolution === "1920x1080" ? 1080 : null;
  const scale = shortEdge ? shortEdge / Math.min(projectWidth, projectHeight) : 1;
  return {
    width: Math.max(2, Math.round((projectWidth * scale) / 2) * 2),
    height: Math.max(2, Math.round((projectHeight * scale) / 2) * 2),
  };
}

export function getExportVideoBitrate(
  width: number,
  height: number,
  fps: number,
  quality: ExportQuality,
) {
  const referenceBitrate =
    quality === "draft"
      ? 3_000_000
      : quality === "high"
        ? 15_000_000
        : 8_000_000;
  const pixelScale = (width * height) / (1920 * 1080);
  const frameRateScale = fps > 30 ? fps / 40 : 1;
  return Math.round(
    Math.max(
      500_000,
      Math.min(100_000_000, referenceBitrate * pixelScale * frameRateScale),
    ),
  );
}

export function hasExportAudio(project: Project) {
  return (
    (project.settings.masterVolume ?? 1) > 0 &&
    project.tracks.some(
      (track) =>
        !track.hidden &&
        !track.muted &&
        track.clips.some(
          (clip) =>
            (clip.type === "video" || clip.type === "audio") &&
            clip.assetId &&
            !clip.audio?.muted &&
            (clip.audio?.volume ?? 1) > 0 &&
            clip.timelineStart < project.settings.duration &&
            clip.timelineStart + clip.timelineDuration > 0,
        ),
    )
  );
}

export function getExportFilename(filename: string, extension: "webm" | "mp4") {
  const base = filename
    .trim()
    .replace(/\.(mp4|webm)$/i, "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-");
  return `${base || "video-export"}.${extension}`;
}
