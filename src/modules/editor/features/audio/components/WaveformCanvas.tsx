'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface WaveformCanvasProps {
  peaks: number[];
  sourceStart: number;
  sourceDuration: number;
  totalAssetDuration: number;
  isMuted?: boolean;
  className?: string;
  width?: number;
}

export function WaveformCanvas({
  peaks,
  sourceStart,
  sourceDuration,
  totalAssetDuration,
  isMuted = false,
  className = '',
  width: propWidth,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Accurate CSS dimensions of the canvas element
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(
      10,
      Math.floor(propWidth ?? (rect.width > 0 ? rect.width : canvas.offsetWidth || 100))
    );
    const cssHeight = Math.max(
      8,
      Math.floor(rect.height > 0 ? rect.height : canvas.offsetHeight || 32)
    );

    // Limit maximum canvas pixel dimension to 8192 to avoid browser texture allocation limits
    const MAX_CANVAS_PIXELS = 8192;
    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const dprY = Math.min(rawDpr, 2);

    const targetPixelWidth = Math.min(Math.round(cssWidth * dprY), MAX_CANVAS_PIXELS);
    const targetPixelHeight = Math.round(cssHeight * dprY);

    if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
      canvas.width = targetPixelWidth;
      canvas.height = targetPixelHeight;
    }

    // Crucial: Separate horizontal and vertical scale transforms!
    // scaleX maps CSS width to buffer width; scaleY ALWAYS maps CSS height to buffer height (dprY).
    const scaleX = targetPixelWidth / cssWidth;
    const scaleY = targetPixelHeight / cssHeight;

    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Calculate sub-range of peaks corresponding to visible sourceStart..sourceStart+sourceDuration
    const duration = Math.max(0.05, totalAssetDuration);
    const startFraction = Math.max(0, Math.min(1, sourceStart / duration));
    const endFraction = Math.max(startFraction, Math.min(1, (sourceStart + sourceDuration) / duration));

    const startIndex = Math.floor(startFraction * (peaks.length - 1));
    const endIndex = Math.min(peaks.length - 1, Math.max(startIndex, Math.ceil(endFraction * (peaks.length - 1))));

    const slicedPeaks = peaks.slice(startIndex, endIndex + 1);
    if (slicedPeaks.length === 0) return;

    const midY = cssHeight / 2;

    const isDark =
      typeof document !== 'undefined'
        ? document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark'
        : true;

    // Draw center subtle reference baseline matching theme
    ctx.strokeStyle = isDark
      ? isMuted
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.1)'
      : isMuted
        ? 'rgba(0, 0, 0, 0.04)'
        : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(cssWidth, midY);
    ctx.stroke();

    // Studio audio waveform gradient with comfortable, glare-free luminance
    const gradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
    if (isDark) {
      if (isMuted) {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      } else {
        // Soft, elegant studio zinc with controlled opacity to eliminate blinding glare
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.46)');
        gradient.addColorStop(0.4, 'rgba(228, 228, 231, 0.34)');
        gradient.addColorStop(0.8, 'rgba(212, 212, 216, 0.25)');
        gradient.addColorStop(1, 'rgba(161, 161, 170, 0.18)');
      }
    } else {
      if (isMuted) {
        gradient.addColorStop(0, 'rgba(24, 24, 27, 0.12)');
        gradient.addColorStop(1, 'rgba(24, 24, 27, 0.05)');
      } else {
        // Calm, balanced slate in light mode to prevent eye strain
        gradient.addColorStop(0, 'rgba(24, 24, 27, 0.44)');
        gradient.addColorStop(0.4, 'rgba(39, 39, 42, 0.30)');
        gradient.addColorStop(0.8, 'rgba(63, 63, 70, 0.22)');
        gradient.addColorStop(1, 'rgba(82, 82, 91, 0.16)');
      }
    }

    const M = slicedPeaks.length;
    const totalColumns = cssWidth;
    const isZoomedIn = totalColumns >= M;

    const topY = new Float32Array(totalColumns);
    const bottomY = new Float32Array(totalColumns);

    for (let x = 0; x < totalColumns; x++) {
      let rawAmp = 0.08;

      if (isZoomedIn) {
        // Continuous cosine interpolation between peaks when zoomed in
        const samplePos = M > 1 ? (x / Math.max(1, totalColumns - 1)) * (M - 1) : 0;
        const idx0 = Math.floor(samplePos);
        const idx1 = Math.min(M - 1, idx0 + 1);
        const frac = samplePos - idx0;
        const smoothT = (1 - Math.cos(frac * Math.PI)) / 2;
        const p0 = slicedPeaks[idx0] ?? 0.08;
        const p1 = slicedPeaks[idx1] ?? 0.08;
        rawAmp = p0 * (1 - smoothT) + p1 * smoothT;
      } else {
        // Window max pooling when zoomed out so transients and beats are preserved
        const startPos = (x / totalColumns) * M;
        const endPos = ((x + 1) / totalColumns) * M;
        const startIdx = Math.floor(startPos);
        const endIdx = Math.max(startIdx + 1, Math.min(M, Math.ceil(endPos)));
        let maxVal = 0;
        for (let j = startIdx; j < endIdx; j++) {
          const v = slicedPeaks[j] ?? 0;
          if (v > maxVal) maxVal = v;
        }
        rawAmp = maxVal;
      }

      const amp = Math.max(0.06, Math.min(1.0, rawAmp));
      // Calibrated 72% height and 2.5px baseline to prevent overwhelming the clip area
      const waveHeight = Math.max(2.5, amp * (cssHeight * 0.72));
      const halfH = waveHeight / 2;
      topY[x] = midY - halfH;
      bottomY[x] = midY + halfH;
    }

    // 1. Draw solid continuous filled waveform envelope
    ctx.beginPath();
    ctx.moveTo(0, topY[0]);
    for (let x = 1; x < totalColumns; x++) {
      ctx.lineTo(x, topY[x]);
    }
    ctx.lineTo(totalColumns - 1, bottomY[totalColumns - 1]);
    for (let x = totalColumns - 1; x >= 0; x--) {
      ctx.lineTo(x, bottomY[x]);
    }
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Draw refined, non-glaring perimeter contour
    ctx.strokeStyle = isDark
      ? isMuted
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(255, 255, 255, 0.50)'
      : isMuted
        ? 'rgba(24, 24, 27, 0.12)'
        : 'rgba(24, 24, 27, 0.48)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [peaks, sourceStart, sourceDuration, totalAssetDuration, isMuted, propWidth]);

  // Redraw when properties change
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      draw();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // Observe container/canvas resize dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        draw();
      });
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  // React to theme changes (dark/light) immediately
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      draw();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} className={`h-full w-full pointer-events-none ${className}`} />;
}
