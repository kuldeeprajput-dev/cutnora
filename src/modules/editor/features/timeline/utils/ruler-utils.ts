export interface RulerTick {
  time: number; // In seconds
  label: string;
  isMajor: boolean;
}

export function formatTimecode(
  seconds: number,
  fps = 30,
  includeFrames = false,
): string {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const hours = Math.floor(s / 3600);
  const mins = Math.floor(s / 60) % 60;
  const secs = Math.floor(s % 60);
  const frames = Math.floor((s % 1) * fps);

  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  const prefix = hours > 0 ? `${String(hours).padStart(2, "0")}:` : "";

  if (includeFrames) {
    const ff = String(frames).padStart(2, "0");
    return `${prefix}${mm}:${ss}:${ff}`;
  }

  return `${prefix}${mm}:${ss}`;
}

export function generateRulerTicks(
  duration: number,
  zoom: number,
  fps = 30,
  visibleRange?: { start: number; end: number },
): RulerTick[] {
  if (!Number.isFinite(duration) || duration <= 0) {
    return [
      {
        time: 0,
        label: formatTimecode(0, fps, false),
        isMajor: true,
      },
    ];
  }

  const ticks: RulerTick[] = [];
  const safeZoom = Math.max(0.05, Number.isFinite(zoom) ? zoom : 50);
  // Labels need room to remain readable; fine ticks appear as the view expands.
  const intervals = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
  const majorInterval =
    intervals.find((interval) => interval * safeZoom >= 80) ?? 3600;
  const divisions =
    [10, 5, 4, 2, 1].find(
      (count) => (majorInterval * safeZoom) / count >= 12,
    ) ?? 1;
  const minorInterval = majorInterval / divisions;
  const start = Math.max(0, visibleRange?.start ?? 0);
  const end = Math.min(duration, visibleRange?.end ?? duration);
  const firstIndex = Math.max(0, Math.floor(start / minorInterval));
  const lastIndex = Math.floor((end + 1e-6) / minorInterval);

  for (let index = firstIndex; index <= lastIndex; index++) {
    const roundedTime = Math.round(index * minorInterval * 1000) / 1000;
    const isMajor = index % divisions === 0;

    ticks.push({
      time: roundedTime,
      label: isMajor ? formatTimecode(roundedTime, fps, false) : "",
      isMajor,
    });
  }

  return ticks;
}
