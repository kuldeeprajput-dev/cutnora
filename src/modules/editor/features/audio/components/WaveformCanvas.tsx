'use client';

import React, { useRef, useEffect } from 'react';

export interface WaveformCanvasProps {
  peaks: number[];
  sourceStart: number;
  sourceDuration: number;
  totalAssetDuration: number;
  isMuted?: boolean;
  className?: string;
}

export function WaveformCanvas({
  peaks,
  sourceStart,
  sourceDuration,
  totalAssetDuration,
  isMuted = false,
  className = '',
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth || 100;
    const height = canvas.offsetHeight || 32;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Calculate sub-range of peaks corresponding to visible sourceStart..sourceStart+sourceDuration
    const duration = Math.max(0.1, totalAssetDuration);
    const startFraction = Math.max(0, Math.min(1, sourceStart / duration));
    const endFraction = Math.max(startFraction, Math.min(1, (sourceStart + sourceDuration) / duration));

    const startIndex = Math.floor(startFraction * (peaks.length - 1));
    const endIndex = Math.ceil(endFraction * (peaks.length - 1));

    const slicedPeaks = peaks.slice(startIndex, endIndex + 1);
    if (slicedPeaks.length === 0) return;

    const barWidth = 2;
    const barGap = 1;
    const totalBars = Math.floor(width / (barWidth + barGap));
    const midY = height / 2;

    ctx.fillStyle = isMuted ? 'rgba(146, 152, 163, 0.4)' : '#248A5A';

    for (let i = 0; i < totalBars; i++) {
      const peakIdx = Math.floor((i / totalBars) * slicedPeaks.length);
      const amp = slicedPeaks[peakIdx] || 0.1;
      const barHeight = Math.max(2, amp * (height * 0.8));
      const x = i * (barWidth + barGap);
      const y = midY - barHeight / 2;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [peaks, sourceStart, sourceDuration, totalAssetDuration, isMuted]);

  return <canvas ref={canvasRef} className={`h-full w-full pointer-events-none ${className}`} />;
}
