import type { Project } from '@/modules/projects/types';
import type { TimelineClip } from '@/modules/editor/types';
import { renderClipTo2DCanvas } from '../utils/exportCanvasRenderer';

export interface RenderFrameOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  project: Project;
  currentTime: number;
  exportWidth: number;
  exportHeight: number;
  mediaElementsMap: Map<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>;
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
  ctx.fillStyle = project.settings.backgroundColor || '#000000';
  ctx.fillRect(0, 0, exportWidth, exportHeight);

  // Sort visible tracks by order
  const visibleTracks = [...project.tracks]
    .filter((t) => !t.hidden)
    .sort((a, b) => a.order - b.order);

  for (const track of visibleTracks) {
    for (const clip of track.clips) {
      if ((clip as { hidden?: boolean }).hidden) continue;
      // Check active timeframe
      if (currentTime >= clip.timelineStart && currentTime < clip.timelineStart + clip.timelineDuration) {
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
  mediaElementsMap: Map<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>;
}) {
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
  if (type === 'video' || type === 'image') {
    const b = adjustments?.brightness ?? 1;
    const c = adjustments?.contrast ?? 1;
    const s = adjustments?.saturation ?? 1;
    const g = adjustments?.grayscale ?? 0;
    const sep = adjustments?.sepia ?? 0;
    const blur = (adjustments?.blur ?? 0) * stageScale;

    ctx.filter = `brightness(${b * 100}%) contrast(${c * 100}%) saturate(${s * 100}%) grayscale(${g * 100}%) sepia(${sep * 100}%) blur(${blur}px)`;
  }

  // Draw Media (Video or Image)
  if (assetId && (type === 'video' || type === 'image')) {
    const mediaEl = mediaElementsMap.get(assetId);
    if (mediaEl && (mediaEl instanceof HTMLVideoElement || mediaEl instanceof HTMLImageElement)) {
      if (type === 'video' && mediaEl instanceof HTMLVideoElement) {
        // Seek video element to sourceStart + (currentTime - timelineStart) * speed
        const clipElapsed = currentTime - clip.timelineStart;
        const targetSourceTime = clip.sourceStart + clipElapsed * (clip.speed || 1);
        if (Math.abs(mediaEl.currentTime - targetSourceTime) > 0.05) {
          mediaEl.currentTime = targetSourceTime;
        }
      }

      // Handle Crop if specified
      if (transform.crop) {
        const { top, right, bottom, left } = transform.crop;
        const naturalW = mediaEl instanceof HTMLImageElement ? mediaEl.naturalWidth : mediaEl.videoWidth;
        const naturalH = mediaEl instanceof HTMLImageElement ? mediaEl.naturalHeight : mediaEl.videoHeight;

        const srcX = (left / 100) * naturalW;
        const srcY = (top / 100) * naturalH;
        const srcW = ((100 - left - right) / 100) * naturalW;
        const srcH = ((100 - top - bottom) / 100) * naturalH;

        if (srcW > 0 && srcH > 0) {
          ctx.drawImage(mediaEl, srcX, srcY, srcW, srcH, 0, 0, w, h);
        } else {
          ctx.drawImage(mediaEl, 0, 0, w, h);
        }
      } else {
        ctx.drawImage(mediaEl, 0, 0, w, h);
      }
    }
  } else if (type === 'text' || type === 'overlay') {
    // Render text or SVG element using exportCanvasRenderer
    renderClipTo2DCanvas(ctx, clip, stageScale);
  }

  ctx.restore();
}
