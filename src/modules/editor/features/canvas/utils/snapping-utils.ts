import type { Bounds } from './stage-math';

export interface GuideLine {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number; // In project coordinates
}

export interface SnappingResult {
  x: number;
  y: number;
  guides: GuideLine[];
}

const SNAP_THRESHOLD = 8; // Project-space pixels

export function calculateSnapping(
  targetBounds: Bounds,
  otherBoundsList: Bounds[],
  projectWidth: number,
  projectHeight: number,
  enabled = true
): SnappingResult {
  if (!enabled) {
    return { x: targetBounds.x, y: targetBounds.y, guides: [] };
  }

  let snappedX = targetBounds.x;
  let snappedY = targetBounds.y;
  const guides: GuideLine[] = [];

  const targetCenterX = targetBounds.x + targetBounds.width / 2;
  const targetCenterY = targetBounds.y + targetBounds.height / 2;
  const targetRight = targetBounds.x + targetBounds.width;
  const targetBottom = targetBounds.y + targetBounds.height;

  // X Snap Targets: 0, projectWidth/2, projectWidth, and other bounds (left, center, right)
  const xTargets: { pos: number; align: 'left' | 'center' | 'right' }[] = [
    { pos: 0, align: 'left' },
    { pos: projectWidth / 2, align: 'center' },
    { pos: projectWidth, align: 'right' },
  ];

  // Y Snap Targets: 0, projectHeight/2, projectHeight, and other bounds (top, center, bottom)
  const yTargets: { pos: number; align: 'top' | 'center' | 'bottom' }[] = [
    { pos: 0, align: 'top' },
    { pos: projectHeight / 2, align: 'center' },
    { pos: projectHeight, align: 'bottom' },
  ];

  for (const b of otherBoundsList) {
    xTargets.push({ pos: b.x, align: 'left' });
    xTargets.push({ pos: b.x + b.width / 2, align: 'center' });
    xTargets.push({ pos: b.x + b.width, align: 'right' });

    yTargets.push({ pos: b.y, align: 'top' });
    yTargets.push({ pos: b.y + b.height / 2, align: 'center' });
    yTargets.push({ pos: b.y + b.height, align: 'bottom' });
  }

  // Check X Snapping
  let minDiffX = SNAP_THRESHOLD + 1;
  for (const target of xTargets) {
    // Left edge to target
    if (Math.abs(targetBounds.x - target.pos) < minDiffX) {
      minDiffX = Math.abs(targetBounds.x - target.pos);
      snappedX = target.pos;
      guides.push({ id: `v-${target.pos}`, type: 'vertical', position: target.pos });
    }
    // Center to target
    if (Math.abs(targetCenterX - target.pos) < minDiffX) {
      minDiffX = Math.abs(targetCenterX - target.pos);
      snappedX = target.pos - targetBounds.width / 2;
      guides.push({ id: `v-${target.pos}`, type: 'vertical', position: target.pos });
    }
    // Right edge to target
    if (Math.abs(targetRight - target.pos) < minDiffX) {
      minDiffX = Math.abs(targetRight - target.pos);
      snappedX = target.pos - targetBounds.width;
      guides.push({ id: `v-${target.pos}`, type: 'vertical', position: target.pos });
    }
  }

  // Check Y Snapping
  let minDiffY = SNAP_THRESHOLD + 1;
  for (const target of yTargets) {
    // Top edge to target
    if (Math.abs(targetBounds.y - target.pos) < minDiffY) {
      minDiffY = Math.abs(targetBounds.y - target.pos);
      snappedY = target.pos;
      guides.push({ id: `h-${target.pos}`, type: 'horizontal', position: target.pos });
    }
    // Center to target
    if (Math.abs(targetCenterY - target.pos) < minDiffY) {
      minDiffY = Math.abs(targetCenterY - target.pos);
      snappedY = target.pos - targetBounds.height / 2;
      guides.push({ id: `h-${target.pos}`, type: 'horizontal', position: target.pos });
    }
    // Bottom edge to target
    if (Math.abs(targetBottom - target.pos) < minDiffY) {
      minDiffY = Math.abs(targetBottom - target.pos);
      snappedY = target.pos - targetBounds.height;
      guides.push({ id: `h-${target.pos}`, type: 'horizontal', position: target.pos });
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
}
