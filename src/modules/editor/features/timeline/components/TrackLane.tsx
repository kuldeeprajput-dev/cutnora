"use client";

import React from "react";
import type { Track } from "@/modules/editor/types";
import { cn } from "@/shared/utils/cn";
import { TimelineClipItem, type TimelineClipItemProps } from "./TimelineClipItem";

export interface TrackLaneProps {
  track: Track;
  zoom: number; // Px per second
  trackHeight: number;
  totalWidthPx: number;
  dropState?: "valid" | "invalid" | null;
  draggingClipId?: string | null;
  reorderState?: "active" | "over" | null;
  reorderDropPosition?: "before" | "after";
  onStartDragClip: TimelineClipItemProps["onStartDrag"];
}

export function TrackLane({
  track,
  zoom,
  trackHeight,
  totalWidthPx,
  dropState,
  draggingClipId,
  reorderState,
  reorderDropPosition = "before",
  onStartDragClip,
}: TrackLaneProps) {
  return (
    <div
      style={{
        height: trackHeight,
        minWidth: totalWidthPx > 0 ? totalWidthPx : undefined,
      }}
      className={cn(
        "relative w-full bg-transparent select-none transition-[background-color,opacity,box-shadow]",
        dropState === "valid" && "bg-studio-hover/60 ring-1 ring-inset ring-studio-border-strong",
        dropState === "invalid" &&
          "bg-destructive/10 ring-1 ring-inset ring-destructive/50",
        reorderState === "active" && "opacity-35",
        reorderState === "over" && "bg-studio-hover/60",
      )}
    >
      {reorderState === "over" && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-[60] h-0.5 bg-studio-fg shadow-sm"
          style={{
            top: reorderDropPosition === "before" ? 0 : trackHeight - 2,
          }}
        />
      )}
      {track.clips.map((clip) => (
        <TimelineClipItem
          key={clip.id}
          clip={clip}
          track={track}
          zoom={zoom}
          trackHeight={trackHeight}
          isDragging={draggingClipId === clip.id}
          onStartDrag={onStartDragClip}
        />
      ))}
    </div>
  );
}
