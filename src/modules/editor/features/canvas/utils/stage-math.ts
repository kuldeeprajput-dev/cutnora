export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function transformBoundsWithGesture(
  bounds: Bounds,
  startAnchor: Point,
  anchor: Point,
  scale: number,
  rotation: number,
): Bounds {
  const offsetX = bounds.x + bounds.width / 2 - startAnchor.x;
  const offsetY = bounds.y + bounds.height / 2 - startAnchor.y;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  return {
    x: anchor.x + (offsetX * cos - offsetY * sin) * scale - width / 2,
    y: anchor.y + (offsetX * sin + offsetY * cos) * scale - height / 2,
    width,
    height,
  };
}

export function calculateFitScale(containerSize: Size, projectSize: Size): number {
  if (projectSize.width <= 0 || projectSize.height <= 0) return 1;
  const scaleX = containerSize.width / projectSize.width;
  const scaleY = containerSize.height / projectSize.height;
  return Math.min(scaleX, scaleY);
}

export function projectToScreen(point: Point, scale: number, pan: Point): Point {
  return {
    x: point.x * scale + pan.x,
    y: point.y * scale + pan.y,
  };
}

export function screenToProject(point: Point, scale: number, pan: Point): Point {
  if (scale <= 0) return { x: 0, y: 0 };
  return {
    x: (point.x - pan.x) / scale,
    y: (point.y - pan.y) / scale,
  };
}

export function projectBoundsToScreen(bounds: Bounds, scale: number, pan: Point): Bounds {
  const topLeft = projectToScreen({ x: bounds.x, y: bounds.y }, scale, pan);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bounds.width * scale,
    height: bounds.height * scale,
  };
}
