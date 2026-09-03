"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/modules/core/db/database";
import type { TimelineClip } from "@/modules/editor/types";
import type { TransformMode } from "../hooks/useTransformHandler";
import { getVisibleMediaBounds } from "../utils/media-bounds";
import { getRotatedResizeCursor } from "../utils/resize-cursor";
import { RotateCw } from "lucide-react";

export interface SelectionOverlayProps {
  clip: TimelineClip;
  stageScale: number;
  onStartTransform: (
    clip: TimelineClip,
    mode: TransformMode,
    e: React.PointerEvent,
  ) => void;
  isDragging?: boolean;
}

export function SelectionOverlay({
  clip,
  stageScale,
  onStartTransform,
  isDragging = false,
}: SelectionOverlayProps) {
  const isMediaClip = clip.type === "image" || clip.type === "video";
  const asset = useLiveQuery(
    () =>
      isMediaClip && clip.assetId ? db.assets.get(clip.assetId) : undefined,
    [clip.assetId, isMediaClip],
    null,
  );

  const visibleBounds = getVisibleMediaBounds({
    containerWidth: clip.transform.width,
    containerHeight: clip.transform.height,
    sourceWidth: isMediaClip ? asset?.width : undefined,
    sourceHeight: isMediaClip ? asset?.height : undefined,
    fitMode: isMediaClip ? clip.transform.fitMode : "fill",
  });

  // Resize from the visible media rectangle rather than its letterboxed wrapper.
  // Its center is unchanged, so this also removes old gaps without a visual jump.
  const visibleClip: TimelineClip = {
    ...clip,
    transform: {
      ...clip.transform,
      x: clip.transform.x + visibleBounds.x,
      y: clip.transform.y + visibleBounds.y,
      width: visibleBounds.width,
      height: visibleBounds.height,
    },
  };

  const clipForResize = (mode: TransformMode): TimelineClip => {
    const isSideHandle =
      mode === "resize-n" ||
      mode === "resize-e" ||
      mode === "resize-s" ||
      mode === "resize-w";

    if (!isMediaClip || !isSideHandle) return visibleClip;

    // A side handle changes the visible frame on only that axis. Cover keeps
    // the media attached to the frame without stretching its pixels.
    return {
      ...visibleClip,
      transform: {
        ...visibleClip.transform,
        fitMode: "cover",
      },
    };
  };

  const handles: { mode: TransformMode; className: string }[] = [
    { mode: "resize-nw", className: "-top-1.5 -left-1.5" },
    {
      mode: "resize-n",
      className: "-top-1.5 left-1/2 -translate-x-1/2",
    },
    { mode: "resize-ne", className: "-top-1.5 -right-1.5" },
    {
      mode: "resize-e",
      className: "top-1/2 -right-1.5 -translate-y-1/2",
    },
    {
      mode: "resize-se",
      className: "-bottom-1.5 -right-1.5",
    },
    {
      mode: "resize-s",
      className: "-bottom-1.5 left-1/2 -translate-x-1/2",
    },
    {
      mode: "resize-sw",
      className: "-bottom-1.5 -left-1.5",
    },
    {
      mode: "resize-w",
      className: "top-1/2 -left-1.5 -translate-y-1/2",
    },
  ];

  // Avoid briefly drawing the old full-box selection while IndexedDB resolves.
  if (isMediaClip && clip.assetId && asset === null) return null;

  return (
    <div
      id={`overlay-${clip.id}`}
      className="absolute pointer-events-none border-2 border-selection z-30 select-none"
      style={{
        left: visibleBounds.x * stageScale,
        top: visibleBounds.y * stageScale,
        width: visibleBounds.width * stageScale,
        height: visibleBounds.height * stageScale,
      }}
    >
      {/* Center Dot Indicator during drag */}
      {isDragging && (
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand shadow-md z-40" />
      )}

      {/* Rotation Handle - Positioned below top selection line */}
      <div
        onPointerDown={(e) => onStartTransform(clip, "rotate", e)}
        className="pointer-events-auto absolute left-1/2 top-2 z-40 flex h-10 w-10 -translate-x-1/2 touch-none items-center justify-center rounded-full border border-selection/50 bg-studio-topbar/95 text-selection shadow-lg transition-transform active:scale-95 active:cursor-grabbing lg:top-3 lg:h-6 lg:w-6 lg:cursor-grab lg:border-selection/40 lg:bg-studio-topbar/90 lg:shadow-md lg:backdrop-blur-sm lg:hover:scale-110"
        title="Drag to rotate"
        aria-label="Rotate selected media"
      >
        <RotateCw className="h-4.5 w-4.5 lg:h-3.5 lg:w-3.5" />
      </div>

      {/* 8 Resize Handles */}
      {handles.map((h) => (
        <div
          key={h.mode}
          onPointerDown={(e) =>
            onStartTransform(clipForResize(h.mode), h.mode, e)
          }
          style={{
            cursor: getRotatedResizeCursor(h.mode, clip.transform.rotation),
          }}
          className={`pointer-events-auto absolute hidden h-3 w-3 lg:block rounded-sm border-2 border-studio-bg bg-selection shadow-sm z-40 hover:scale-125 transition-transform ${h.className}`}
        />
      ))}
    </div>
  );
}
