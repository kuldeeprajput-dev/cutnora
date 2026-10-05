"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Minus,
  Music,
  Plus,
  Type,
  Video,
  Scissors,
  Copy,
  Clipboard,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { TimelineClip } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { playbackClock } from "@/modules/editor/features/playback/services/playback-clock";
import { useProjectStore, autosaveService } from "@/modules/projects";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import { useClipboardStore } from "@/modules/editor/store/useClipboardStore";
import { ContextMenu, type ContextMenuItemData } from "@/shared/components/ui/ContextMenu";
import { cn } from "@/shared/utils/cn";
import { getMobileRulerInterval } from "./mobile-timeline-utils";
import { getMobileLayerReorderTarget } from "./mobile-layer-utils";
import { preventClipOverlap, trimClipBounds } from "@/modules/editor/utils/timeline-utils";

const MAX_PIXELS_PER_SECOND = 48;
const MIN_PIXELS_PER_SECOND = 0.05;
const TIMELINE_GUTTER = 14;
const MIN_CLIP_DURATION = 0.1;
const MIN_TIMELINE_ZOOM = 0.5;
const MAX_TIMELINE_ZOOM = 6;
const TIMELINE_ZOOM_STEP = 0.25;
const TRACK_TOP = 36;
const TRACK_HEIGHT = 60;
const CLIP_HEIGHT = 48;
const LONG_PRESS_DELAY = 450;

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
  pointerStartY: number;
  scrollStartX: number;
  moved: boolean;
};

function getTrimPreview(
  clip: TimelineClip,
  mode: "trim-start" | "trim-end",
  delta: number,
) {
  const hasSourceLimit = clip.type === "video" || clip.type === "audio";
  const speed = hasSourceLimit ? clip.speed || 1 : 1;

  if (mode === "trim-start") {
    const minDelta = hasSourceLimit
      ? Math.max(-clip.timelineStart, -clip.sourceStart / speed)
      : -clip.timelineStart;
    const applied = Math.max(
      minDelta,
      Math.min(delta, clip.timelineDuration - MIN_CLIP_DURATION),
    );
    return {
      start: clip.timelineStart + applied,
      duration: clip.timelineDuration - applied,
      sourceStart: Math.max(0, clip.sourceStart + applied * speed),
    };
  }

  const maxDuration = hasSourceLimit && clip.sourceDuration
    ? Math.max(MIN_CLIP_DURATION, (clip.sourceDuration - clip.sourceStart) / speed)
    : Infinity;
  return {
    start: clip.timelineStart,
    duration: Math.max(MIN_CLIP_DURATION, Math.min(maxDuration, clip.timelineDuration + delta)),
    sourceStart: clip.sourceStart,
  };
}

