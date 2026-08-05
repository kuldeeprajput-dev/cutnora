'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';
import { IconButton } from '@/shared/components/ui/IconButton';

export function PreviewStage() {
  const { playhead, isPlaying, togglePlay, stepForward, stepBackward } = usePlaybackStore();
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
    <div className="flex h-full w-full flex-col bg-[#121419] text-[#F4F5F7] select-none">
      {/* Upper Stage Area */}
      <div className="relative flex flex-1 items-center justify-center p-6 overflow-hidden">
        {/* Centered Canvas Container */}
        <div className="relative aspect-video w-full max-w-3xl rounded-lg border border-[#2B2F38] bg-[#000000] shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Subtle Grid / Canvas Placeholder */}
          <div className="text-center text-[#9298A3]">
            <p className="text-xs font-mono font-medium tracking-wide">
              {settings.width} × {settings.height} ({settings.aspectRatio}) • {settings.fps} FPS
            </p>
            <p className="text-[11px] text-[#6F716F] mt-1">Canvas Preview Stage</p>
          </div>
        </div>
      </div>

      {/* Playback Controls Footer Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-[#2B2F38] bg-[#14161B] px-4">
        {/* Left: Resolution & FPS Info */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#9298A3]">
          <span>{settings.aspectRatio}</span>
          <span>•</span>
          <span>{settings.fps} FPS</span>
        </div>

        {/* Center: Play / Pause / Step Controls */}
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

          <span className="ml-3 font-mono text-xs font-semibold text-[#F4F5F7]">
            {formatTime(playhead)} / {formatTime(settings.duration)}
          </span>
        </div>

        {/* Right: Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <IconButton label="Fullscreen preview" size="sm" variant="ghost">
            <Maximize2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
