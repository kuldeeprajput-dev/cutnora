'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { autosaveService, useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { historyManager } from '@/modules/editor/store/useHistoryStore';
import { CanvasRenderer } from './CanvasRenderer';
import { calculateFitScale, type Point } from '../utils/stage-math';
import type { GuideLine } from '../utils/snapping-utils';
import type { TimelineClip } from '@/modules/editor/types';
import { Play, Pause, Minimize2 } from 'lucide-react';

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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentProject } = useProjectStore();
  const {
    clearSelection,
    activeTool,
    zoomMode,
    setZoomMode,
    setStageScale,
    resetViewCount,
    isFullscreen,
    setIsFullscreen,
  } = useEditorUIStore();

  const {
    playhead,
    setPlayhead,
    duration,
    isPlaying,
    togglePlay,
  } = usePlaybackStore();

  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });
  const [guides, setGuides] = useState<GuideLine[]>([]);
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
  } | null>(null);
  const suppressStageClickRef = useRef(false);
  const pinchGestureRef = useRef({
    active: false,
    clipId: '',
    startDistance: 1,
    startMidpoint: { x: 0, y: 0 },
    startTransform: null as TimelineClip['transform'] | null,
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

  // Sync native browser fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsNativeFullscreen(isFull);
      setIsFullscreen(isFull);
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

  const isFullscreenActive = isFullscreen || isNativeFullscreen;

  // Fit scale calculation (minimal 16px total padding for maximum video view)
  const fitScale = calculateFitScale(
    {
      width: Math.max(100, isFullscreenActive ? window.innerWidth : containerSize.width - 16),
      height: Math.max(
        100,
        isFullscreenActive
          ? (mobileViewportHeight ?? window.innerHeight) - (mobileViewportHeight ? 112 : 80)
          : containerSize.height - 16,
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
        break;
      }
    });
  };

  const handlePointerDownCapture = (e: React.PointerEvent) => {
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
    if (e.pointerType !== 'touch' || !touchPointersRef.current.has(e.pointerId)) return;

    touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const gesture = pinchGestureRef.current;
    if (!gesture.active || !gesture.startTransform || touchPointersRef.current.size < 2) return;

    const [first, second] = Array.from(touchPointersRef.current.values());
    const distanceRatio = getPointerDistance(first, second) / gesture.startDistance;
    const mediaScale = Math.min(8, Math.max(0.1, distanceRatio));
    const midpoint = getPointerMidpoint(first, second);
    const startTransform = gesture.startTransform;
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

  const handleGuidesChange = useCallback((newGuides: GuideLine[]) => {
    setGuides(newGuides);
  }, []);

  const handleFullscreenPlayback = () => {
    const stageVideos = document.querySelectorAll<HTMLVideoElement>(
      "#stage-canvas-box video",
    );
    stageVideos.forEach((video) => {
      if (isPlaying) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    });
    togglePlay();
  };

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  return (
    <div
      id="stage-fullscreen-container"
      style={
        isFullscreenActive && mobileViewportHeight
          ? { height: mobileViewportHeight }
          : undefined
      }
      className={`flex w-full flex-col bg-canvas-bg text-studio-fg select-none ${
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
        className={`relative flex flex-1 items-center justify-center overflow-hidden p-1.5 w-full h-full touch-none lg:p-2 lg:touch-auto ${
          isSpacePressed || activeTool === 'hand'
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        {/* Centered Canvas Box */}
        <div
          id="stage-canvas-box"
          style={{
            width: `${stageDisplayWidth}px`,
            height: `${stageDisplayHeight}px`,
            backgroundColor: projectSettings.backgroundColor || '#000000',
            transform: isFullscreenActive ? 'none' : `translate(${pan.x}px, ${pan.y}px)`,
          }}
          className="relative rounded shadow-2xl transition-none lg:transition-transform lg:duration-75"
        >
          {/* Active Visual Layers */}
          <CanvasRenderer stageScale={stageScale} isFullscreenActive={isFullscreenActive} onGuidesChange={handleGuidesChange} />

          {/* Snapping Guide Lines (hidden in Fullscreen mode) */}
          {!isFullscreenActive &&
            guides.map((g) => (
              <div
                key={g.id}
                style={{
                  position: 'absolute',
                  left: g.type === 'vertical' ? `${g.position * stageScale}px` : 0,
                  top: g.type === 'horizontal' ? `${g.position * stageScale}px` : 0,
                  width: g.type === 'vertical' ? '1px' : '100%',
                  height: g.type === 'horizontal' ? '1px' : '100%',
                }}
                className="bg-brand z-50 pointer-events-none"
              />
            ))}
        </div>
      </div>

      {/* Fullscreen Player Bottom Controls Overlay (Image 1 & Image 2) */}
      {isFullscreenActive && (
        <div className="absolute inset-x-0 bottom-0 z-50 flex shrink-0 flex-col bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 transition-opacity duration-300 [@media(max-height:600px)]:pt-4 lg:px-6 lg:pb-4 lg:pt-8">
          {/* Progress Scrub Line */}
          <div className="relative mb-1 flex h-10 w-full items-center cursor-pointer lg:mb-3 lg:h-auto lg:group">
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.01}
              value={playhead}
              onInput={(e) => {
                if (window.matchMedia(MOBILE_CANVAS_QUERY).matches) {
                  setPlayhead(parseFloat(e.currentTarget.value));
                }
              }}
              onChange={(e) => setPlayhead(parseFloat(e.target.value))}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              className="h-10 w-full touch-none cursor-pointer accent-brand lg:h-1 lg:appearance-none lg:rounded-lg lg:bg-white/20 lg:transition-all lg:hover:h-1.5"
            />
          </div>

          {/* Overlay Controls Row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-xs text-white select-none lg:flex lg:justify-between">
            {/* Left: Timecode */}
            <div className="font-mono text-xs opacity-90">
              {formatTime(playhead)} / {formatTime(duration)}
            </div>

            {/* Center: Play / Pause Button */}
            <button
              type="button"
              onClick={handleFullscreenPlayback}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Right: Exit Fullscreen Button with Minimize2 Icon (Image 2) */}
            <button
              type="button"
              onClick={handleExitFullscreen}
              className="justify-self-end p-2 rounded-md hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer lg:justify-self-auto"
              title="Exit Fullscreen"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
