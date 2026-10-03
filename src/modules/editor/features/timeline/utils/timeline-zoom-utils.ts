export const DEFAULT_TIMELINE_ZOOM = 50;
export const MIN_TIMELINE_ZOOM = 0.05;
export const MAX_TIMELINE_ZOOM_FACTOR = 20;
export const MAX_TIMELINE_ZOOM =
  DEFAULT_TIMELINE_ZOOM * MAX_TIMELINE_ZOOM_FACTOR;

const TIMELINE_HORIZONTAL_PADDING = 80;
const STANDARD_MIN_TIMELINE_ZOOM = 5;
const ZOOM_FACTOR = 1.35;

export function clampTimelineZoom(
  zoom: number,
  minimum = MIN_TIMELINE_ZOOM,
): number {
  if (!Number.isFinite(zoom)) return DEFAULT_TIMELINE_ZOOM;
  return Math.min(MAX_TIMELINE_ZOOM, Math.max(minimum, zoom));
}

export function getTimelineZoomFactor(zoom: number): number {
  const factor = clampTimelineZoom(zoom) / DEFAULT_TIMELINE_ZOOM;
  return Number(factor.toFixed(factor < 0.01 ? 3 : 2));
}

export function getFitTimelineZoom(
  duration: number,
  viewportWidth: number,
): number {
  if (duration <= 0 || viewportWidth <= 0) return DEFAULT_TIMELINE_ZOOM;

  const usableWidth = Math.max(
    100,
    viewportWidth - TIMELINE_HORIZONTAL_PADDING,
  );
  return clampTimelineZoom(
    Math.min(DEFAULT_TIMELINE_ZOOM, usableWidth / duration),
  );
}

export function getMinimumTimelineZoom(
  duration: number,
  viewportWidth: number,
): number {
  if (duration <= 0) return STANDARD_MIN_TIMELINE_ZOOM;
  return Math.min(
    STANDARD_MIN_TIMELINE_ZOOM,
    getFitTimelineZoom(duration, viewportWidth),
  );
}

export function getNextTimelineZoom(
  zoom: number,
  direction: "in" | "out",
  minimum: number,
): number {
  const next = direction === "in" ? zoom * ZOOM_FACTOR : zoom / ZOOM_FACTOR;
  return Number(clampTimelineZoom(next, minimum).toFixed(3));
}

export function timelineZoomToSliderValue(
  zoom: number,
  minimum: number,
): number {
  const safeMinimum = Math.max(MIN_TIMELINE_ZOOM, minimum);
  const safeZoom = clampTimelineZoom(zoom, safeMinimum);
  const range = Math.log(MAX_TIMELINE_ZOOM / safeMinimum);
  if (range <= 0) return 0;
  return (Math.log(safeZoom / safeMinimum) / range) * 100;
}

export function sliderValueToTimelineZoom(
  value: number,
  minimum: number,
): number {
  const safeMinimum = Math.max(MIN_TIMELINE_ZOOM, minimum);
  const progress = Math.min(100, Math.max(0, value)) / 100;
  const zoom =
    safeMinimum * Math.pow(MAX_TIMELINE_ZOOM / safeMinimum, progress);
  return Number(clampTimelineZoom(zoom, safeMinimum).toFixed(3));
}
