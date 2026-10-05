"use client";

import React, { useMemo, useRef, useState } from "react";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { playbackClock } from "@/modules/editor/features/playback/services/playback-clock";
import { generateRulerTicks } from "../utils/ruler-utils";

export interface TimeRulerProps {
  duration: number;
  zoom: number; // Pixels per second; zoom changes the view, not clip timing.
  scrollLeft: number;
  viewportWidth?: number;
}

const RULER_OFFSET_X = 16;

export function TimeRuler({
  duration,
  zoom,
  scrollLeft,
  viewportWidth = 0,
}: TimeRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const seekingPointer = useRef<number | null>(null);
  const fps = usePlaybackStore((state) => state.fps);
  const [isSeeking, setIsSeeking] = useState(false);

  const ticks = useMemo(
    () =>
      generateRulerTicks(
        duration,
        zoom,
        fps,
        {
          start: Math.max(0, (scrollLeft - RULER_OFFSET_X - 80) / zoom),
          end: (scrollLeft + (viewportWidth || 1200) + 80) / zoom,
        },
      ),
    [duration, zoom, fps, scrollLeft, viewportWidth],
  );
  const totalWidthPx = Math.max(100, duration * zoom + RULER_OFFSET_X + 60);

  const seekFromPointer = (event: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    // The ruler itself scrolls, so its bounding box already includes scrollLeft.
    const clickX = event.clientX - rect.left - RULER_OFFSET_X;
    const time = Math.max(0, Math.min(duration, clickX / zoom));
    const frameTime = Math.round(time * fps) / fps;
    playbackClock.seek(Math.min(duration, frameTime));
  };

  const finishSeeking = (event: React.PointerEvent) => {
    if (event.pointerId !== seekingPointer.current) return;
    seekingPointer.current = null;
    setIsSeeking(false);
  };

  return (
    <div
      ref={rulerRef}
      role="group"
      aria-label="Timeline time ruler"
      onPointerDown={(event) => {
        if (event.button !== 0 || seekingPointer.current !== null) return;
        event.preventDefault();
        seekingPointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        usePlaybackStore.getState().setIsPlaying(false);
        setIsSeeking(true);
        seekFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerId === seekingPointer.current) seekFromPointer(event);
      }}
      onPointerUp={finishSeeking}
      onPointerCancel={finishSeeking}
      onLostPointerCapture={finishSeeking}
      style={{ minWidth: `${totalWidthPx}px` }}
      className={`relative h-6 w-full touch-none border-b border-studio-border bg-studio-panel-raised/20 text-studio-muted select-none ${isSeeking ? "cursor-grabbing" : "cursor-pointer"}`}
    >
      {ticks.map((tick) => (
        <div
          key={tick.time}
          style={{ left: `${RULER_OFFSET_X + tick.time * zoom}px` }}
          className="pointer-events-none absolute inset-y-0"
        >
          <div
            className={`w-px ${tick.isMajor ? "h-2 bg-studio-fg/35" : "h-1 bg-studio-border"}`}
          />
          {tick.label && (
            <span
              className="absolute bottom-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] leading-none tabular-nums text-studio-muted"
            >
              {tick.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
