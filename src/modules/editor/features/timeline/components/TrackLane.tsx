"use client";

import React from "react";
import type { Track, TimelineClip } from "@/modules/editor/types";
import { cn } from "@/shared/utils/cn";
import { TimelineClipItem } from "./TimelineClipItem";

export interface TrackLaneProps {
  track: Track;
  zoom: number; // Px per second
  totalWidthPx: number;
  dropState?: "valid" | "invalid" | null;
  draggingClipId?: string | null;
  reorderState?: "active" | "over" | null;
  reorderDropPosition?: "before" | "after";
  onStartDragClip: (
    clip: TimelineClip,
    mode: "move" | "trim-start" | "trim-end",
    e: React.PointerEvent,
  ) => void;
}

export function TrackLane({
  track,
  zoom,
  totalWidthPx,
  dropState,
  draggingClipId,
  reorderState,
  reorderDropPosition = "before",
  onStartDragClip,
}: TrackLaneProps) {
  return (
    <div
      style={totalWidthPx > 0 ? { minWidth: `${totalWidthPx}px` } : undefined}
      className={cn(
        "relative h-12 w-full bg-transparent select-none transition-[background-color,opacity,box-shadow]",
        dropState === "valid" && "bg-white/5 ring-1 ring-inset ring-white/30",
        dropState === "invalid" &&
          "bg-destructive/10 ring-1 ring-inset ring-destructive/50",
        reorderState === "active" && "opacity-35",
        reorderState === "over" && "bg-white/5",
      )}
    >
      {reorderState === "over" && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 right-0 z-[60] h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]",
            reorderDropPosition === "before" ? "-top-px" : "-bottom-px",
          )}
        >
          <span className="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white" />
        </div>
      )}
      {track.clips.map((clip) => (
        <TimelineClipItem
          key={clip.id}
          clip={clip}
          track={track}
          zoom={zoom}
          isDragging={draggingClipId === clip.id}
          onStartDrag={onStartDragClip}
        />
      ))}
    </div>
  );
}
