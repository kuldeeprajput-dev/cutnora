'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { autosaveService, useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { historyManager } from '@/modules/editor/store/useHistoryStore';
import { CanvasRenderer } from './CanvasRenderer';
import { calculateFitScale, type Point } from '../utils/stage-math';
import type { TimelineClip } from '@/modules/editor/types';
import { clampTextScale, defaultTextStyle, scaleTextStyle } from '@/modules/editor/features/text/utils/text-layout';
import { FullscreenPlaybackControls } from './FullscreenPlaybackControls';

const MOBILE_CANVAS_QUERY = '(max-width: 1023px)';
const MOBILE_PINCH_START_EVENT = 'cutnora:mobile-pinch-start';

function getPointerDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getPointerMidpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentProject = useProjectStore((state) => state.currentProject);
  const clearSelection = useEditorUIStore((state) => state.clearSelection);
  const activeTool = useEditorUIStore((state) => state.activeTool);
  const zoomMode = useEditorUIStore((state) => state.zoomMode);
  const setZoomMode = useEditorUIStore((state) => state.setZoomMode);
  const setStageScale = useEditorUIStore((state) => state.setStageScale);
  const resetViewCount = useEditorUIStore((state) => state.resetViewCount);
  const isFullscreen = useEditorUIStore((state) => state.isFullscreen);
  const setIsFullscreen = useEditorUIStore((state) => state.setIsFullscreen);

  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [mobileViewportHeight, setMobileViewportHeight] = useState<number | null>(null);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const pendingPanRef = useRef<Point | null>(null);
  const panFrameRef = useRef<number | null>(null);
  const touchPointersRef = useRef(new Map<number, Point>());
  const pinchFrameRef = useRef<number | null>(null);
  const pendingPinchRef = useRef<{
    clipId: string;
    transform: TimelineClip['transform'];
    textStyle?: TimelineClip['textStyle'];
  } | null>(null);
  const suppressStageClickRef = useRef(false);
  const pinchGestureRef = useRef({
    active: false,
    clipId: '',
    startDistance: 1,
    startMidpoint: { x: 0, y: 0 },
    startTransform: null as TimelineClip['transform'] | null,
    startTextStyle: undefined as TimelineClip['textStyle'],
    historyCaptured: false,
  });

  const projectSettings = currentProject?.settings || {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    fps: 30,
    duration: 10,
    backgroundColor: '#000000',
  };

  // Sync native browser fullscreen events specifically for the video stage
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isStage = document.fullscreenElement?.id === 'stage-fullscreen-container';
      setIsNativeFullscreen(isStage);
      if (!isStage && !document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  // ResizeObserver to update containerSize dynamically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current);
      }
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!(isFullscreen || isNativeFullscreen) || !window.matchMedia(MOBILE_CANVAS_QUERY).matches) {
      setMobileViewportHeight(null);
      return;
    }

    const updateViewportHeight = () => {
      setMobileViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };

    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.visualViewport?.addEventListener("scroll", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [isFullscreen, isNativeFullscreen]);

  // Listen for Space key for pan tool shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.getElementById('stage-fullscreen-container')?.dataset.fullscreen === 'true') return;
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Video player screen only shows when stage is fullscreen, never during layout fullscreen
  const isLayoutFullscreen = Boolean(
    document.fullscreenElement &&
      document.fullscreenElement.id !== 'stage-fullscreen-container',
  );
  const isFullscreenActive =
    isNativeFullscreen || (isFullscreen && !isLayoutFullscreen);

  // Keep only a small safety gutter so the canvas uses nearly all stage height.
  const fitScale = calculateFitScale(
    {
      width: Math.max(100, isFullscreenActive ? window.innerWidth : containerSize.width - 12),
      height: Math.max(
        100,
        isFullscreenActive
          ? (mobileViewportHeight ?? window.innerHeight)
          : containerSize.height - 12,
      ),
    },
    { width: projectSettings.width, height: projectSettings.height }
  );

  const stageScale = zoomMode === 'fit' || isFullscreenActive ? fitScale : zoomMode / 100;

  useEffect(() => {
    setStageScale(stageScale);
  }, [stageScale, setStageScale]);

  useEffect(() => {
    if (resetViewCount > 0) {
      setZoomMode('fit');
      setPan({ x: 0, y: 0 });
    }
  }, [resetViewCount, setZoomMode]);

  const stageDisplayWidth = projectSettings.width * stageScale;
  const stageDisplayHeight = projectSettings.height * stageScale;

  const handleStageContainerClick = (e: React.MouseEvent) => {
    if (isFullscreenActive) {
      document.getElementById('stage-fullscreen-container')?.focus({ preventScroll: true });
      usePlaybackStore.getState().togglePlay();
      return;
    }
    if (suppressStageClickRef.current) {
      suppressStageClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'stage-backdrop') {
      clearSelection();
    }
  };

  const flushPinchUpdate = () => {
    pinchFrameRef.current = null;
    const pending = pendingPinchRef.current;
    if (!pending) return;
    pendingPinchRef.current = null;

    if (!pinchGestureRef.current.historyCaptured) {
      const project = useProjectStore.getState().currentProject;
      if (project) {
        historyManager.pushState(project);
        pinchGestureRef.current.historyCaptured = true;
      }
    }

    useProjectStore.setState((state) => {
      if (!state.currentProject) return;
      for (const track of state.currentProject.tracks) {
        const clip = track.clips.find((item) => item.id === pending.clipId);
        if (!clip) continue;
        clip.transform = pending.transform;
        if (pending.textStyle) clip.textStyle = pending.textStyle;
        break;
      }
    });
  };

  const handlePointerDownCapture = (e: React.PointerEvent) => {
    if (isFullscreenActive) return;
    if (e.pointerType !== 'touch' || !window.matchMedia(MOBILE_CANVAS_QUERY).matches) return;

    touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touchPointersRef.current.size !== 2) return;

    const selectedClipId = useEditorUIStore.getState().selectedClipIds[0];
    const project = useProjectStore.getState().currentProject;
    const selectedClip = project?.tracks
      .flatMap((track) => track.clips)
      .find((clip) => clip.id === selectedClipId && clip.type !== 'audio');
    if (!selectedClip) return;

    const [first, second] = Array.from(touchPointersRef.current.values());
    const startMidpoint = getPointerMidpoint(first, second);

    pinchGestureRef.current = {
      active: true,
      clipId: selectedClip.id,
      startDistance: Math.max(1, getPointerDistance(first, second)),
      startMidpoint,
      startTransform: { ...selectedClip.transform },
      startTextStyle: selectedClip.type === 'text'
        ? { ...defaultTextStyle, text: selectedClip.name || 'Sample Text', ...selectedClip.textStyle }
        : undefined,
      historyCaptured: false,
    };
    suppressStageClickRef.current = true;
    pendingPanRef.current = null;
    if (panFrameRef.current !== null) {
      window.cancelAnimationFrame(panFrameRef.current);
      panFrameRef.current = null;
    }
    setIsPanning(false);
    window.dispatchEvent(new Event(MOBILE_PINCH_START_EVENT));
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerMoveCapture = (e: React.PointerEvent) => {
    if (isFullscreenActive) return;
    if (e.pointerType !== 'touch' || !touchPointersRef.current.has(e.pointerId)) return;

    touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const gesture = pinchGestureRef.current;
    if (!gesture.active || !gesture.startTransform || touchPointersRef.current.size < 2) return;

    const [first, second] = Array.from(touchPointersRef.current.values());
    const distanceRatio = getPointerDistance(first, second) / gesture.startDistance;
    let mediaScale = Math.min(8, Math.max(0.1, distanceRatio));
    const midpoint = getPointerMidpoint(first, second);
    const startTransform = gesture.startTransform;
    if (gesture.startTextStyle)
      mediaScale = clampTextScale(gesture.startTextStyle, startTransform.width, startTransform.height, mediaScale);
    const nextWidth = Math.max(20, startTransform.width * mediaScale);
    const nextHeight = Math.max(20, startTransform.height * mediaScale);
    const centerX =
      startTransform.x +
      startTransform.width / 2 +
      (midpoint.x - gesture.startMidpoint.x) / (stageScale || 1);
    const centerY =
      startTransform.y +
      startTransform.height / 2 +
      (midpoint.y - gesture.startMidpoint.y) / (stageScale || 1);

    pendingPinchRef.current = {
      clipId: gesture.clipId,
      ...(gesture.startTextStyle ? { textStyle: scaleTextStyle(gesture.startTextStyle, mediaScale) } : {}),
      transform: {
        ...startTransform,
        x: centerX - nextWidth / 2,
        y: centerY - nextHeight / 2,
        width: nextWidth,
        height: nextHeight,
      },
    };
    if (pinchFrameRef.current === null) {
      pinchFrameRef.current = window.requestAnimationFrame(flushPinchUpdate);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerEndCapture = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    const wasPinching = pinchGestureRef.current.active;
    touchPointersRef.current.delete(e.pointerId);
    if (!wasPinching) return;

    if (pendingPinchRef.current) {
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
      }
      flushPinchUpdate();
    }
    if (touchPointersRef.current.size < 2) {
      pinchGestureRef.current.active = false;
      if (pinchGestureRef.current.historyCaptured) {
        const project = useProjectStore.getState().currentProject;
        if (project) autosaveService.scheduleSave(project);
      }
      pinchGestureRef.current.historyCaptured = false;
      pinchGestureRef.current.startTransform = null;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFullscreenActive) return;
    const canMobilePan =
      window.matchMedia(MOBILE_CANVAS_QUERY).matches && zoomMode !== 'fit';
    if (isSpacePressed || activeTool === 'hand' || canMobilePan) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isFullscreenActive) return;
    if (isPanning) {
      const nextPan = {
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      };
      if (window.matchMedia(MOBILE_CANVAS_QUERY).matches) {
        pendingPanRef.current = nextPan;
        if (panFrameRef.current === null) {
          panFrameRef.current = window.requestAnimationFrame(() => {
            panFrameRef.current = null;
            if (pendingPanRef.current) setPan(pendingPanRef.current);
            pendingPanRef.current = null;
          });
        }
      } else {
        setPan(nextPan);
      }
    }
  };

  const handlePointerUp = () => {
    if (pendingPanRef.current) {
      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current);
        panFrameRef.current = null;
      }
      setPan(pendingPanRef.current);
      pendingPanRef.current = null;
    }
    setIsPanning(false);
  };


  const handleExitFullscreen = useCallback(() => {
    if (document.fullscreenElement?.id === 'stage-fullscreen-container') {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    setIsNativeFullscreen(false);
  }, [setIsFullscreen]);

  return (
    <div
      id="stage-fullscreen-container"
      data-fullscreen={isFullscreenActive}
      tabIndex={-1}
      aria-label={isFullscreenActive ? "Project preview" : undefined}
      style={
        isFullscreenActive && mobileViewportHeight
          ? { height: mobileViewportHeight }
          : undefined
      }
      className={`flex w-full flex-col bg-canvas-bg text-studio-fg select-none outline-none ${
        isFullscreenActive
          ? 'fixed inset-x-0 top-0 z-50 h-dvh max-h-[100dvh] min-h-0 w-screen bg-black justify-center items-center lg:inset-0 lg:h-screen lg:max-h-none'
          : 'h-full relative'
      }`}
    >
      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        id="stage-backdrop"
        onClick={handleStageContainerClick}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMoveCapture={handlePointerMoveCapture}
        onPointerUpCapture={handlePointerEndCapture}
        onPointerCancelCapture={handlePointerEndCapture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex flex-1 items-center justify-center overflow-hidden w-full h-full touch-none lg:touch-auto ${isFullscreenActive ? 'p-0' : 'p-1 lg:p-1.5'} ${
          !isFullscreenActive && (isSpacePressed || activeTool === 'hand')
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        {!isFullscreenActive && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:24px_24px]"
          />
        )}

        {/* Centered Canvas Box */}
        <div
          id="stage-canvas-box"
          style={{
            width: `${stageDisplayWidth}px`,
            height: `${stageDisplayHeight}px`,
            backgroundColor:
              projectSettings.backgroundColor === 'transparent'
                ? 'transparent'
                : projectSettings.backgroundColor || '#000000',
            backgroundImage:
              projectSettings.backgroundColor === 'transparent'
                ? 'repeating-conic-gradient(#23242a 0% 25%, #141519 0% 50%)'
                : undefined,
            backgroundSize:
              projectSettings.backgroundColor === 'transparent' ? '16px 16px' : undefined,
            transform: isFullscreenActive ? 'none' : `translate(${pan.x}px, ${pan.y}px)`,
          }}
          className={`relative shrink-0 overflow-hidden ${isFullscreenActive ? '' : 'rounded-sm border border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.55)] ring-1 ring-black/40 transition-none lg:transition-transform lg:duration-75'}`}
        >
          {/* Active Visual Layers */}
          <CanvasRenderer stageScale={stageScale} isFullscreenActive={isFullscreenActive} />
        </div>
      </div>

      {isFullscreenActive && <FullscreenPlaybackControls onExit={handleExitFullscreen} />}
    </div>
  );
}
