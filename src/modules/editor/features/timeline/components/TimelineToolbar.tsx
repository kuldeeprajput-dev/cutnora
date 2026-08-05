'use client';

import React from 'react';
import {
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Hand,
  Maximize2,
} from 'lucide-react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/Slider';
import { Select } from '@/shared/components/ui/Select';
import { formatTimecode } from '../utils/ruler-utils';

export function TimelineToolbar() {
  const {
    selectedClipIds,
    zoom,
    setZoom,
    activeTool,
    setActiveTool,
    zoomMode,
    setZoomMode,
    stageScale,
    triggerResetView,
  } = useEditorUIStore();

  const {
    playhead,
    duration,
    fps,
    isPlaying,
    isLooping,
    togglePlay,
    toggleLooping,
    stepForward,
    stepBackward,
  } = usePlaybackStore();

  const { currentProject, splitClip, duplicateClips, deleteClips, addTrack } = useProjectStore();

  const projectSettings = currentProject?.settings || {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 10,
  };

  const hasSelection = selectedClipIds.length > 0;

  const handleSplit = () => {
    if (selectedClipIds.length > 0) {
      selectedClipIds.forEach((id) => splitClip(id, playhead));
    }
  };

  const handleDuplicate = () => {
    if (selectedClipIds.length > 0) {
      duplicateClips(selectedClipIds);
    }
  };

  const handleDelete = () => {
    if (selectedClipIds.length > 0) {
      deleteClips(selectedClipIds);
      useEditorUIStore.getState().clearSelection();
    }
  };

  const handleResetZoom = () => {
    setZoom(50);
  };

  return (
    <div className="flex h-10 w-full shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar px-3 text-xs select-none overflow-x-auto">
      {/* Left: Timeline Edit Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton
          label="Split clip at playhead (S)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleSplit}
          className="cursor-pointer"
        >
          <Scissors className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Duplicate selection (Ctrl+D)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDuplicate}
          className="cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Delete selection (Delete)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDelete}
          className="cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </IconButton>

        <div className="mx-1 h-3.5 w-px bg-studio-border" />

        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1 cursor-pointer"
          onClick={() => addTrack('video')}
        >
          <Plus className="h-3.5 w-3.5" /> Add Track
        </Button>
      </div>

      {/* Center: Stage Controls + Transport Playback Controls */}
      <div className="flex items-center gap-2 shrink-0 px-2">
        {/* Canvas Stage View Controls (Hand, Fit Stage, Reset View) */}
        <div className="flex items-center gap-1">
          <IconButton
            label={activeTool === 'hand' ? 'Pan tool active' : 'Pan tool'}
            size="sm"
            variant={activeTool === 'hand' ? 'selection' : 'ghost'}
            onClick={() => setActiveTool(activeTool === 'hand' ? 'select' : 'hand')}
            className="cursor-pointer"
          >
            <Hand className="h-3.5 w-3.5" />
          </IconButton>

          <Select
            value={zoomMode === 'fit' ? 'fit' : String(zoomMode)}
            onChange={(e) => {
              const val = e.target.value;
              setZoomMode(val === 'fit' ? 'fit' : parseInt(val, 10));
            }}
            className="h-6 text-[11px] w-24 py-0 pl-1.5 pr-5 border-studio-border bg-studio-bg rounded-md cursor-pointer"
          >
            <option value="fit">Fit Stage</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
          </Select>

          <IconButton
            label="Reset canvas view"
            size="sm"
            variant="ghost"
            onClick={triggerResetView}
            className="cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <div className="h-3.5 w-px bg-studio-border" />

        {/* Transport Playback Controls & Timecode */}
        <div className="flex items-center gap-1.5">
          <IconButton label="Step 1 frame backward" size="sm" variant="ghost" onClick={stepBackward} className="cursor-pointer">
            <SkipBack className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isPlaying ? 'Pause' : 'Play'}
            size="sm"
            variant="primary"
            onClick={togglePlay}
            className="cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            )}
          </IconButton>

          <IconButton label="Step 1 frame forward" size="sm" variant="ghost" onClick={stepForward} className="cursor-pointer">
            <SkipForward className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isLooping ? 'Disable loop' : 'Enable loop'}
            size="sm"
            variant={isLooping ? 'selection' : 'ghost'}
            onClick={toggleLooping}
            className="cursor-pointer"
          >
            <Repeat className="h-3.5 w-3.5" />
          </IconButton>

          <span className="ml-2 font-mono text-[11px] font-semibold text-studio-fg whitespace-nowrap">
            {formatTimecode(playhead, fps, true)} / {formatTimecode(duration, fps, false)}
          </span>

          <IconButton
            label="Toggle fullscreen video stage"
            size="sm"
            variant="ghost"
            onClick={() => {
              const stageContainer = document.getElementById('stage-fullscreen-container') || document.documentElement;
              if (!document.fullscreenElement) {
                stageContainer.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
              useEditorUIStore.getState().toggleFullscreen();
            }}
            className="cursor-pointer ml-1"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Right: Only Resolution & FPS Quality Info + Zoom Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quality Resolution & FPS Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-studio-muted text-[11px] whitespace-nowrap shrink-0">
          <span>
            {projectSettings.width}×{projectSettings.height}
          </span>
          <span>•</span>
          <span>{projectSettings.fps} FPS</span>
          <span>•</span>
          <span className="font-semibold text-studio-fg">
            {Math.round(stageScale * 100)}%
          </span>
        </div>

        <div className="h-3.5 w-px bg-studio-border" />

        {/* Timeline Zoom Slider Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Reset zoom"
            title="Reset zoom"
            className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
            onClick={handleResetZoom}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 w-24">
            <button
              type="button"
              aria-label="Zoom out"
              title="Zoom out"
              className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
              onClick={() => setZoom(Math.max(10, zoom - 10))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <Slider value={zoom} min={10} max={200} step={5} onValueChange={setZoom} />
            <button
              type="button"
              aria-label="Zoom in"
              title="Zoom in"
              className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