export function MobileTimeline() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const moveClip = useProjectStore((state) => state.moveClip);
  const moveClipToNewTrack = useProjectStore((state) => state.moveClipToNewTrack);
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
  const longPressRef = useRef<{ timer: number; pointerId: number; x: number; y: number } | null>(null);
  const menuPointerRef = useRef<number | null>(null);
  const [clipMenu, setClipMenu] = useState<{ clipId: string; x: number; y: number } | null>(null);
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
    anchorTime: number;
  } | null>(null);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
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
    trackIndex?: number;
    valid?: boolean;
  } | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<Record<string, { url: string; aspectRatio: number }>>(
    {},
  );

  const tracks = useMemo(
    () => [...(currentProject?.tracks ?? [])].sort((a, b) => a.order - b.order),
    [currentProject?.tracks],
  );
  const clips = useMemo(
    () =>
      tracks.flatMap((track) => track.clips).sort(
        (a, b) => a.timelineStart - b.timelineStart,
      ),
    [tracks],
  );
  const mediaBottom = tracks.reduce(
    (bottom, track, index) => track.clips.length > 0
      ? TRACK_TOP + index * TRACK_HEIGHT + CLIP_HEIGHT
      : bottom,
    0,
  );

  const cancelLongPress = () => {
    if (longPressRef.current) window.clearTimeout(longPressRef.current.timer);
    longPressRef.current = null;
  };

  const openClipMenu = (clip: TimelineClip, x: number, y: number) => {
    cancelLongPress();
    dragRef.current = null;
    setPreview(null);
    setActiveInspectorTab("transform");
    setSelectedClipIds([clip.id]);
    setClipMenu({ clipId: clip.id, x, y });
  };

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
    if (longPressRef.current) window.clearTimeout(longPressRef.current.timer);
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
    if (!element || !isPlaying || clips.length === 0 || clipMenu || pinchRef.current || panRef.current?.moved || dragRef.current?.moved) return;

    const playheadX = TIMELINE_GUTTER + playhead * pixelsPerSecond;
    const visibleRight = element.scrollLeft + element.clientWidth - 40;
    if (playheadX > visibleRight) {
      element.scrollTo({ left: Math.max(0, playheadX - 40) });
    } else if (playheadX < element.scrollLeft + 24) {
      element.scrollTo({ left: Math.max(0, playheadX - 24) });
    }
  }, [clips.length, clipMenu, isPlaying, pixelsPerSecond, playhead]);

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
      cancelLongPress();
      menuPointerRef.current = null;
      setClipMenu(null);
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
        startY: event.clientY,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
        moved: false,
      };
    }
  };

  const handleTouchPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const points = touchPointsRef.current;
    if (event.pointerType !== "touch" || !points.has(event.pointerId)) return;
    const press = longPressRef.current;
    if (press?.pointerId === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) >= 6) {
      cancelLongPress();
    }
    if (menuPointerRef.current === event.pointerId) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
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
    const deltaY = event.clientY - pan.startY;
    if (Math.hypot(delta, deltaY) > 6) pan.moved = true;
    if (pan.moved) {
      event.currentTarget.scrollLeft = Math.max(0, pan.scrollLeft - delta);
      event.currentTarget.scrollTop = Math.max(0, pan.scrollTop - deltaY);
    }
  };

  const handleTouchPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (longPressRef.current?.pointerId === event.pointerId) cancelLongPress();
    const points = touchPointsRef.current;
    if (event.pointerType !== "touch" || !points.has(event.pointerId)) return;
    points.delete(event.pointerId);

    if (menuPointerRef.current === event.pointerId) {
      menuPointerRef.current = null;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

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
      const next: Record<string, { url: string; aspectRatio: number }> = {};
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
          const aspectRatio = asset.width && asset.height && asset.width > 0 && asset.height > 0
            ? asset.width / asset.height
            : 16 / 9;
          if (asset.remotePreviewUrl || asset.remoteUrl) {
            next[asset.id] = { url: asset.remotePreviewUrl ?? asset.remoteUrl ?? "", aspectRatio };
            return;
          }
          if (!asset.thumbnailBlobId) return;

          const cachedUrl = objectUrlManager.getUrl(asset.thumbnailBlobId);
          if (cachedUrl) {
            next[asset.id] = { url: cachedUrl, aspectRatio };
            return;
          }

          const record = await db.thumbnails.get(asset.thumbnailBlobId);
          if (!record?.blob) return;
          const thumbnailUrl = objectUrlManager.createUrl(
            asset.thumbnailBlobId,
            record.blob,
          );
          if (!active) return;
          next[asset.id] = { url: thumbnailUrl, aspectRatio };
        }),
      );

      if (active) setThumbnailPreviews(next);
    }

    void loadThumbnails();
    return () => {
      active = false;
    };
  }, [clips]);

  const getMoveTarget = (event: React.PointerEvent, drag: DragState) => {
    const element = scrollRef.current;
    const pointerY = element
      ? event.clientY - element.getBoundingClientRect().top + element.scrollTop
      : TRACK_TOP;
    const trackIndex = Math.max(0, Math.min(tracks.length, Math.floor((pointerY - TRACK_TOP) / TRACK_HEIGHT)));
    const track = tracks[trackIndex];
    const deltaX = event.clientX - drag.pointerStartX + (element?.scrollLeft ?? 0) - drag.scrollStartX;
    const start = Math.max(0, drag.clip.timelineStart + deltaX / pixelsPerSecond);
    return {
      trackIndex,
      valid: !track?.locked,
      start: track
        ? preventClipOverlap(track.clips, drag.clip.id, start, drag.clip.timelineDuration)
        : start,
    };
  };

  const getSafeTrimPreview = (clip: TimelineClip, mode: "trim-start" | "trim-end", delta: number) => {
    const timing = getTrimPreview(clip, mode, delta);
    const track = tracks.find((item) => item.id === clip.trackId);
    if (!track) return timing;
    const trimmed = trimClipBounds(
      [track], clip.id, timing.start, timing.duration, timing.sourceStart,
    )[0].clips.find((item) => item.id === clip.id);
    return trimmed ? {
      start: trimmed.timelineStart,
      duration: trimmed.timelineDuration,
      sourceStart: trimmed.sourceStart,
    } : timing;
  };

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
      const target = getMoveTarget(event, drag);
      if (target.valid) {
        const start = Number(target.start.toFixed(3));
        const targetTrack = tracks[target.trackIndex];
        if (targetTrack) {
          moveClip(clip.id, targetTrack.id, start);
        } else {
          const trackType = clip.type === "image" ? "overlay" : clip.type;
          const trackName = `${clip.type.charAt(0).toUpperCase()}${clip.type.slice(1)} Track`;
          moveClipToNewTrack(clip.id, trackType, start, trackName);
        }
      }
    } else {
      const timing = getSafeTrimPreview(clip, drag.mode, delta);
      trimClip(
        clip.id,
        Number(timing.start.toFixed(3)),
        Number(timing.duration.toFixed(3)),
        Number(timing.sourceStart.toFixed(3)),
      );
    }

    dragRef.current = null;
    setPreview(null);
  };

  const updateDragPreview = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved) {
      const deltaX = event.clientX - drag.pointerStartX;
      const deltaY = drag.mode === "move" ? event.clientY - drag.pointerStartY : 0;
      if (Math.hypot(deltaX, deltaY) < 6) return;
      drag.moved = true;
      setActiveInspectorTab("transform");
      setSelectedClipIds([drag.clip.id]);
    }
    const delta = (event.clientX - drag.pointerStartX) / pixelsPerSecond;
    const clip = drag.clip;
    if (drag.mode === "move") {
      const target = getMoveTarget(event, drag);
      setPreview({
        clipId: clip.id,
        start: target.start,
        duration: clip.timelineDuration,
        sourceStart: clip.sourceStart,
        trackIndex: target.trackIndex,
        valid: target.valid,
      });
      return;
    }
    setPreview({
      clipId: clip.id,
      ...getSafeTrimPreview(clip, drag.mode, delta),
    });
  };

  const beginDrag = (
    event: React.PointerEvent,
    clip: TimelineClip,
    mode: DragState["mode"],
  ) => {
    if (event.pointerType !== "touch" && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    cancelLongPress();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "touch" && mode === "move") {
      const { pointerId, clientX, clientY } = event;
      const timer = window.setTimeout(() => {
        if (pinchRef.current || touchPointsRef.current.size > 1) return;
        menuPointerRef.current = pointerId;
        openClipMenu(clip, clientX, clientY);
      }, LONG_PRESS_DELAY);
      longPressRef.current = { timer, pointerId, x: clientX, y: clientY };
    }
    if (tracks.find((track) => track.id === clip.trackId)?.locked) {
      setSelectedClipIds([clip.id]);
      return;
    }
    // Wait for a touch drag or release so a second finger can start a pinch
    // without selecting, seeking to, or moving the first touched clip.
    if (event.pointerType !== "touch") {
      setActiveInspectorTab("transform");
      setSelectedClipIds([clip.id]);
    }
    dragRef.current = {
      clip,
      mode,
      pointerStartX: event.clientX,
      pointerStartY: event.clientY,
      scrollStartX: scrollRef.current?.scrollLeft ?? 0,
      moved: false,
    };
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

  const menuClip = clipMenu ? clips.find((clip) => clip.id === clipMenu.clipId) : undefined;
  const menuTrack = menuClip ? tracks.find((track) => track.id === menuClip.trackId) : undefined;
  const menuForward = menuTrack ? getMobileLayerReorderTarget(currentProject?.tracks ?? [], menuTrack.id, 1, playhead) : null;
  const menuBackward = menuTrack ? getMobileLayerReorderTarget(currentProject?.tracks ?? [], menuTrack.id, -1, playhead) : null;

  const reorderMenuLayer = (offset: -1 | 1) => {
    if (!menuTrack) return;
    const project = useProjectStore.getState().currentProject;
    if (!project) return;
    const target = getMobileLayerReorderTarget(project.tracks, menuTrack.id, offset, usePlaybackStore.getState().playhead);
    if (target) useProjectStore.getState().reorderTracks(target.fromIndex, target.toIndex);
  };

  const toggleMenuLayerFlag = (flag: "locked" | "hidden") => {
    if (!menuTrack) return;
    const project = useProjectStore.getState().currentProject;
    if (!project?.tracks.some((track) => track.id === menuTrack.id)) return;
    historyManager.pushState(project);
    useProjectStore.setState((state) => {
      const track = state.currentProject?.tracks.find((item) => item.id === menuTrack.id);
      if (track) track[flag] = !track[flag];
    });
    const updated = useProjectStore.getState().currentProject;
    if (updated) autosaveService.scheduleSave(updated);
  };

  const clipMenuItems: ContextMenuItemData[] = menuClip && menuTrack ? [
    {
      id: "cut", label: "Cut", icon: <Scissors className="h-3.5 w-3.5" />,
      onClick: () => useClipboardStore.getState().cutSelectedClips([menuClip.id]),
    },
    {
      id: "copy", label: "Copy", icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => useClipboardStore.getState().copySelectedClips([menuClip.id]),
    },
    ...(useClipboardStore.getState().clipboardClips.length > 0 ? [{
      id: "paste", label: "Paste after", icon: <Clipboard className="h-3.5 w-3.5" />,
      disabled: menuTrack.locked,
      onClick: () => useClipboardStore.getState().pasteClips(menuTrack.id, menuClip.timelineStart + menuClip.timelineDuration),
    }] : []),
    {
      id: "duplicate", label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => useProjectStore.getState().duplicateClips([menuClip.id]),
    },
    { id: "edit-divider", label: "", isDivider: true, onClick: () => {} },
    ...(menuClip.type !== "audio" ? [
      {
        id: "forward", label: "Bring forward", icon: <ArrowUp className="h-3.5 w-3.5" />,
        disabled: !menuForward,
        onClick: () => reorderMenuLayer(1),
      },
      {
        id: "backward", label: "Send backward", icon: <ArrowDown className="h-3.5 w-3.5" />,
        disabled: !menuBackward,
        onClick: () => reorderMenuLayer(-1),
      },
    ] : []),
    {
      id: "lock", label: menuTrack.locked ? "Unlock layer" : "Lock layer",
      icon: menuTrack.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />,
      onClick: () => toggleMenuLayerFlag("locked"),
    },
    {
      id: "hide", label: menuTrack.hidden ? "Show layer" : "Hide layer",
      icon: menuTrack.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />,
      onClick: () => toggleMenuLayerFlag("hidden"),
    },
    { id: "delete-divider", label: "", isDivider: true, onClick: () => {} },
    {
      id: "delete", label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, destructive: true,
      onClick: () => useProjectStore.getState().deleteClips([menuClip.id]),
    },
  ] : [];

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
        onScroll={(event) => {
          event.currentTarget.style.setProperty(
            "--timeline-scroll-top",
            `${event.currentTarget.scrollTop}px`,
          );
        }}
        onPointerDownCapture={handleTouchPointerDown}
        onPointerMoveCapture={handleTouchPointerMove}
        onPointerUpCapture={handleTouchPointerEnd}
        onPointerCancelCapture={handleTouchPointerEnd}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          clips.length > 0
            ? "overflow-x-auto touch-none"
            : "overflow-x-hidden",
        )}
      >
        <div
          className="relative h-full min-h-[96px]"
          style={{
            width: contentWidth > 0 ? `${contentWidth}px` : "100%",
            minHeight: clips.length > 0 ? TRACK_TOP + (tracks.length + 1) * TRACK_HEIGHT : 96,
          }}
          onPointerDown={handleTimelinePointerDown}
        >
          {clips.length > 0 ? (
            <div className="sticky top-0 z-30 h-7 border-b border-studio-border bg-timeline-bg">
              {Array.from(
                {
                  length: Math.floor(duration / rulerInterval) + 1,
                },
                (_, index) => {
                  const second = index * rulerInterval;
                  return (
                    <div
                      key={second}
                      className="pointer-events-none absolute inset-y-0"
                      style={{ left: TIMELINE_GUTTER + second * pixelsPerSecond }}
                    >
                      <div className="h-2 w-px bg-studio-fg/35" />
                      <span className="absolute bottom-0.5 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[9px] leading-none tabular-nums text-studio-muted/80">
                        {formatTime(second)}
                      </span>
                    </div>
                  );
                },
              )}
              <div
                className="pointer-events-none absolute inset-y-0 z-30 w-3 -translate-x-1/2"
                style={{ left: Math.round(TIMELINE_GUTTER + playhead * pixelsPerSecond) }}
              >
                <div
                  className="relative z-10 h-3 w-3 rounded-t-[2px] bg-studio-fg"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 50% 100%, 0 45%)" }}
                />
                <div
                  className="absolute left-1/2 top-2.5 w-0.5 -translate-x-1/2 bg-studio-fg"
                  style={{
                    height: `max(0px, calc(${mediaBottom - 10}px - var(--timeline-scroll-top, 0px)))`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {clips.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs leading-5 text-studio-muted">
              Add media to start editing
            </div>
          ) : null}

          {clips.length > 0 ? (
            <>
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 border-b border-studio-border/40"
                  style={{ top: TRACK_TOP + index * TRACK_HEIGHT - 6, height: TRACK_HEIGHT }}
                />
              ))}
            </>
          ) : null}

          {clips.map((clip) => {
            const Icon = clipIcon(clip);
            const visual = preview?.clipId === clip.id ? preview : null;
            const start = visual?.start ?? clip.timelineStart;
            const clipDuration = visual?.duration ?? clip.timelineDuration;
            const trackIndex = visual?.trackIndex ?? Math.max(0, tracks.findIndex((track) => track.id === clip.trackId));
            const selected = selectedClipIds.includes(clip.id) || preview?.clipId === clip.id;
            const thumb = clip.assetId
              ? thumbnailPreviews[clip.assetId]
              : undefined;
            const frameWidth = Math.max(30, Math.round(46 * (thumb?.aspectRatio ?? 16 / 9)));
            const clipWidth = clipDuration * pixelsPerSecond;
            const trimHandleWidth = Math.min(24, clipWidth / 3);
            const frameCount = Math.max(1, Math.ceil(clipWidth / frameWidth));

            return (
              <div
                key={clip.id}
                data-mobile-clip
                onPointerDown={(event) => beginDrag(event, clip, "move")}
                onPointerMove={updateDragPreview}
                onPointerUp={commitDrag}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (pinchRef.current || dragRef.current?.moved) return;
                  if (touchPointsRef.current.size === 1) {
                    menuPointerRef.current = touchPointsRef.current.keys().next().value ?? null;
                  }
                  openClipMenu(clip, event.clientX, event.clientY);
                }}
                onPointerCancel={() => {
                  cancelLongPress();
                  dragRef.current = null;
                  setPreview(null);
                }}
                onLostPointerCapture={() => cancelLongPress()}
                className={cn(
                  "absolute touch-none overflow-hidden rounded-lg border bg-brand/20",
                  visual?.valid === false
                    ? "border-destructive ring-1 ring-destructive"
                    : selected
                    ? "border-brand ring-1 ring-brand"
                    : "border-brand/50",
                )}
                style={{
                  left: TIMELINE_GUTTER + start * pixelsPerSecond,
                  top: TRACK_TOP + trackIndex * TRACK_HEIGHT,
                  width: clipWidth,
                  borderWidth: Math.min(1, clipWidth / 2),
                  height: CLIP_HEIGHT,
                }}
              >
                {thumb && (clip.type === "image" || clip.type === "overlay") ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex overflow-hidden select-none"
                  >
                    {Array.from({ length: frameCount }).map((_, index) => (
                      <div
                        key={index}
                        className="relative h-full shrink-0 overflow-hidden border-r border-black/50"
                        style={{ width: frameWidth }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb.url}
                          alt=""
                          draggable={false}
                          className="pointer-events-none h-full w-full object-cover select-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : thumb ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: `repeating-linear-gradient(to right, transparent 0 ${frameWidth - 1}px, rgb(0 0 0 / 0.45) ${frameWidth - 1}px ${frameWidth}px), url(${JSON.stringify(thumb.url)})`,
                      backgroundSize: `${frameWidth}px 100%`,
                      backgroundRepeat: "repeat-x",
                    }}
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
                <div className={cn(
                  "pointer-events-none flex items-center gap-1.5 px-2 font-medium text-white drop-shadow-sm",
                  thumb ? "absolute inset-x-0 top-1 text-[9px]" : "relative h-full text-[10px]",
                )}>
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
                      className="absolute inset-y-0 left-0 touch-none cursor-ew-resize bg-transparent"
                      style={{ width: trimHandleWidth }}
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
                      className="absolute inset-y-0 right-0 touch-none cursor-ew-resize bg-transparent"
                      style={{ width: trimHandleWidth }}
                    >
                      <span className="absolute right-1 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white shadow-sm" />
                    </button>
                  </>
                ) : null}
              </div>
            );
          })}

        </div>
      </div>
      {clipMenu && menuClip && menuTrack ? (
        <div className="absolute h-0 w-0">
          <ContextMenu
            x={clipMenu.x}
            y={clipMenu.y}
            items={clipMenuItems}
            onClose={() => setClipMenu(null)}
            className="w-40 min-w-0 max-h-[min(65dvh,320px)] max-w-[calc(100vw-20px)] overflow-y-auto overscroll-contain rounded-lg bg-studio-topbar p-1 shadow-lg backdrop-blur-none animate-none [&_button]:h-8 [&_button]:gap-2 [&_button]:rounded-md [&_button]:px-2 [&_button]:py-0 [&_button]:text-[11px] max-[359px]:w-36"
          />
        </div>
      ) : null}
    </section>
  );
}
