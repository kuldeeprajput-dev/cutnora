"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useProjectStore } from "@/modules/projects";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import type { TimelineClip, TrackType } from "@/modules/editor/types";
import { TimelineToolbar } from "./TimelineToolbar";
import { TimeRuler } from "./TimeRuler";
import { TrackHeader } from "./TrackHeader";
import { TrackLane } from "./TrackLane";
import { TimelineContextMenu } from "./TimelineContextMenu";
import { snapTimelineTime } from "../utils/timeline-snap-utils";
import { preventClipOverlap } from "@/modules/editor/utils/timeline-utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FileVideo,
  Video,
  GripVertical,
  Image as ImageIcon,
  Music,
  Plus,
  Shapes,
  Type,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  DEFAULT_TIMELINE_ZOOM,
  getFitTimelineZoom,
  getMinimumTimelineZoom,
} from "../utils/timeline-zoom-utils";

const NEW_TRACK_DROP_THRESHOLD = 10;

interface ClipDragPreview {
  clipId: string;
  clipName: string;
  clipType: TimelineClip["type"];
  targetStart: number;
  targetTrackId: string | null;
  targetTrackIndex: number;
  targetTrackType: TrackType;
  targetTrackName: string;
  createTrack: boolean;
  valid: boolean;
  duration: number;
}

function getPreferredTrack(clipType: TimelineClip["type"]): {
  type: TrackType;
  name: string;
} {
  switch (clipType) {
    case "video":
      return { type: "video", name: "Video Track" };
    case "audio":
      return { type: "audio", name: "Audio Track" };
    case "text":
      return { type: "text", name: "Text Track" };
    case "image":
      return { type: "overlay", name: "Image Track" };
    case "overlay":
      return { type: "overlay", name: "Overlay Track" };
  }
}

function getDragClipColor(clipType: TimelineClip["type"]) {
  switch (clipType) {
    case "video":
      return "bg-studio-panel border-studio-border text-studio-fg";
    case "image":
      return "bg-studio-panel border-studio-border text-studio-fg";
    case "audio":
      return "bg-emerald-950/40 border-emerald-500/50 text-emerald-300";
    case "text":
      return "bg-studio-panel-raised border-studio-border text-studio-fg";
    case "overlay":
      return "bg-studio-panel-raised border-studio-border text-studio-fg";
  }
}

function renderDragClipIcon(clipType: TimelineClip["type"]) {
  switch (clipType) {
    case "video":
      return <Video className="h-3.5 w-3.5 text-studio-muted shrink-0" />;
    case "image":
      return <ImageIcon className="h-3.5 w-3.5 text-studio-muted shrink-0" />;
    case "audio":
      return <Music className="h-3.5 w-3.5 text-studio-muted shrink-0" />;
    case "text":
      return <Type className="h-3.5 w-3.5 text-studio-muted shrink-0" />;
    case "overlay":
      return <Shapes className="h-3.5 w-3.5 text-studio-muted shrink-0" />;
  }
}

