import type { MediaAsset, Project } from "@/modules/projects/types";
import type {
  ExportQuality,
  ExportResolution,
} from "@/modules/editor/store/useExportStore";

export const EXPORT_QUALITY_OPTIONS: Record<
  ExportQuality,
  { label: string; description: string }
> = {
  draft: {
    label: "Smaller file",
    description: "Lower bitrate for drafts and quick sharing.",
  },
  standard: {
    label: "Balanced",
    description: "Recommended for everyday sharing and uploads.",
  },
  high: {
    label: "High quality",
    description: "More detail, with a larger file size.",
  },
};

export function getExportDimensions(
  project: Project,
  resolution: ExportResolution,
) {
  const projectWidth = Math.max(2, project.settings.width || 1920);
  const projectHeight = Math.max(2, project.settings.height || 1080);
  const shortEdge =
    resolution === "720p" || resolution === "1280x720"
      ? 720
      : resolution === "1080p" || resolution === "1920x1080"
        ? 1080
        : null;
  const scale = shortEdge
    ? shortEdge / Math.min(projectWidth, projectHeight)
    : 1;
  return {
    width: Math.max(2, Math.round((projectWidth * scale) / 2) * 2),
    height: Math.max(2, Math.round((projectHeight * scale) / 2) * 2),
  };
}

export function getExportAudioBitrate(
  hasAudio: boolean,
  quality: ExportQuality,
): number {
  if (!hasAudio) return 0;
  return quality === "draft" ? 128_000 : 192_000;
}

export function getExportVideoBitrate(
  width: number,
  height: number,
  fps: number,
  quality: ExportQuality,
  assets: readonly (MediaAsset | undefined)[] = [],
): number {
  const exportPixels = width * height;
  const pixelScale = exportPixels / (1920 * 1080);
  const fpsFactor = fps === 60 ? 1.25 : fps === 24 ? 0.9 : 1.0;

  // Inspect source video footage
  const sourceBitrates: number[] = [];
  for (const asset of assets) {
    if (!asset || asset.type !== "video" || !asset.size || !asset.duration)
      continue;
    const rawBitrate = (asset.size * 8) / asset.duration;
    if (rawBitrate <= 0 || !Number.isFinite(rawBitrate)) continue;

    let scaled = rawBitrate;
    if (asset.width && asset.height && asset.width > 0 && asset.height > 0) {
      const assetPixels = asset.width * asset.height;
      const ratio = exportPixels / assetPixels;
      scaled = rawBitrate * Math.min(2.0, Math.max(0.35, ratio));
    }
    sourceBitrates.push(scaled);
  }

  if (sourceBitrates.length > 0) {
    // Base bitrate on actual video footage so output size matches the media
    const baseSource = Math.max(...sourceBitrates);
    const qualityMultipliers: Record<ExportQuality, number> = {
      draft: 0.65,
      standard: 1.05,
      high: 1.45,
    };
    const target = baseSource * qualityMultipliers[quality] * fpsFactor;

    const minBitrate = Math.round(
      Math.max(600_000, 1_500_000 * pixelScale * (fps / 30)),
    );
    const maxBitrate = Math.round(
      quality === "draft"
        ? 6_000_000 * pixelScale * fpsFactor
        : quality === "standard"
          ? 16_000_000 * pixelScale * fpsFactor
          : 32_000_000 * pixelScale * fpsFactor,
    );
    return Math.round(Math.max(minBitrate, Math.min(maxBitrate, target)));
  }

  // Fallback when project only contains static images/text/audio
  const baseline: Record<ExportQuality, number> = {
    draft: 2_500_000,
    standard: 6_000_000,
    high: 12_000_000,
  };
  return Math.round(
    Math.max(
      600_000,
      baseline[quality] * Math.min(4, Math.max(0.4, pixelScale)) * fpsFactor,
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
