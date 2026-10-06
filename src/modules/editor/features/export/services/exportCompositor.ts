import type { Project } from "@/modules/projects/types";
import type { TimelineClip, Track } from "@/modules/editor/types";
import { renderClipTo2DCanvas } from "../utils/exportCanvasRenderer";

export type ExportMediaSource =
  | HTMLVideoElement
  | HTMLImageElement
  | HTMLAudioElement
  | HTMLCanvasElement
  | OffscreenCanvas;

const renderTracksCache = new WeakMap<Project, Track[]>();

export interface RenderFrameOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  project: Project;
  currentTime: number;
  exportWidth: number;
  exportHeight: number;
  mediaElementsMap: ReadonlyMap<string, ExportMediaSource>;
}

export function renderExportFrame({
  canvas,
  ctx,
  project,
  currentTime,
  exportWidth,
  exportHeight,
  mediaElementsMap,
}: RenderFrameOptions) {
  const projWidth = project.settings.width || 1920;
  const projHeight = project.settings.height || 1080;
  const scaleX = exportWidth / projWidth;
  const scaleY = exportHeight / projHeight;
  const stageScale = (scaleX + scaleY) / 2;

  if (canvas.width !== exportWidth || canvas.height !== exportHeight) {
    canvas.width = exportWidth;
    canvas.height = exportHeight;
  }

  // Clear & Draw Background
  ctx.save();
  ctx.clearRect(0, 0, exportWidth, exportHeight);
  if (
    project.settings.backgroundColor &&
    project.settings.backgroundColor !== "transparent"
  ) {
    ctx.fillStyle = project.settings.backgroundColor;
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // Sort visible tracks by order
  let visibleTracks = renderTracksCache.get(project);
  if (!visibleTracks) {
    visibleTracks = project.tracks
      .filter((track) => !track.hidden)
      .sort((a, b) => a.order - b.order);
    renderTracksCache.set(project, visibleTracks);
  }

  for (const track of visibleTracks) {
    for (const clip of track.clips) {
      if ((clip as { hidden?: boolean }).hidden) continue;
      // Check active timeframe
      if (
        currentTime >= clip.timelineStart &&
        currentTime < clip.timelineStart + clip.timelineDuration
      ) {
        renderClipOnExportCanvas({
          ctx,
          clip,
          currentTime,
          scaleX,
          scaleY,
          stageScale,
          mediaElementsMap,
        });
      }
    }
  }

  ctx.restore();
}

function renderClipOnExportCanvas({
  ctx,
  clip,
  currentTime,
  scaleX,
  scaleY,
  stageScale,
  mediaElementsMap,
}: {
  ctx: CanvasRenderingContext2D;
  clip: TimelineClip;
  currentTime: number;
  scaleX: number;
  scaleY: number;
  stageScale: number;
  mediaElementsMap: ReadonlyMap<string, ExportMediaSource>;
}) {
  // Text and element renderers already apply position and rotation.
  if (clip.type === "text" || clip.type === "overlay") {
    ctx.save();
    ctx.scale(scaleX, scaleY);
    renderClipTo2DCanvas(ctx, clip);
    ctx.restore();
    return;
  }
  ctx.save();

  const { transform, adjustments, type, assetId } = clip;
  const x = transform.x * scaleX;
  const y = transform.y * scaleY;
  const w = transform.width * scaleX;
  const h = transform.height * scaleY;

  ctx.globalAlpha = transform.opacity ?? 1;

  // Position, Scale & Rotation
  ctx.translate(x + w / 2, y + h / 2);
  if (transform.rotation) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }
  ctx.translate(-w / 2, -h / 2);

  // Apply CSS Filters (brightness, contrast, saturation, grayscale, sepia, blur)
  if (type === "video" || type === "image") {
    const b = adjustments?.brightness ?? 1;
    const c = adjustments?.contrast ?? 1;
    const s = adjustments?.saturation ?? 1;
    const g = adjustments?.grayscale ?? 0;
    const sep = adjustments?.sepia ?? 0;
    const blur = (adjustments?.blur ?? 0) * stageScale;

    ctx.filter =
      b === 1 && c === 1 && s === 1 && g === 0 && sep === 0 && blur === 0
        ? "none"
        : `brightness(${b * 100}%) contrast(${c * 100}%) saturate(${s * 100}%) grayscale(${g * 100}%) sepia(${sep * 100}%) blur(${blur}px)`;
  }

  // Match the preview's object-fit, flips, and crop mask instead of stretching media.
  if (assetId && (type === "video" || type === "image")) {
    const media =
      mediaElementsMap.get(clip.id) ?? mediaElementsMap.get(assetId);
    if (media && !(media instanceof HTMLAudioElement)) {
      const naturalW =
        media instanceof HTMLImageElement
          ? media.naturalWidth
          : media instanceof HTMLVideoElement
            ? media.videoWidth
            : media.width;
      const naturalH =
        media instanceof HTMLImageElement
          ? media.naturalHeight
          : media instanceof HTMLVideoElement
            ? media.videoHeight
            : media.height;
      if (naturalW > 0 && naturalH > 0) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(transform.scaleX ?? 1, transform.scaleY ?? 1);
        ctx.translate(-w / 2, -h / 2);
        const crop = transform.crop;
        const left = (w * (crop?.left ?? 0)) / 100;
        const top = (h * (crop?.top ?? 0)) / 100;
        ctx.beginPath();
        ctx.rect(
          left,
          top,
          Math.max(0, w * (1 - (crop?.right ?? 0) / 100) - left),
          Math.max(0, h * (1 - (crop?.bottom ?? 0) / 100) - top),
        );
        ctx.clip();
        if (transform.fitMode === "fill") {
          ctx.drawImage(media, 0, 0, w, h);
        } else {
          const fitScale =
            transform.fitMode === "cover"
              ? Math.max(w / naturalW, h / naturalH)
              : Math.min(w / naturalW, h / naturalH);
          const drawWidth = naturalW * fitScale;
          const drawHeight = naturalH * fitScale;
          ctx.drawImage(
            media,
            (w - drawWidth) / 2,
            (h - drawHeight) / 2,
            drawWidth,
            drawHeight,
          );
        }
      }
    }
  }

  ctx.restore();
}
