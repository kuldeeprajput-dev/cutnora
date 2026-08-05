'use client';

import React, { useRef, useState } from 'react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { generateRulerTicks } from '../utils/ruler-utils';

export interface TimeRulerProps {
  duration: number;
  zoom: number; // Px per second
  scrollLeft: number;
}

export function TimeRuler({ duration, zoom, scrollLeft }: TimeRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const { playhead, setPlayhead, fps } = usePlaybackStore();
  const [isSeeking, setIsSeeking] = useState(false);

  const RULER_OFFSET_X = 16;
  const ticks = generateRulerTicks(duration, zoom, fps);
  const totalWidthPx = Math.max(100, duration * zoom + RULER_OFFSET_X + 60);
  const playheadLeftPx = RULER_OFFSET_X + playhead * zoom;

  const seekFromPointer = (e: React.PointerEvent | PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollLeft - RULER_OFFSET_X;
    const targetTime = Math.max(0, Math.min(duration, clickX / zoom));
    setPlayhead(targetTime);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsSeeking(true);
    seekFromPointer(e);

    const handlePointerMove = (moveEv: PointerEvent) => {
      seekFromPointer(moveEv);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsSeeking(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={rulerRef}
      onPointerDown={handlePointerDown}
      style={{ minWidth: `${totalWidthPx}px` }}
      className={`relative h-6 w-full border-b border-studio-border bg-studio-topbar text-studio-muted select-none ${
        isSeeking ? 'cursor-grabbing' : 'cursor-pointer'
      }`}
    >
      {/* Ticks */}
      {ticks.map((tick, i) => {
        const leftPx = RULER_OFFSET_X + tick.time * zoom;
        return (
          <div key={i} style={{ left: `${leftPx}px` }} className="absolute top-0 bottom-0 flex flex-col justify-between">
            <div className={`w-px bg-studio-border ${tick.isMajor ? 'h-3 bg-mkt-muted' : 'h-1.5'}`} />
            {tick.label && (
              <span className="font-mono text-[9px] font-semibold text-studio-muted -translate-x-1/2 mb-0.5">
                {tick.label}
              </span>
            )}
          </div>
        );
      })}

      {/* Red Playhead Handle Indicator */}
      <div
        style={{ left: `${playheadLeftPx}px` }}
        className="absolute top-0 bottom-0 z-30 pointer-events-none -translate-x-1/2"
      >
        <div className="h-2.5 w-2.5 rotate-45 bg-brand shadow-sm -mt-1" />
      </div>
    </div>
  );
}
