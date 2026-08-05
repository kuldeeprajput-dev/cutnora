'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Info } from 'lucide-react';

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
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Speed Presets Grid */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-2">Speed Presets</label>
        <div className="grid grid-cols-4 gap-1.5">
          {speedPresets.map((sp) => (
            <Button
              key={sp}
              size="sm"
              variant={clip.speed === sp ? 'selection' : 'secondary'}
              onClick={() => handleSpeedChange(sp)}
              className="text-xs"
            >
              {sp}x
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Speed Input */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Custom Speed Multiplier</label>
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
          <span className="text-xs font-mono text-[#9298A3]">x</span>
        </div>
      </div>

      {/* Explanatory Hint */}
      <div className="flex items-start gap-2 rounded-lg border border-[#2B2F38] bg-[#171A20] p-2.5 text-xs text-[#9298A3]">
        <Info className="h-4 w-4 text-[#FF5A36] shrink-0 mt-0.5" />
        <span>Changing clip playback speed adjusts its visible duration on the timeline without altering source trims.</span>
      </div>
    </div>
  );
}
