"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/modules/core/db/database";
import type { TimelineClip } from "@/modules/editor/types";
import type { TransformMode } from "../hooks/useTransformHandler";
import { getVisibleMediaBounds } from "../utils/media-bounds";
import { getRotatedResizeCursor } from "../utils/resize-cursor";
import { RotateCw } from "lucide-react";

const isCornerHandle = (mode: TransformMode) =>
  ["resize-nw", "resize-ne", "resize-sw", "resize-se"].includes(mode);

export interface SelectionOverlayProps {
  clip: TimelineClip;
  stageScale: number;
  onStartTransform: (
    clip: TimelineClip,
    mode: TransformMode,
    e: React.PointerEvent,
  ) => void;
  isDragging?: boolean;
  isSticker?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function SelectionOverlay({
  clip,
  stageScale,
  onStartTransform,
  isDragging = false,
  isSticker = false,
  canvasWidth,
  canvasHeight,
}: SelectionOverlayProps) {
  const isMediaClip = clip.type === "image" || clip.type === "video";
  const isTextClip = clip.type === "text";
  const isElementClip = clip.type === "overlay" || isSticker;
  const compactControls = isTextClip || isSticker;
  const mediaControls = isMediaClip && !isSticker;
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
  const prefersRotationOutside =
    !isMediaClip ||
    isSticker ||
    visibleBounds.width * stageScale < 160 ||
    visibleBounds.height * stageScale < 100;
  // Check the rotated control in canvas coordinates, including its touch area.
  // Full-height selections keep rotation inside so the stage cannot clip it.
  const controlRadius = (compactControls ? 22 : 20) / (stageScale || 1);
  const controlDistance = visibleBounds.height / 2 +
    (compactControls ? 26 : 44) / (stageScale || 1);
  const radians = (clip.transform.rotation * Math.PI) / 180;
  const controlX =
    clip.transform.x + visibleBounds.x + visibleBounds.width / 2 +
    Math.sin(radians) * controlDistance;
  const controlY =
    clip.transform.y + visibleBounds.y + visibleBounds.height / 2 -
    Math.cos(radians) * controlDistance;
  const rotationOutside =
    prefersRotationOutside &&
    visibleBounds.height < canvasHeight - 1 &&
    controlX - controlRadius >= 0 &&
    controlX + controlRadius <= canvasWidth &&
    controlY - controlRadius >= 0 &&
    controlY + controlRadius <= canvasHeight;

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
  const resizeHandles = isSticker
    ? handles.filter((handle) => isCornerHandle(handle.mode))
    : handles;

  // Avoid briefly drawing the old full-box selection while IndexedDB resolves.
  if (isMediaClip && clip.assetId && asset === null) return null;

  return (
    <div
      id={`overlay-${clip.id}`}
      className={`absolute pointer-events-none z-30 select-none ${compactControls ? "border border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" : mediaControls ? "border-[1.5px] border-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]" : "border-[1.5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.35)]"}`}
      style={{
        left: visibleBounds.x * stageScale,
        top: visibleBounds.y * stageScale,
        width: visibleBounds.width * stageScale,
        height: visibleBounds.height * stageScale,
      }}
    >
      {/* Center Dot Indicator during drag */}
      {isDragging && !compactControls && (
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black/80 bg-white shadow-lg z-40" />
      )}

      {/* Keep rotation outside when it fits, and inside at the canvas edges. */}
      <div
        onPointerDown={(e) => onStartTransform(clip, "rotate", e)}
        className={`pointer-events-auto absolute left-1/2 ${rotationOutside ? compactControls ? "-top-12 lg:-top-10" : "-top-16 lg:-top-12" : "top-2 lg:top-3"} z-50 flex -translate-x-1/2 touch-none cursor-grab items-center justify-center rounded-full text-studio-fg active:cursor-grabbing ${compactControls ? "group/rotate h-11 w-11 lg:h-8 lg:w-8" : "h-10 w-10 border border-studio-border bg-studio-panel-raised/95 shadow-xl backdrop-blur-md transition-colors hover:bg-studio-hover hover:border-studio-border-strong lg:h-6.5 lg:w-6.5"}`}
        title="Drag to rotate. Hold Shift to snap."
        aria-label={
          isTextClip
            ? "Rotate selected text"
            : isElementClip
              ? "Rotate selected element"
              : "Rotate selected media"
        }
      >
        <span className={compactControls ? "pointer-events-none flex h-5.5 w-5.5 items-center justify-center rounded-full border border-studio-border bg-studio-panel-raised/95 text-studio-fg shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-colors group-hover/rotate:border-studio-border-strong group-hover/rotate:bg-studio-hover" : "contents"}>
          <RotateCw
            style={{ transform: `rotate(${-clip.transform.rotation}deg)` }}
            strokeWidth={2}
            className={compactControls ? "h-3.5 w-3.5" : "h-4.5 w-4.5 lg:h-3.5 lg:w-3.5"}
          />
        </span>
      </div>

      {/* Stickers scale from corners; text and shapes also expose box edges. */}
      {resizeHandles.map((h) => (
        <div
          key={h.mode}
          title={
            isTextClip
              ? isCornerHandle(h.mode)
                ? "Scale text"
                : "Resize text box"
              : isSticker
                ? "Scale sticker"
                : isElementClip
                  ? "Resize element"
                  : "Resize media"
          }
          onPointerDown={(e) =>
            onStartTransform(clipForResize(h.mode), h.mode, e)
          }
          style={{
            cursor: getRotatedResizeCursor(h.mode, clip.transform.rotation),
          }}
          className={`pointer-events-auto absolute ${isTextClip || isElementClip ? `${compactControls ? "flex" : "block"} touch-none before:absolute before:-inset-4 before:content-[''] lg:before:hidden` : "hidden lg:block"} h-3 w-3 z-40 ${compactControls ? "rounded-full items-center justify-center" : mediaControls ? `${isCornerHandle(h.mode) ? "rounded-[4px]" : "rounded-full"} border-[1.5px] border-black/65 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.28)] ring-1 ring-white/20 transition-transform duration-150 hover:scale-110 hover:border-black/85` : "rounded-full border-2 border-black/90 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] hover:scale-125 hover:border-black transition-transform"} ${h.className}`}
        >
          {compactControls && (
            <span className={`pointer-events-none rounded-full border border-black/60 bg-white shadow-sm ${isCornerHandle(h.mode) ? "h-1.5 w-1.5" : "h-1 w-1"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
