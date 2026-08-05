'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { CanvasRenderer } from './CanvasRenderer';
import { calculateFitScale, type Point } from '../utils/stage-math';
import type { GuideLine } from '../utils/snapping-utils';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Select } from '@/shared/components/ui/Select';
import { RotateCcw, Hand } from 'lucide-react';

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentProject } = useProjectStore();
  const { clearSelection, activeTool, setActiveTool } = useEditorUIStore();

  const [zoomMode, setZoomMode] = useState<'fit' | number>('fit');
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

  const projectSettings = currentProject?.settings || {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    backgroundColor: '#000000',
  };

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

  // Fit scale calculation
  const fitScale = calculateFitScale(
    { width: Math.max(100, containerSize.width - 64), height: Math.max(100, containerSize.height - 64) },
    { width: projectSettings.width, height: projectSettings.height }
  );

  const stageScale = zoomMode === 'fit' ? fitScale : zoomMode / 100;

  const stageDisplayWidth = projectSettings.width * stageScale;
  const stageDisplayHeight = projectSettings.height * stageScale;

  const handleStageContainerClick = (e: React.MouseEvent) => {
    // Clear selection when clicking empty surrounding background
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'stage-backdrop') {
      clearSelection();
    }
  };

  const handleResetView = () => {
    setZoomMode('fit');
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
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

  return (
    <div className="flex h-full w-full flex-col bg-[#121419] text-[#F4F5F7] select-none">
      {/* Upper Stage Viewport */}
      <div
        ref={containerRef}
        id="stage-backdrop"
        onClick={handleStageContainerClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative flex flex-1 items-center justify-center overflow-hidden p-6 ${
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
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
          className="relative shadow-2xl transition-transform duration-75 overflow-hidden rounded"
        >
          {/* Active Visual Layers */}
          <CanvasRenderer stageScale={stageScale} onGuidesChange={handleGuidesChange} />

          {/* Snapping Guide Lines */}
          {guides.map((g) => (
            <div
              key={g.id}
              style={{
                position: 'absolute',
                left: g.type === 'vertical' ? `${g.position * stageScale}px` : 0,
                top: g.type === 'horizontal' ? `${g.position * stageScale}px` : 0,
                width: g.type === 'vertical' ? '1px' : '100%',
                height: g.type === 'horizontal' ? '1px' : '100%',
              }}
              className="bg-[#FF5A36] z-50 pointer-events-none"
            />
          ))}
        </div>
      </div>

      {/* Floating Stage Controls Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-[#2B2F38] bg-[#14161B] px-4">
        {/* Left: Resolution & Scale Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#9298A3]">
          <span>
            {projectSettings.width}×{projectSettings.height}
          </span>
          <span>•</span>
          <span className="font-semibold text-[#F4F5F7]">
            {Math.round(stageScale * 100)}%
          </span>
        </div>

        {/* Center: Zoom Select & Reset Actions */}
        <div className="flex items-center gap-2">
          <IconButton
            label={activeTool === 'hand' ? 'Pan tool active' : 'Pan tool'}
            size="sm"
            variant={activeTool === 'hand' ? 'selection' : 'ghost'}
            onClick={() => setActiveTool(activeTool === 'hand' ? 'select' : 'hand')}
          >
            <Hand className="h-3.5 w-3.5" />
          </IconButton>

          <Select
            value={zoomMode === 'fit' ? 'fit' : String(zoomMode)}
            onChange={(e) => {
              const val = e.target.value;
              setZoomMode(val === 'fit' ? 'fit' : parseInt(val, 10));
            }}
            className="h-7 text-xs w-28 py-0 pl-2 pr-6 border-[#2B2F38]"
          >
            <option value="fit">Fit Stage</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
          </Select>

          <IconButton label="Reset canvas view" size="sm" variant="ghost" onClick={handleResetView}>
            <RotateCcw className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        {/* Right: Hint */}
        <div className="text-[11px] text-[#9298A3]">
          Hold <kbd className="font-mono bg-[#1D2027] px-1 rounded text-white">Space</kbd> to pan
        </div>
      </div>
    </div>
  );
}
