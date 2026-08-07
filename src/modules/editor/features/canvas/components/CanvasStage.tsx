'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { CanvasRenderer } from './CanvasRenderer';
import { calculateFitScale, type Point } from '../utils/stage-math';
import type { GuideLine } from '../utils/snapping-utils';
import { Play, Pause, Minimize2 } from 'lucide-react';

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
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

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
      height: Math.max(100, isFullscreenActive ? window.innerHeight - 80 : containerSize.height - 16),
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
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'stage-backdrop') {
      clearSelection();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpacePressed || activeTool === 'hand') {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleGuidesChange = useCallback((newGuides: GuideLine[]) => {
    setGuides(newGuides);
  }, []);

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  return (
    <div
      id="stage-fullscreen-container"
      className={`flex w-full flex-col bg-canvas-bg text-studio-fg select-none ${
        isFullscreenActive
          ? 'fixed inset-0 z-50 h-screen w-screen bg-black justify-center items-center'
          : 'h-full relative'
      }`}
    >
      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        id="stage-backdrop"
        onClick={handleStageContainerClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative flex flex-1 items-center justify-center overflow-hidden p-2 w-full h-full ${
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
          className="relative shadow-2xl transition-transform duration-75 rounded"
        >
          {/* Active Visual Layers */}
          <CanvasRenderer stageScale={stageScale} onGuidesChange={handleGuidesChange} />

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
        <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col bg-gradient-to-t from-black/95 via-black/70 to-transparent px-6 pb-4 pt-8 transition-opacity duration-300">
          {/* Progress Scrub Line */}
          <div className="relative mb-3 flex items-center w-full group cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.01}
              value={playhead}
              onChange={(e) => setPlayhead(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-brand transition-all"
            />
          </div>

          {/* Overlay Controls Row */}
          <div className="flex items-center justify-between text-xs text-white select-none">
            {/* Left: Timecode */}
            <div className="font-mono text-xs opacity-90">
              {formatTime(playhead)} / {formatTime(duration)}
            </div>

            {/* Center: Play / Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
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
              className="p-2 rounded-md hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
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
