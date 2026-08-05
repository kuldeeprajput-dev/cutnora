'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, AlertCircle } from 'lucide-react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';
import { IconButton } from '@/shared/components/ui/IconButton';
import { CanvasStage } from '@/modules/editor/features/canvas';
import { usePlaybackEngine } from '@/modules/editor/features/playback';

export function PreviewStage() {
  usePlaybackEngine();

  const {
    playhead,
    isPlaying,
    togglePlay,
    stepForward,
    stepBackward,
    isLooping,
    toggleLooping,
    wasTabHiddenPaused,
    setWasTabHiddenPaused,
  } = usePlaybackStore();

  const { currentProject } = useProjectStore();

  const settings = currentProject?.settings || {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    fps: 30,
    duration: 10,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full w-full flex-col bg-canvas-bg text-studio-fg select-none">
      {/* Tab Hidden Paused Banner */}
      {wasTabHiddenPaused && (
        <div className="flex items-center justify-between bg-studio-panel-raised border-b border-studio-border px-4 py-1.5 text-xs text-selection">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Playback paused automatically because tab was hidden.
          </span>
          <button
            type="button"
            onClick={() => setWasTabHiddenPaused(false)}
            className="text-[11px] underline text-studio-muted hover:text-studio-fg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Canvas Stage */}
      <div className="flex-1 overflow-hidden relative">
        <CanvasStage />
      </div>

      {/* Playback Transport Control Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-studio-border bg-studio-topbar px-4">
        {/* Left: Resolution & FPS Info */}
        <div className="flex items-center gap-2 text-xs font-mono text-studio-muted">
          <span>{settings.aspectRatio}</span>
          <span>•</span>
          <span>{settings.fps} FPS</span>
        </div>

        {/* Center: Play / Pause / Step Controls / Loop */}
        <div className="flex items-center gap-2">
          <IconButton label="Step 1 frame backward" size="sm" variant="ghost" onClick={stepBackward}>
            <SkipBack className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isPlaying ? 'Pause' : 'Play'}
            size="md"
            variant="primary"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </IconButton>

          <IconButton label="Step 1 frame forward" size="sm" variant="ghost" onClick={stepForward}>
            <SkipForward className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isLooping ? 'Disable loop' : 'Enable loop'}
            size="sm"
            variant={isLooping ? 'selection' : 'ghost'}
            onClick={toggleLooping}
          >
            <Repeat className="h-3.5 w-3.5" />
          </IconButton>

          <span className="ml-3 font-mono text-xs font-semibold text-studio-fg">
            {formatTime(playhead)} / {formatTime(settings.duration)}
          </span>
        </div>

        {/* Right: Spacer */}
        <div className="w-24" />
      </div>
    </div>
  );
}
