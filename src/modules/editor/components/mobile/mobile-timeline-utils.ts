const MIN_PIXELS_PER_SECOND = 0.05;
const MIN_RULER_LABEL_SPACING = 48;
const RULER_INTERVALS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];

export function getMobileRulerInterval(pixelsPerSecond: number) {
  const desiredInterval =
    MIN_RULER_LABEL_SPACING / Math.max(MIN_PIXELS_PER_SECOND, pixelsPerSecond);

  return (
    RULER_INTERVALS.find((interval) => interval >= desiredInterval) ??
    Math.ceil(desiredInterval / 3600) * 3600
  );
}
