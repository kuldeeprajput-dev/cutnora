"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ThemedImagePreviewProps {
  src: string;
  alt: string;
  previewFullscreen?: boolean;
  onTogglePreviewFullscreen?: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const SCALE_STEP = 0.25;

export function ThemedImagePreview({ src, alt, previewFullscreen = false, onTogglePreviewFullscreen }: ThemedImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || previewFullscreen;
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset zoom & pan when image src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [src]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => setIsNativeFullscreen(
      window.matchMedia("(max-width: 1023px)").matches
        ? document.fullscreenElement === containerRef.current
        : Boolean(document.fullscreenElement),
    );
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (window.matchMedia("(max-width: 1023px)").matches && onTogglePreviewFullscreen) {
      onTogglePreviewFullscreen();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Ignored if rejected by browser policy
    }
  }, [onTogglePreviewFullscreen]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_SCALE, Math.round((prev + SCALE_STEP) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, Math.round((prev - SCALE_STEP) * 100) / 100);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((prev) => {
      const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(prev * zoomFactor * 100) / 100));
      if (target <= 1) setPosition({ x: 0, y: 0 });
      return target;
    });
  }, []);

  // Double click to toggle 2x zoom / fit
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale > 1) {
      handleReset();
    } else {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: -clickX * 0.8, y: -clickY * 0.8 });
      }
      setScale(2);
    }
  }, [scale, handleReset]);

  // Drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch pan support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const percentage = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === "0" || e.key === "r" || e.key === "R") {
          e.preventDefault();
          handleReset();
        } else if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        }
      }}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "group relative flex w-full select-none items-center justify-center overflow-hidden rounded-lg bg-black outline-none ring-white/30 focus-visible:ring-2",
        isFullscreen ? "h-full w-full" : "aspect-video",
        scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      )}
      role="region"
      aria-label={`Image preview: ${alt}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none h-full w-full object-contain will-change-transform"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 150ms cubic-bezier(0.2, 0, 0.2, 1)",
        }}
      />

      {/* Floating Zoom & Fullscreen Control Pill */}
      <div
        className={cn(
          "absolute z-20 flex items-center gap-1 rounded-full border border-white/10 bg-[#1A1A1A]/85 px-2.5 py-1 text-white shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 sm:opacity-90",
          isFullscreen
            ? "bottom-6 right-6"
            : "bottom-3 right-3"
        )}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out (-)"
          title="Zoom out (-)"
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset zoom to 100% (0)"
          title="Click to reset zoom (0)"
          className="min-w-[40px] px-1 text-center font-mono text-[11px] font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          {percentage}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in (+)"
          title="Zoom in (+)"
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        {scale !== 1 && (
          <>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <button
              type="button"
              onClick={handleReset}
              aria-label="Fit to view (R)"
              title="Fit to view (R)"
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        <span className="h-3 w-px bg-white/15" aria-hidden="true" />

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={previewFullscreen ? "Back to media details" : isFullscreen ? "Exit full screen (F)" : "Full screen (F)"}
          title={isFullscreen ? "Exit full screen (F)" : "Full screen (F)"}
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Quick helper tip when zoomed */}
      {scale > 1 && (
        <div
          className={cn(
            "pointer-events-none absolute z-20 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur-xs",
            isFullscreen ? "top-6 left-6" : "top-3 left-3"
          )}
        >
          Drag to pan • Double-click to reset
        </div>
      )}
    </div>
  );
}
