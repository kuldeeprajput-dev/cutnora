import type { TransformMode } from "../hooks/useTransformHandler";

type ResizeCursor = "ew-resize" | "nwse-resize" | "ns-resize" | "nesw-resize";

const CURSORS: ResizeCursor[] = [
  "ew-resize",
  "nwse-resize",
  "ns-resize",
  "nesw-resize",
];

const HANDLE_AXIS_DEGREES: Partial<Record<TransformMode, number>> = {
  "resize-e": 0,
  "resize-w": 0,
  "resize-se": 45,
  "resize-nw": 45,
  "resize-n": 90,
  "resize-s": 90,
  "resize-ne": 135,
  "resize-sw": 135,
};

/** Selects the closest native resize cursor for a rotated handle axis. */
export function getRotatedResizeCursor(
  mode: TransformMode,
  rotation: number,
): ResizeCursor {
  const axis = HANDLE_AXIS_DEGREES[mode] ?? 0;
  const normalizedAngle = (((axis + rotation) % 180) + 180) % 180;
  const cursorIndex = Math.round(normalizedAngle / 45) % CURSORS.length;

  return CURSORS[cursorIndex];
}
