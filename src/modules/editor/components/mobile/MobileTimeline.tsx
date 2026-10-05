"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Minus,
  Music,
  Plus,
  Type,
  Video,
} from "lucide-react";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { TimelineClip } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { playbackClock } from "@/modules/editor/features/playback/services/playback-clock";
import { useProjectStore } from "@/modules/projects";
import { cn } from "@/shared/utils/cn";
import { getMobileRulerInterval } from "./mobile-timeline-utils";

const MAX_PIXELS_PER_SECOND = 48;
const MIN_PIXELS_PER_SECOND = 0.05;
const TIMELINE_GUTTER = 16;
const MIN_CLIP_DURATION = 0.1;
const MIN_TIMELINE_ZOOM = 0.5;
const MAX_TIMELINE_ZOOM = 6;
const TIMELINE_ZOOM_STEP = 0.25;

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = Math.floor(safe % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function clipIcon(clip: TimelineClip) {
  if (clip.type === "audio") return Music;
  if (clip.type === "text") return Type;
  if (clip.type === "video") return Video;
  return ImageIcon;
}

type DragState = {
  clip: TimelineClip;
  mode: "move" | "trim-start" | "trim-end";
  pointerStartX: number;
  moved: boolean;
};

export function MobileTimeline() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const moveClip = useProjectStore((state) => state.moveClip);
  const trimClip = useProjectStore((state) => state.trimClip);
  const selectedClipIds = useEditorUIStore((state) => state.selectedClipIds);
  const setSelectedClipIds = useEditorUIStore(
    (state) => state.setSelectedClipIds,
  );
  const setActiveInspectorTab = useEditorUIStore(
    (state) => state.setActiveInspectorTab,
  );
  const playhead = usePlaybackStore((state) => state.playhead);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
    anchorTime: number;
  } | null>(null);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  } | null>(null);
  const zoomRef = useRef(1);
  const zoomFrameRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<{ zoom: number; scrollLeft: number } | null>(null);
  const pendingScrollRef = useRef<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [preview, setPreview] = useState<{
    clipId: string;
    start: number;
    duration: number;
    sourceStart: number;
  } | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>(
    {},
  );

  const clips = useMemo(
    () =>
      (currentProject?.tracks.flatMap((track) => track.clips) ?? []).sort(
        (a, b) => a.timelineStart - b.timelineStart,
      ),
    [currentProject],
  );

  const duration = clips.length === 0
    ? 0
    : Math.max(
        currentProject?.settings.duration ?? 0,
        ...clips.map((clip) => clip.timelineStart + clip.timelineDuration),
        0,
      );
  const basePixelsPerSecond = Math.min(
    MAX_PIXELS_PER_SECOND,
    Math.max(
      MIN_PIXELS_PER_SECOND,
      ((viewportWidth || 320) - TIMELINE_GUTTER * 2) / Math.max(duration, 1),
    ),
  );
  const pixelsPerSecond = basePixelsPerSecond * timelineZoom;
  const rulerInterval = getMobileRulerInterval(pixelsPerSecond);
  const calculatedWidth =
    Math.ceil(duration * pixelsPerSecond) + TIMELINE_GUTTER * 2;
  const isOverflowing = viewportWidth > 0 && calculatedWidth > viewportWidth;
  const contentWidth = isOverflowing ? calculatedWidth : 0;

  // Apply the scroll anchor after React updates the timeline's width.
  useLayoutEffect(() => {
    if (pendingScrollRef.current !== null && scrollRef.current) {
      scrollRef.current.scrollLeft = pendingScrollRef.current;
      pendingScrollRef.current = null;
    }
  }, [timelineZoom]);

  useEffect(() => () => {
    if (zoomFrameRef.current !== null) {
      window.cancelAnimationFrame(zoomFrameRef.current);
    }
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateWidth = () => setViewportWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !isPlaying || clips.length === 0 || pinchRef.current || panRef.current?.moved) return;

    const playheadX = TIMELINE_GUTTER + playhead * pixelsPerSecond;
    const visibleRight = element.scrollLeft + element.clientWidth - 40;
    if (playheadX > visibleRight) {
      element.scrollTo({ left: Math.max(0, playheadX - 40) });
    } else if (playheadX < element.scrollLeft + 24) {
      element.scrollTo({ left: Math.max(0, playheadX - 24) });
    }
  }, [clips.length, isPlaying, pixelsPerSecond, playhead]);

  const changeTimelineZoom = (nextZoom: number) => {
    const clamped = Math.min(
      MAX_TIMELINE_ZOOM,
      Math.max(MIN_TIMELINE_ZOOM, nextZoom),
    );
    const element = scrollRef.current;
    const centerTime = element
      ? Math.max(
          0,
          (element.scrollLeft + element.clientWidth / 2 - TIMELINE_GUTTER) /
            pixelsPerSecond,
        )
      : playhead;

    if (element) {
      pendingScrollRef.current = Math.max(
        0,
        TIMELINE_GUTTER +
          centerTime * basePixelsPerSecond * clamped -
          element.clientWidth / 2,
      );
    }
    zoomRef.current = clamped;
    setTimelineZoom(clamped);
  };

  const flushPinchZoom = () => {
    zoomFrameRef.current = null;
    const pending = pendingZoomRef.current;
    pendingZoomRef.current = null;
    if (!pending) return;

    pendingScrollRef.current = pending.scrollLeft;
    if (pending.zoom === zoomRef.current) {
      // At a zoom limit the midpoint can still move without a React update.
      if (scrollRef.current) scrollRef.current.scrollLeft = pending.scrollLeft;
    } else {
      zoomRef.current = pending.zoom;
      setTimelineZoom(pending.zoom);
    }
  };

  const handleTouchPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || clips.length === 0) return;
    const element = event.currentTarget;
    const points = touchPointsRef.current;
    if (points.size >= 2 && !points.has(event.pointerId)) {
      event.preventDefault();
      event.stopPropagation();
      element.setPointerCapture(event.pointerId);
      return;
    }
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (points.size === 2) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = null;
      panRef.current = null;
      setPreview(null);
      const [first, second] = Array.from(points.values());
      const midpoint = (first.x + second.x) / 2 - element.getBoundingClientRect().left;
      pinchRef.current = {
        distance: Math.max(8, Math.hypot(second.x - first.x, second.y - first.y)),
        zoom: zoomRef.current,
        anchorTime: Math.max(0, (element.scrollLeft + midpoint - TIMELINE_GUTTER) / (basePixelsPerSecond * zoomRef.current)),
      };
      for (const pointerId of points.keys()) element.setPointerCapture(pointerId);
      return;
    }

    if (!(event.target as HTMLElement).closest("[data-mobile-clip]")) {
      event.preventDefault();
      event.stopPropagation();
      element.setPointerCapture(event.pointerId);
      panRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: element.scrollLeft,
        moved: false,
      };
    }
  };

  const handleTouchPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const points = touchPointsRef.current;
    if (event.pointerType !== "touch" || !points.has(event.pointerId)) return;
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pinch = pinchRef.current;
    if (pinch) {
      event.preventDefault();
      event.stopPropagation();
      if (points.size < 2) return;
      const [first, second] = Array.from(points.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const zoom = Math.min(MAX_TIMELINE_ZOOM, Math.max(MIN_TIMELINE_ZOOM, pinch.zoom * distance / pinch.distance));
      const midpoint = (first.x + second.x) / 2 - event.currentTarget.getBoundingClientRect().left;
      pendingZoomRef.current = {
        zoom,
        scrollLeft: Math.max(0, TIMELINE_GUTTER + pinch.anchorTime * basePixelsPerSecond * zoom - midpoint),
      };
      if (zoomFrameRef.current === null) {
        zoomFrameRef.current = window.requestAnimationFrame(flushPinchZoom);
      }
      return;
    }

    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.clientX - pan.startX;
    if (Math.abs(delta) > 6) pan.moved = true;
    if (pan.moved) event.currentTarget.scrollLeft = Math.max(0, pan.scrollLeft - delta);
  };

  const handleTouchPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const points = touchPointsRef.current;
    if (event.pointerType !== "touch" || !points.has(event.pointerId)) return;
    points.delete(event.pointerId);

    if (pinchRef.current) {
      event.preventDefault();
      event.stopPropagation();
      if (zoomFrameRef.current !== null) window.cancelAnimationFrame(zoomFrameRef.current);
      flushPinchZoom();
      // Ignore the remaining finger until the whole pinch has ended.
      if (points.size === 0) pinchRef.current = null;
    } else if (panRef.current?.pointerId === event.pointerId) {
      event.preventDefault();
      event.stopPropagation();
      if (!panRef.current.moved && event.type === "pointerup") {
        const element = event.currentTarget;
        const x = event.clientX - element.getBoundingClientRect().left + element.scrollLeft - TIMELINE_GUTTER;
        playbackClock.seek(Math.min(duration, Math.max(0, x / pixelsPerSecond)));
        setSelectedClipIds([]);
      }
      panRef.current = null;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadThumbnails() {
      const next: Record<string, string> = {};
      const assetIds = Array.from(
        new Set(
          clips
            .map((clip) => clip.assetId)
            .filter((assetId): assetId is string => Boolean(assetId)),
        ),
      );
      const assets = await db.assets.bulkGet(assetIds);

      await Promise.all(
        assets.map(async (asset) => {
          if (!asset) return;
          if (asset.remotePreviewUrl || asset.remoteUrl) {
            next[asset.id] = asset.remotePreviewUrl ?? asset.remoteUrl ?? "";
            return;
          }
          if (!asset.thumbnailBlobId) return;

          const cachedUrl = objectUrlManager.getUrl(asset.thumbnailBlobId);
          if (cachedUrl) {
            next[asset.id] = cachedUrl;
            return;
          }

          const record = await db.thumbnails.get(asset.thumbnailBlobId);
          if (!record?.blob) return;
          const thumbnailUrl = objectUrlManager.createUrl(
            asset.thumbnailBlobId,
            record.blob,
          );
          if (!active) return;
          next[asset.id] = thumbnailUrl;
        }),
      );

      if (active) setThumbnailUrls(next);
    }

    void loadThumbnails();
    return () => {
      active = false;
    };
  }, [clips]);

  const commitDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = (event.clientX - drag.pointerStartX) / pixelsPerSecond;
    const clip = drag.clip;

    if (!drag.moved) {
      setActiveInspectorTab("transform");
      setSelectedClipIds([clip.id]);
      dragRef.current = null;
      setPreview(null);
      return;
    }

    if (drag.mode === "move") {
      const start = Math.max(0, clip.timelineStart + delta);
      moveClip(clip.id, clip.trackId, Number(start.toFixed(3)));
    } else if (drag.mode === "trim-start") {
      const maxDelta = clip.timelineDuration - MIN_CLIP_DURATION;
      const applied = Math.max(-clip.sourceStart, Math.min(delta, maxDelta));
      trimClip(
        clip.id,
        Number((clip.timelineStart + applied).toFixed(3)),
        Number((clip.timelineDuration - applied).toFixed(3)),
        Number((clip.sourceStart + applied).toFixed(3)),
      );
    } else {
      const sourceRemaining = Math.max(
        MIN_CLIP_DURATION,
        clip.sourceDuration - clip.sourceStart,
      );
      const nextDuration = Math.max(
        MIN_CLIP_DURATION,
        Math.min(sourceRemaining, clip.timelineDuration + delta),
      );
      trimClip(
        clip.id,
        clip.timelineStart,
        Number(nextDuration.toFixed(3)),
        clip.sourceStart,
      );
    }

    dragRef.current = null;
    setPreview(null);
  };

  const updateDragPreview = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.pointerStartX) < 6) return;
      drag.moved = true;
      setActiveInspectorTab("transform");
      setSelectedClipIds([drag.clip.id]);
    }
    const delta = (event.clientX - drag.pointerStartX) / pixelsPerSecond;
    const clip = drag.clip;
    if (drag.mode === "move") {
      setPreview({
        clipId: clip.id,
        start: Math.max(0, clip.timelineStart + delta),
        duration: clip.timelineDuration,
        sourceStart: clip.sourceStart,
      });
      return;
    }
    if (drag.mode === "trim-start") {
      const applied = Math.max(
        -clip.sourceStart,
        Math.min(delta, clip.timelineDuration - MIN_CLIP_DURATION),
      );
      setPreview({
        clipId: clip.id,
        start: clip.timelineStart + applied,
        duration: clip.timelineDuration - applied,
        sourceStart: clip.sourceStart + applied,
      });
      return;
    }
    setPreview({
      clipId: clip.id,
      start: clip.timelineStart,
      duration: Math.max(MIN_CLIP_DURATION, clip.timelineDuration + delta),
      sourceStart: clip.sourceStart,
    });
  };

  const beginDrag = (
    event: React.PointerEvent,
    clip: TimelineClip,
    mode: DragState["mode"],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    // Wait for a touch drag or release so a second finger can start a pinch
    // without selecting, seeking to, or moving the first touched clip.
    if (event.pointerType !== "touch") {
      setActiveInspectorTab("transform");
      setSelectedClipIds([clip.id]);
    }
    dragRef.current = { clip, mode, pointerStartX: event.clientX, moved: false };
    setPreview({
      clipId: clip.id,
      start: clip.timelineStart,
      duration: clip.timelineDuration,
      sourceStart: clip.sourceStart,
    });
  };

  const handleTimelinePointerDown = (event: React.PointerEvent) => {
    if (clips.length === 0) return;
    if ((event.target as HTMLElement).closest("[data-mobile-clip]")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    // The ruler content itself scrolls, so its bounding box already includes
    // the scroll offset. Adding scrollLeft here would seek too far to the right.
    const x = event.clientX - bounds.left - TIMELINE_GUTTER;
    playbackClock.seek(Math.min(duration, Math.max(0, x / pixelsPerSecond)));
    setSelectedClipIds([]);
  };

  return (
    <section aria-label="Timeline" className="flex min-h-0 flex-[1.15] flex-col overflow-hidden bg-timeline-bg">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-studio-border bg-studio-topbar px-3">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap font-mono text-[11px] leading-4 tabular-nums max-[359px]:text-[10px]">
          <span className="shrink-0 font-medium text-studio-fg/90">{formatTime(playhead)}</span>
          <span className="shrink-0 text-studio-muted/50">/</span>
          <span className="shrink-0 text-studio-muted">{formatTime(duration)}</span>
          <span className="ml-0.5 min-w-0 truncate border-l border-studio-border pl-2 font-sans text-[10px] text-studio-muted">
            {clips.length} {clips.length === 1 ? "clip" : "clips"}
          </span>
        </p>

        <div
          role="group"
          className="flex shrink-0 items-center gap-0.5"
          aria-label="Timeline zoom controls"
        >
          <button
            type="button"
            onClick={() => changeTimelineZoom(1)}
            disabled={clips.length === 0 || timelineZoom === 1}
            aria-label="Fit timeline to screen"
            className="flex h-9 w-8 touch-manipulation items-center justify-center rounded-md bg-transparent text-[10px] font-medium text-studio-fg active:text-brand disabled:opacity-40 focus-visible:outline-brand"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() =>
              changeTimelineZoom(timelineZoom - TIMELINE_ZOOM_STEP)
            }
            disabled={clips.length === 0 || timelineZoom <= MIN_TIMELINE_ZOOM}
            aria-label="Zoom timeline out"
            className="flex h-9 w-8 touch-manipulation items-center justify-center rounded-md text-studio-muted active:bg-studio-hover active:text-studio-fg disabled:opacity-40 focus-visible:outline-brand"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="range"
            min={MIN_TIMELINE_ZOOM}
            max={MAX_TIMELINE_ZOOM}
            step={TIMELINE_ZOOM_STEP}
            value={timelineZoom}
            onChange={(event) => changeTimelineZoom(Number(event.target.value))}
            disabled={clips.length === 0}
            aria-label="Timeline zoom level"
            aria-valuetext={`${Math.round(timelineZoom * 100)}%`}
            className={cn(
              "h-9 w-16 cursor-pointer touch-manipulation appearance-none rounded-md bg-transparent disabled:cursor-default disabled:opacity-40 focus-visible:outline-brand max-[359px]:w-12",
              "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-studio-fg/15",
              "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-studio-fg",
              "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-studio-fg/15",
              "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-studio-fg",
            )}
          />
          <button
            type="button"
            onClick={() =>
              changeTimelineZoom(timelineZoom + TIMELINE_ZOOM_STEP)
            }
            disabled={clips.length === 0 || timelineZoom >= MAX_TIMELINE_ZOOM}
            aria-label="Zoom timeline in"
            className="flex h-9 w-8 touch-manipulation items-center justify-center rounded-md text-studio-muted active:bg-studio-hover active:text-studio-fg disabled:opacity-40 focus-visible:outline-brand"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onPointerDownCapture={handleTouchPointerDown}
        onPointerMoveCapture={handleTouchPointerMove}
        onPointerUpCapture={handleTouchPointerEnd}
        onPointerCancelCapture={handleTouchPointerEnd}
        className={cn(
          "min-h-0 flex-1 overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          clips.length > 0
            ? "overflow-x-auto touch-none"
            : "overflow-x-hidden",
        )}
      >
        <div
          className="relative h-full min-h-[96px]"
          style={{ width: contentWidth > 0 ? `${contentWidth}px` : "100%" }}
          onPointerDown={handleTimelinePointerDown}
        >
          {clips.length > 0 ? (
            <div className="absolute inset-x-0 top-0 h-7 border-b border-studio-border bg-studio-panel/40">
              {Array.from(
                {
                  length: Math.floor(duration / rulerInterval) + 1,
                },
                (_, index) => {
                  const second = index * rulerInterval;
                  return (
                    <div
                      key={second}
                      className="absolute inset-y-0 border-l border-studio-border/80"
                      style={{ left: TIMELINE_GUTTER + second * pixelsPerSecond }}
                    >
                      <span
                        className={cn(
                          "mt-1 block whitespace-nowrap font-mono text-[9px] text-studio-muted/80",
                          index > 0 && "-translate-x-1/2 text-center",
                        )}
                      >
                        {formatTime(second)}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          ) : null}

          {clips.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs leading-5 text-studio-muted">
              Add media to start editing
            </div>
          ) : null}

          {clips.map((clip) => {
            const Icon = clipIcon(clip);
            const visual = preview?.clipId === clip.id ? preview : null;
            const start = visual?.start ?? clip.timelineStart;
            const clipDuration = visual?.duration ?? clip.timelineDuration;
            const selected = selectedClipIds.includes(clip.id) || preview?.clipId === clip.id;
            const thumb = clip.assetId
              ? thumbnailUrls[clip.assetId]
              : undefined;

            return (
              <div
                key={clip.id}
                data-mobile-clip
                onPointerDown={(event) => beginDrag(event, clip, "move")}
                onPointerMove={updateDragPreview}
                onPointerUp={commitDrag}
                onPointerCancel={() => {
                  dragRef.current = null;
                  setPreview(null);
                }}
                className={cn(
                  "absolute top-9 h-12 touch-none overflow-hidden rounded-lg border bg-brand/20",
                  selected
                    ? "border-brand ring-1 ring-brand"
                    : "border-brand/50",
                )}
                style={{
                  left: TIMELINE_GUTTER + start * pixelsPerSecond,
                  width: Math.max(48, clipDuration * pixelsPerSecond),
                }}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover opacity-75"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-black/25" />
                <div className="relative flex h-full items-center gap-1.5 px-2 text-[10px] font-medium text-white">
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{clip.name}</span>
                </div>
                {selected ? (
                  <>
                    <button
                      type="button"
                      aria-label="Trim clip start"
                      onPointerDown={(event) =>
                        beginDrag(event, clip, "trim-start")
                      }
                      onPointerMove={updateDragPreview}
                      onPointerUp={commitDrag}
                      className="absolute inset-y-0 left-0 w-6 touch-none cursor-ew-resize bg-transparent"
                    >
                      <span className="absolute left-1 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white shadow-sm" />
                    </button>
                    <button
                      type="button"
                      aria-label="Trim clip end"
                      onPointerDown={(event) =>
                        beginDrag(event, clip, "trim-end")
                      }
                      onPointerMove={updateDragPreview}
                      onPointerUp={commitDrag}
                      className="absolute inset-y-0 right-0 w-6 touch-none cursor-ew-resize bg-transparent"
                    >
                      <span className="absolute right-1 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white shadow-sm" />
                    </button>
                  </>
                ) : null}
              </div>
            );
          })}

          {clips.length > 0 ? (
            <div
              className="pointer-events-none absolute top-0 z-20 h-[88px] w-px bg-brand"
              style={{ left: TIMELINE_GUTTER + playhead * pixelsPerSecond }}
            >
              <span className="absolute -left-1.5 top-0 h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-brand" />
            </div>
          ) : null}
        </div>
      </div>
      {clips.length > 0 ? (
        <p className="pointer-events-none shrink-0 px-3 pb-2 pt-1 text-center text-[9px] leading-3 text-studio-muted/65">
          Pinch to zoom · Swipe empty space to scroll
        </p>
      ) : null}
    </section>
  );
}
