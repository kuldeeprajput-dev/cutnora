'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Info, RotateCcw } from 'lucide-react';

export interface SpeedTabProps {
  clip: TimelineClip;
}

const speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export function SpeedTab({ clip }: SpeedTabProps) {
  const { updateClip } = useProjectStore();

  const handleSpeedChange = (newSpeed: number) => {
    const validSpeed = Math.min(4, Math.max(0.1, newSpeed));
    // Calculate new timeline duration based on source duration / speed
    const newTimelineDuration = clip.sourceDuration / validSpeed;

    updateClip(clip.id, {
      speed: validSpeed,
      timelineDuration: Math.max(0.1, newTimelineDuration),
    });
  };

  return (
    <div className="flex flex-col gap-4 text-studio-fg select-none">
      {/* Speed Presets Grid */}
      <div>
        <label className="text-[11px] font-medium text-studio-muted block mb-2">Speed Presets</label>
        <div className="grid grid-cols-4 gap-1.5">
          {speedPresets.map((sp) => {
            const isActive = Math.abs(clip.speed - sp) < 0.01;
            return (
              <button
                key={sp}
                type="button"
                onClick={() => handleSpeedChange(sp)}
                className={`flex h-8 items-center justify-center rounded-lg text-xs transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white font-bold shadow-sm'
                    : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
                }`}
              >
                {sp}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Speed Input */}
      <div>
        <label className="text-[11px] font-medium text-studio-muted block mb-1">Custom Speed Multiplier</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0.1}
            max={4}
            step={0.1}
            value={clip.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value) || 1)}
            className="h-8 text-xs font-mono"
          />
          <span className="text-xs font-mono text-studio-muted">x</span>
        </div>
      </div>

      {/* Explanatory Hint */}
      <div className="flex items-start gap-2 rounded-lg border border-studio-border bg-studio-panel p-2.5 text-xs text-studio-muted">
        <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <span>Changing clip playback speed adjusts its visible duration on the timeline without altering source trims.</span>
      </div>

      <div className="h-px bg-studio-border mt-1" />

      {/* Reset Action */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleSpeedChange(1)}
        className="h-8 gap-1.5 text-xs text-studio-muted hover:text-destructive cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Speed (1.0x)
      </Button>
    </div>
  );
}
