export interface RulerTick {
  time: number; // In seconds
  label: string;
  isMajor: boolean;
}

export function formatTimecode(seconds: number, fps = 30, includeFrames = false): string {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  const frames = Math.floor((s % 1) * fps);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (includeFrames) {
    const ff = String(frames).padStart(2, '0');
    return `${mm}:${ss}:${ff}`;
  }

  return `${mm}:${ss}`;
}

export function generateRulerTicks(duration: number, zoom: number, fps = 30): RulerTick[] {
  if (duration <= 0) {
    return [
      {
        time: 0,
        label: formatTimecode(0, fps, false),
        isMajor: true,
      },
    ];
  }

  const ticks: RulerTick[] = [];
  const maxDuration = Math.ceil(duration);

  // Determine tick step in seconds based on zoom (px per second)
  let majorInterval = 5;
  if (zoom >= 150) majorInterval = 1;
  else if (zoom >= 80) majorInterval = 2;
  else if (zoom >= 40) majorInterval = 5;
  else if (zoom >= 20) majorInterval = 10;
  else majorInterval = 30;

  const minorInterval = majorInterval / 5;

  for (let t = 0; t <= maxDuration; t += minorInterval) {
    const roundedTime = Math.round(t * 100) / 100;
    const isMajor = Math.abs(roundedTime % majorInterval) < 0.01;
    const isPrecise = zoom >= 100;

    ticks.push({
      time: roundedTime,
      label: isMajor ? formatTimecode(roundedTime, fps, isPrecise) : '',
      isMajor,
    });
  }

  return ticks;
}
