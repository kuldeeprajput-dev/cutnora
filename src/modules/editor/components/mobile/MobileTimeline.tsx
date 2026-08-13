"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Minus,
  Music,
  Plus,
  RotateCcw,
  Type,
  Video,
} from "lucide-react";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { TimelineClip } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";
import { cn } from "@/shared/utils/cn";

const MAX_PIXELS_PER_SECOND = 48;
const MIN_PIXELS_PER_SECOND = 0.05;
const TIMELINE_GUTTER = 24;
const MIN_CLIP_DURATION = 0.1;
const MIN_TIMELINE_ZOOM = 0.75;
const MAX_TIMELINE_ZOOM = 3;
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
  const setPlayhead = usePlaybackStore((state) => state.setPlayhead);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
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

  const duration = Math.max(
    currentProject?.settings.duration ?? 0,
    ...clips.map((clip) => clip.timelineStart + clip.timelineDuration),
    8,
  );
  const basePixelsPerSecond = Math.min(
    MAX_PIXELS_PER_SECOND,
    Math.max(
      MIN_PIXELS_PER_SECOND,
      (Math.max(viewportWidth, 320) - TIMELINE_GUTTER * 2) / duration,
    ),
  );
  const pixelsPerSecond = basePixelsPerSecond * timelineZoom;
  const contentWidth = Math.max(
    viewportWidth,
    Math.ceil(duration * pixelsPerSecond) + TIMELINE_GUTTER * 2,
  );

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
    if (!element || !isPlaying || clips.length === 0) return;

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

    setTimelineZoom(clamped);
    window.requestAnimationFrame(() => {
      if (!element) return;
      const nextPixelsPerSecond = basePixelsPerSecond * clamped;
      element.scrollLeft = Math.max(
        0,
        TIMELINE_GUTTER +
          centerTime * nextPixelsPerSecond -
          element.clientWidth / 2,
      );
    });
  };

  useEffect(() => {
    let active = true;
    const ownedIds: string[] = [];

    async function loadThumbnails() {
      const next: Record<string, string> = {};
      for (const clip of clips) {
        if (!clip.assetId || next[clip.assetId]) continue;
        const asset = await db.assets.get(clip.assetId);
        if (!asset) continue;
        if (asset.remotePreviewUrl || asset.remoteUrl) {
          next[clip.assetId] = asset.remotePreviewUrl ?? asset.remoteUrl ?? "";
          continue;
        }
        if (!asset.thumbnailBlobId) continue;
        const record = await db.thumbnails.get(asset.thumbnailBlobId);
        if (!record?.blob) continue;
        next[clip.assetId] = objectUrlManager.createUrl(
          asset.thumbnailBlobId,
          record.blob,
        );
        ownedIds.push(asset.thumbnailBlobId);
      }
      if (active) setThumbnailUrls(next);
    }

    void loadThumbnails();
    return () => {
      active = false;
      ownedIds.forEach((id) => objectUrlManager.revokeUrl(id));
    };
  }, [clips]);

  const commitDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = (event.clientX - drag.pointerStartX) / pixelsPerSecond;
    const clip = drag.clip;

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
    setActiveInspectorTab("transform");
    setSelectedClipIds([clip.id]);
    dragRef.current = { clip, mode, pointerStartX: event.clientX };
    setPreview({
      clipId: clip.id,
      start: clip.timelineStart,
      duration: clip.timelineDuration,
      sourceStart: clip.sourceStart,
    });
  };

  const handleTimelinePointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("[data-mobile-clip]")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
    const x = event.clientX - bounds.left + scrollLeft - TIMELINE_GUTTER;
    setPlayhead(Math.max(0, x / pixelsPerSecond));
    setSelectedClipIds([]);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-studio-border bg-timeline-bg">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-studio-border px-3">
        <div className="min-w-0">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-studio-muted">
            Timeline
          </h2>
          <p className="truncate text-[9px] text-studio-muted/70">
            {clips.length} {clips.length === 1 ? "clip" : "clips"} in one ribbon
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5" aria-label="Timeline zoom controls">
          <button
            type="button"
            onClick={() => changeTimelineZoom(1)}
            disabled={clips.length === 0 || timelineZoom === 1}
            aria-label="Reset timeline zoom"
            className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg disabled:opacity-30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => changeTimelineZoom(timelineZoom - TIMELINE_ZOOM_STEP)}
            disabled={clips.length === 0 || timelineZoom <= MIN_TIMELINE_ZOOM}
            aria-label="Zoom timeline out"
            className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
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
            className="h-8 w-12 cursor-pointer accent-brand disabled:opacity-30"
          />
          <button
            type="button"
            onClick={() => changeTimelineZoom(timelineZoom + TIMELINE_ZOOM_STEP)}
            disabled={clips.length === 0 || timelineZoom >= MAX_TIMELINE_ZOOM}
            aria-label="Zoom timeline in"
            className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          clips.length > 0
            ? "overflow-x-auto touch-pan-x"
            : "overflow-x-hidden",
        )}
      >
        <div
          className="relative h-full min-h-[108px]"
          style={{ width: clips.length > 0 ? `${contentWidth}px` : "100%" }}
          onPointerDown={handleTimelinePointerDown}
        >
          <div className="absolute inset-x-0 top-0 h-7 border-b border-studio-border bg-studio-panel/40">
            {Array.from(
              { length: clips.length === 0 ? 1 : Math.ceil(duration / 2) + 1 },
              (_, index) => {
                const second = index * 2;
                return (
                  <div
                    key={second}
                    className="absolute inset-y-0 border-l border-studio-border"
                    style={{ left: TIMELINE_GUTTER + second * pixelsPerSecond }}
                  >
                    <span className="mt-1 block -translate-x-1/2 font-mono text-[8px] text-studio-muted/70 text-center">
                      {formatTime(second)}
                    </span>
                  </div>
                );
              },
            )}
          </div>

          {clips.length === 0 ? (
            <div className="absolute inset-x-4 top-10 flex h-20 items-center justify-center rounded-xl border border-dashed border-studio-border px-5 text-center text-[11px] font-medium text-studio-muted">
              Add media to start editing
            </div>
          ) : null}

          {clips.map((clip) => {
            const Icon = clipIcon(clip);
            const visual = preview?.clipId === clip.id ? preview : null;
            const start = visual?.start ?? clip.timelineStart;
            const clipDuration = visual?.duration ?? clip.timelineDuration;
            const selected = selectedClipIds.includes(clip.id);
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
                  "absolute top-10 h-12 touch-none overflow-hidden rounded-lg border bg-brand/20 shadow-sm",
                  selected
                    ? "border-brand ring-2 ring-brand/35"
                    : "border-brand/50",
                )}
                style={{
                  left: TIMELINE_GUTTER + start * pixelsPerSecond,
                  width: Math.max(42, clipDuration * pixelsPerSecond),
                }}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/20" />
                <div className="relative flex h-full items-center gap-1.5 px-3 text-[10px] font-semibold text-white">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
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
                      className="absolute inset-y-0 left-0 w-3 cursor-ew-resize border-r-2 border-white/80 bg-brand"
                    />
                    <button
                      type="button"
                      aria-label="Trim clip end"
                      onPointerDown={(event) =>
                        beginDrag(event, clip, "trim-end")
                      }
                      onPointerMove={updateDragPreview}
                      onPointerUp={commitDrag}
                      className="absolute inset-y-0 right-0 w-3 cursor-ew-resize border-l-2 border-white/80 bg-brand"
                    />
                  </>
                ) : null}
              </div>
            );
          })}

          <div
            className={cn(
              "pointer-events-none absolute top-0 z-20 w-px bg-brand",
              clips.length > 0 ? "h-[92px]" : "h-8",
            )}
            style={{ left: TIMELINE_GUTTER + playhead * pixelsPerSecond }}
          >
            <span className="absolute -left-1.5 top-0 h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-brand" />
          </div>
        </div>
      </div>
    </section>
  );
}
