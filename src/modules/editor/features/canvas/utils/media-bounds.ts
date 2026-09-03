import type { FitMode } from "@/modules/editor/types";

export interface MediaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GetVisibleMediaBoundsOptions {
  containerWidth: number;
  containerHeight: number;
  sourceWidth?: number;
  sourceHeight?: number;
  fitMode?: FitMode;
}

/**
 * Returns the pixels occupied by the media inside its transform box.
 * ImageLayer and VideoLayer treat every mode except cover/fill as contain,
 * so legacy projects with a missing fitMode must follow the same rule here.
 */
export function getVisibleMediaBounds({
  containerWidth,
  containerHeight,
  sourceWidth,
  sourceHeight,
  fitMode,
}: GetVisibleMediaBoundsOptions): MediaBounds {
  const fullBounds = {
    x: 0,
    y: 0,
    width: Math.max(0, containerWidth),
    height: Math.max(0, containerHeight),
  };

  if (
    fitMode === "cover" ||
    fitMode === "fill" ||
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    !sourceWidth ||
    !sourceHeight ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return fullBounds;
  }

  const scale = Math.min(
    containerWidth / sourceWidth,
    containerHeight / sourceHeight,
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
}