export function TimelineEditor() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    currentProject,
    moveClip,
    moveClipToNewTrack,
    trimClip,
    reorderTracks,
  } = useProjectStore();
  const {
    zoom,
    trackHeight,
    setZoom,
    scrollLeft,
    setScrollLeft,
    snappingEnabled,
    selectedClipIds,
    clearSelection,
    trackHeaderWidth: rawTrackHeaderWidth = 180,
    setTrackHeaderWidth,
    showTrackHeaders = true,
    toggleTrackHeaders,
  } = useEditorUIStore();
  const trackHeaderWidth = Math.max(170, rawTrackHeaderWidth);
  const { playhead, isPlaying } = usePlaybackStore();

  const handleStartResizeTrackHeader = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = Math.max(
      170,
      useEditorUIStore.getState().trackHeaderWidth || 180,
    );

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const rawWidth = startWidth + deltaX;

      // Snap to collapse if dragged below threshold
      if (rawWidth < 135) {
        useEditorUIStore.getState().setShowTrackHeaders?.(false);
        useEditorUIStore.getState().setTrackHeaderWidth?.(170);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        return;
      }

      const newWidth = Math.max(170, Math.min(400, rawWidth));
      useEditorUIStore.getState().setTrackHeaderWidth?.(newWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const [isAltPressed, setIsAltPressed] = useState(false);
  const [timelineViewportWidth, setTimelineViewportWidth] = useState(0);
  const [activeSnapLine, setActiveSnapLine] = useState<number | null>(null);
  const [clipDragPreview, setClipDragPreview] =
    useState<ClipDragPreview | null>(null);
  const [activeTrackDragId, setActiveTrackDragId] = useState<string | null>(
    null,
  );
  const [overTrackDragId, setOverTrackDragId] = useState<string | null>(null);
  const trackDragCursorRef = useRef("");
  const [timelineContextMenu, setTimelineContextMenu] = useState<{
    x: number;
    y: number;
    pasteTime: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const tracks = currentProject?.tracks || [];
  const projectDuration = currentProject?.settings.duration ?? 0;
  const timelineClipCount = tracks.reduce(
    (count, track) => count + track.clips.length,
    0,
  );
  const previousTimelineRef = useRef({
    projectId: currentProject?.id ?? "",
    duration: projectDuration,
    clipCount: timelineClipCount,
  });
  const fitTimelineZoom = getFitTimelineZoom(
    projectDuration,
    timelineViewportWidth,
  );
  const minimumTimelineZoom = getMinimumTimelineZoom(
    projectDuration,
    timelineViewportWidth,
  );
  const dragPreviewEnd = clipDragPreview
    ? clipDragPreview.targetStart + clipDragPreview.duration
    : 0;
  const visibleTimelineDuration = Math.max(projectDuration, dragPreviewEnd);
  const contentWidthPx = visibleTimelineDuration * zoom + 16 + 60;
  const isOverflowing =
    timelineViewportWidth > 0 && contentWidthPx > timelineViewportWidth;
  const totalWidthPx = isOverflowing ? Math.ceil(contentWidthPx) : 0;
  const playheadLeftPx = 16 + playhead * zoom;
  const activeTrackDrag = tracks.find(
    (track) => track.id === activeTrackDragId,
  );
  const activeTrackDragIndex = tracks.findIndex(
    (track) => track.id === activeTrackDragId,
  );
  const overTrackDragIndex = tracks.findIndex(
    (track) => track.id === overTrackDragId,
  );
  const trackDropPosition: "before" | "after" =
    activeTrackDragIndex >= 0 &&
    overTrackDragIndex >= 0 &&
    activeTrackDragIndex < overTrackDragIndex
      ? "after"
      : "before";

  const resetTrackDrag = () => {
    setActiveTrackDragId(null);
    setOverTrackDragId(null);

    document.body.style.cursor = trackDragCursorRef.current;
  };
  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const updateViewportWidth = () => {
      setTimelineViewportWidth(element.clientWidth);
    };
    updateViewportWidth();

    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (timelineViewportWidth <= 0) return;

    const previous = previousTimelineRef.current;
    const projectId = currentProject?.id ?? "";

    if (timelineClipCount === 0) {
      if (zoom !== DEFAULT_TIMELINE_ZOOM) setZoom(DEFAULT_TIMELINE_ZOOM);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
      if (scrollLeft !== 0) setScrollLeft(0);
    } else {
      const openedProject = previous.projectId !== projectId;
      const addedFirstClip = previous.clipCount === 0;
      const durationGrewSignificantly =
        previous.duration > 0 && projectDuration > previous.duration * 2;

      if (openedProject || addedFirstClip || durationGrewSignificantly) {
        setZoom(fitTimelineZoom);
        if (scrollContainerRef.current)
          scrollContainerRef.current.scrollLeft = 0;
        setScrollLeft(0);
      } else if (zoom < minimumTimelineZoom) {
        setZoom(minimumTimelineZoom);
      }
    }

    previousTimelineRef.current = {
      projectId,
      duration: projectDuration,
      clipCount: timelineClipCount,
    };
  }, [
    currentProject?.id,
    fitTimelineZoom,
    minimumTimelineZoom,
    projectDuration,
    scrollLeft,
    setScrollLeft,
    setZoom,
    timelineClipCount,
    timelineViewportWidth,
    zoom,
  ]);

  const handleTrackDragStart = (event: DragStartEvent) => {
    const trackId = String(event.active.id);
    trackDragCursorRef.current = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    setActiveTrackDragId(trackId);
    setOverTrackDragId(trackId);
  };

  const handleTrackDragOver = (event: DragOverEvent) => {
    setOverTrackDragId(event.over ? String(event.over.id) : null);
  };

  // Track reorder end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) reorderTracks(oldIndex, newIndex);
    }
    resetTrackDrag();
  };

  // Alt key tracking for disabling snapping during drag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const trackHeadersContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoredScrollLeft = useEditorUIStore.getState().scrollLeft;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = restoredScrollLeft;
    }
    if (rulerContainerRef.current) {
      rulerContainerRef.current.scrollLeft = restoredScrollLeft;
    }
  }, [currentProject?.id]);

  // Sync scroll positions across TimeRuler (horizontal) and Track Headers (vertical)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollLeft = target.scrollLeft;
    const newScrollTop = target.scrollTop;

    setScrollLeft(newScrollLeft);

    if (rulerContainerRef.current) {
      rulerContainerRef.current.scrollLeft = newScrollLeft;
    }
    if (trackHeadersContainerRef.current) {
      trackHeadersContainerRef.current.scrollTop = newScrollTop;
    }
  };

  const handleHeadersWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Auto-scroll playhead into view during playback
  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const playheadPx = playhead * zoom;
      if (
        playheadPx > el.scrollLeft + el.clientWidth - 100 ||
        playheadPx < el.scrollLeft
      ) {
        el.scrollLeft = Math.max(0, playheadPx - 100);
      }
    }
  }, [playhead, isPlaying, zoom]);

  // Pointer drag & trim handler
  const handleStartDragClip = (
    clip: TimelineClip,
    mode: "move" | "trim-start" | "trim-end",
    e: React.PointerEvent,
  ) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initialScrollLeft = scrollContainerRef.current?.scrollLeft ?? 0;
    const initialStart = clip.timelineStart;
    const initialDuration = clip.timelineDuration;
    const initialSourceStart = clip.sourceStart;
    const isSnapping = snappingEnabled && !isAltPressed;
    const preferredTrack = getPreferredTrack(clip.type);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    let latestMovePreview: ClipDragPreview | null = null;

    if (mode === "move") {
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }

    const handlePointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();

      const scroller = scrollContainerRef.current;
      const scrollerRect = scroller?.getBoundingClientRect();
      if (mode === "move" && scroller && scrollerRect) {
        const edge = 36;
        if (moveEv.clientY > scrollerRect.bottom - edge)
          scroller.scrollTop += 8;
        if (moveEv.clientY < scrollerRect.top + edge) scroller.scrollTop -= 8;
        if (moveEv.clientX > scrollerRect.right - edge)
          scroller.scrollLeft += 12;
        if (moveEv.clientX < scrollerRect.left + edge)
          scroller.scrollLeft -= 12;
      }

      const scrollDeltaX =
        (scroller?.scrollLeft ?? initialScrollLeft) - initialScrollLeft;
      const deltaX =
        moveEv.clientX - startX + (mode === "move" ? scrollDeltaX : 0);
      const deltaY = moveEv.clientY - startY;
      const deltaSecs = deltaX / zoom;

      if (mode === "move") {
        const rawStart = Math.max(0, initialStart + deltaSecs);
        const snapRes = snapTimelineTime(
          rawStart,
          tracks,
          playhead,
          clip.id,
          zoom,
          isSnapping,
        );
        const targetStart = snapRes.snappedTime;
        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);

        const rect = scroller?.getBoundingClientRect();
        const currentTrackIndex = tracks.findIndex(
          (track) => track.id === clip.trackId,
        );
        const pointerY =
          rect && scroller
            ? moveEv.clientY - rect.top + scroller.scrollTop
            : (currentTrackIndex + 0.5) * trackHeight + deltaY;
        const isClearlyBelowLastTrack =
          pointerY >= tracks.length * trackHeight + NEW_TRACK_DROP_THRESHOLD;
        const pointerTrackIndex = Math.floor(pointerY / trackHeight);
        const createTrack = isClearlyBelowLastTrack;
        const requestedTrackIndex = createTrack
          ? tracks.length
          : Math.max(0, Math.min(tracks.length - 1, pointerTrackIndex));
        const targetTrackIndex = createTrack
          ? tracks.length
          : requestedTrackIndex;
        const targetTrack = createTrack ? null : tracks[targetTrackIndex];
        const valid =
          createTrack || Boolean(targetTrack && !targetTrack.locked);
        const safeStart = targetTrack
          ? preventClipOverlap(
              targetTrack.clips,
              clip.id,
              targetStart,
              clip.timelineDuration,
            )
          : targetStart;

        latestMovePreview = {
          clipId: clip.id,
          clipName: clip.name,
          clipType: clip.type,
          targetStart: safeStart,
          targetTrackId: targetTrack?.id ?? null,
          targetTrackIndex,
          targetTrackType: preferredTrack.type,
          targetTrackName: preferredTrack.name,
          createTrack,
          valid,
          duration: clip.timelineDuration,
        };
        setClipDragPreview(latestMovePreview);
      } else if (mode === "trim-start") {
        const rawStart = Math.max(0, initialStart + deltaSecs);
        const snapRes = snapTimelineTime(
          rawStart,
          tracks,
          playhead,
          clip.id,
          zoom,
          isSnapping,
        );

        // Cannot trim left past the start of the source video (sourceStart >= 0)
        const minTimelineStart =
          clip.type === "video" || clip.type === "audio"
            ? initialStart - initialSourceStart
            : 0;

        let newStart = Math.max(minTimelineStart, snapRes.snappedTime);
        newStart = Math.min(initialStart + initialDuration - 0.1, newStart);

        const newDuration = Math.max(
          0.1,
          initialDuration + (initialStart - newStart),
        );
        const newSourceStart = Math.max(
          0,
          initialSourceStart + (newStart - initialStart),
        );

        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);
        trimClip(clip.id, newStart, newDuration, newSourceStart);
      } else if (mode === "trim-end") {
        const rawDuration = Math.max(0.1, initialDuration + deltaSecs);
        const rawEnd = initialStart + rawDuration;
        const snapRes = snapTimelineTime(
          rawEnd,
          tracks,
          playhead,
          clip.id,
          zoom,
          isSnapping,
        );
        const newEnd = snapRes.snappedTime;
        let newDuration = Math.max(0.1, newEnd - initialStart);

        // Clamp duration so clip duration does not exceed remaining source video/audio file length
        if (
          (clip.type === "video" || clip.type === "audio") &&
          clip.sourceDuration
        ) {
          const maxAvailable = Math.max(
            0.1,
            (clip.sourceDuration - initialSourceStart) / (clip.speed || 1),
          );
          newDuration = Math.min(maxAvailable, newDuration);
        }

        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);
        trimClip(clip.id, initialStart, newDuration, initialSourceStart);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (mode === "move" && latestMovePreview?.valid) {
        if (latestMovePreview.createTrack) {
          moveClipToNewTrack(
            clip.id,
            latestMovePreview.targetTrackType,
            latestMovePreview.targetStart,
            latestMovePreview.targetTrackName,
          );
        } else if (
          latestMovePreview.targetTrackId &&
          (latestMovePreview.targetTrackId !== clip.trackId ||
            Math.abs(latestMovePreview.targetStart - clip.timelineStart) >
              0.001)
        ) {
          moveClip(
            clip.id,
            latestMovePreview.targetTrackId,
            latestMovePreview.targetStart,
          );
        }
      }

      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      setClipDragPreview(null);
      setActiveSnapLine(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  // Compute dynamic scrubber line height: only extend down to the lowest track that has intersecting media
  let maxIntersectingTrackIndex = -1;
  tracks.forEach((track, index) => {
    const isIntersecting = track.clips.some((clip) => {
      // clip.timelineDuration might be a bit loose due to floating point, so add a tiny epsilon
      return (
        playhead >= clip.timelineStart &&
        playhead < clip.timelineStart + clip.timelineDuration + 0.01
      );
    });
    if (isIntersecting) {
      maxIntersectingTrackIndex = index;
    }
  });

  const playheadLineHeight =
    maxIntersectingTrackIndex >= 0
      ? (maxIntersectingTrackIndex + 1) * trackHeight
      : 0;

  return (
    <div className="flex h-full w-full flex-col bg-transparent text-studio-fg select-none overflow-hidden">
      {/* Top Timeline Toolbar */}
      <TimelineToolbar
        fitTimelineZoom={fitTimelineZoom}
        minimumTimelineZoom={minimumTimelineZoom}
      />

      {/* Fixed Time Ruler Header Row */}
      <div className="flex h-6 w-full shrink-0 border-b border-studio-border bg-transparent z-20">
        {/* Left header corner over track headers */}
        <div
          style={{ width: `${trackHeaderWidth}px` }}
          className={cn(
            "flex shrink-0 items-center justify-between border-r border-studio-border bg-transparent px-3",
            !showTrackHeaders && "hidden",
          )}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-studio-muted">
            Tracks
          </span>
          <span className="rounded bg-studio-panel-raised px-1.5 py-0.5 font-mono text-[8px] text-studio-muted">
            {tracks.length}
          </span>
        </div>

        {/* Resizer separator line */}
        <div
          className={cn(
            "w-px bg-studio-border shrink-0",
            !showTrackHeaders && "hidden",
          )}
        />

        {/* Time Ruler Horizontal Scroll Area */}
        <div
          ref={rulerContainerRef}
          className="flex-1 overflow-hidden relative"
        >
          <TimeRuler
            duration={visibleTimelineDuration}
            zoom={zoom}
            scrollLeft={scrollLeft}
          />
        </div>
      </div>

      {/* Main Multi-track Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Left Column: Track Headers (Vertical scroll synced with main container) */}
        <div
          ref={trackHeadersContainerRef}
          onWheel={handleHeadersWheel}
          onPointerDown={(e) => {
            if (e.button === 0 && e.target === trackHeadersContainerRef.current) {
              clearSelection();
            }
          }}
          style={{ width: `${trackHeaderWidth}px` }}
          className={cn(
            "shrink-0 bg-transparent border-r border-studio-border z-10 flex flex-col overflow-hidden",
            !showTrackHeaders && "hidden",
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleTrackDragStart}
            onDragOver={handleTrackDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={resetTrackDrag}
          >
            <SortableContext
              items={tracks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tracks.map((track) => {
                const reorderState =
                  activeTrackDragId === track.id
                    ? "active"
                    : overTrackDragId === track.id &&
                        overTrackDragId !== activeTrackDragId
                      ? "over"
                      : null;

                return (
                  <TrackHeader
                    key={track.id}
                    track={track}
                    trackHeight={trackHeight}
                    reorderState={reorderState}
                    reorderDropPosition={trackDropPosition}
                  />
                );
              })}
            </SortableContext>
            {typeof document !== "undefined" &&
              createPortal(
                <DragOverlay
                  zIndex={1000}
                  dropAnimation={{
                    duration: 180,
                    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  {activeTrackDrag && (
                    <div
                      style={{
                        width: `${Math.max(176, trackHeaderWidth - 8)}px`,
                        height: trackHeight,
                      }}
                      className="pointer-events-none flex items-center gap-2 rounded-lg border border-studio-border-strong bg-studio-panel-raised/95 px-2 text-studio-fg shadow-2xl ring-1 ring-studio-border backdrop-blur-md"
                    >
                      <span className="flex h-6 w-4 shrink-0 items-center justify-center text-studio-muted">
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <span className="shrink-0">
                        {renderDragClipIcon(activeTrackDrag.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-studio-fg">
                          {activeTrackDrag.name}
                        </div>
                        <div className="text-[9px] text-studio-muted">
                          {activeTrackDrag.clips.length}{" "}
                          {activeTrackDrag.clips.length === 1
                            ? "clip"
                            : "clips"}
                        </div>
                      </div>
                      <span className="shrink-0 rounded bg-studio-hover px-1.5 py-0.5 text-[9px] font-medium text-studio-fg">
                        Moving
                      </span>
                    </div>
                  )}
                </DragOverlay>,
                document.body,
              )}
          </DndContext>
          {clipDragPreview?.createTrack && (
            <div
              style={{ height: trackHeight }}
              className="flex shrink-0 items-center gap-2 border-y border-dashed border-studio-border-strong bg-studio-hover/50 px-3 text-studio-fg"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-studio-hover text-studio-fg">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold">
                  Create {clipDragPreview.targetTrackName}
                </div>
                <div className="truncate text-[9px] text-studio-muted">
                  Release to add this track
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resizer Handle for Track Headers Width */}
        <div
          onPointerDown={handleStartResizeTrackHeader}
          className={cn(
            "w-px bg-studio-border hover:bg-studio-fg/40 active:bg-studio-fg/60 hover:w-[3px] z-30 cursor-col-resize transition-all shrink-0 h-full",
            !showTrackHeaders && "hidden",
          )}
          title="Drag to resize track headers"
        />

        {/* Right Area: Track Canvas Lanes */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement | null;
            if (
              target &&
              (target.id?.startsWith("timeline-clip-") ||
                target.closest('[id^="timeline-clip-"]'))
            ) {
              return;
            }
            if (e.button === 0) {
              clearSelection();
            }
          }}
          onContextMenu={(e) => {
            // Right-click on empty timeline area
            const target = e.target as HTMLElement | null;
            if (
              target &&
              (target.id.startsWith("timeline-clip-") ||
                target.closest('[id^="timeline-clip-"]'))
            ) {
              return; // Clip right-click handled inside TimelineClipItem
            }
            e.preventDefault();
            const rect = scrollContainerRef.current?.getBoundingClientRect();
            const clickX = rect
              ? e.clientX -
                rect.left +
                (scrollContainerRef.current?.scrollLeft || 0) -
                16
              : 0;
            const pasteTime = Math.max(0, clickX / zoom);
            setTimelineContextMenu({ x: e.clientX, y: e.clientY, pasteTime });
          }}
          className="flex-1 overflow-auto relative h-full timeline-bottom-scrollbar"
        >
          {/* Track Lanes */}
          {tracks.length === 0 ? (
            <div className="flex min-h-[160px] flex-1 items-center justify-center px-5 text-center">
              <p className="text-[11px] text-studio-muted">
                Import media or use{" "}
                <span className="font-medium text-studio-fg">Add Track</span>{" "}
                above to begin editing.
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col relative w-full h-fit"
              style={
                totalWidthPx > 0
                  ? { minWidth: `${totalWidthPx}px` }
                  : undefined
              }
            >
              {tracks.map((track) => {
                const isDropTarget = Boolean(
                  clipDragPreview &&
                  !clipDragPreview.createTrack &&
                  clipDragPreview.targetTrackId === track.id,
                );

                return (
                  <TrackLane
                    key={track.id}
                    track={track}
                    trackHeight={trackHeight}
                    zoom={zoom}
                    totalWidthPx={totalWidthPx}
                    draggingClipId={clipDragPreview?.clipId}
                    reorderState={
                      activeTrackDragId === track.id
                        ? "active"
                        : overTrackDragId === track.id &&
                            overTrackDragId !== activeTrackDragId
                          ? "over"
                          : null
                    }
                    reorderDropPosition={trackDropPosition}
                    dropState={
                      isDropTarget
                        ? clipDragPreview?.valid
                          ? "valid"
                          : "invalid"
                        : null
                    }
                    onStartDragClip={handleStartDragClip}
                  />
                );
              })}

              {clipDragPreview?.createTrack && (
                <div
                  style={{
                    height: trackHeight,
                    minWidth: totalWidthPx > 0 ? totalWidthPx : undefined,
                  }}
                  aria-hidden="true"
                  className="relative w-full border-y border-dashed border-studio-border-strong bg-studio-hover/50 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]"
                />
              )}

              {clipDragPreview && (
                <div
                  style={{
                    left: `${16 + clipDragPreview.targetStart * zoom}px`,
                    top: `${clipDragPreview.targetTrackIndex * trackHeight + 4}px`,
                    width: `${Math.max(12, clipDragPreview.duration * zoom)}px`,
                    height: trackHeight - 8,
                  }}
                  className={cn(
                    "pointer-events-none absolute z-50 flex items-center justify-between overflow-hidden rounded-lg border-2 border-dashed px-2 shadow-xl backdrop-blur-sm",
                    clipDragPreview.valid
                      ? getDragClipColor(clipDragPreview.clipType)
                      : "border-destructive bg-destructive/20 text-destructive",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    {renderDragClipIcon(clipDragPreview.clipType)}
                    <span className="truncate text-[11px] font-semibold text-studio-fg">
                      {clipDragPreview.clipName}
                    </span>
                  </div>
                  <span className="ml-2 shrink-0 rounded bg-studio-hover px-1.5 py-0.5 text-[9px] font-medium text-studio-fg">
                    {clipDragPreview.createTrack
                      ? "New track"
                      : clipDragPreview.valid
                        ? "Move"
                        : "Not allowed"}
                  </span>
                </div>
              )}

              {/* Studio Scrubber Line */}
              <div
                style={{
                  left: `${playheadLeftPx}px`,
                  height:
                    playheadLineHeight > 0 ? `${playheadLineHeight}px` : 0,
                }}
                className={`absolute top-0 w-0.5 bg-studio-fg z-30 pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:shadow-[0_0_8px_rgba(255,255,255,0.8)] -translate-x-1/2 ${
                  playheadLineHeight === 0 ? "hidden" : ""
                }`}
              />

              {/* Active Snapping Guideline */}
              {activeSnapLine !== null && (
                <div
                  style={{ left: `${16 + activeSnapLine * zoom}px` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-studio-fg z-40 pointer-events-none shadow-[0_0_6px_rgba(0,0,0,0.3)] dark:shadow-[0_0_6px_rgba(255,255,255,0.8)] -translate-x-1/2"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {timelineContextMenu && (
        <TimelineContextMenu
          x={timelineContextMenu.x}
          y={timelineContextMenu.y}
          pasteTime={timelineContextMenu.pasteTime}
          onClose={() => setTimelineContextMenu(null)}
        />
      )}
    </div>
  );
}
