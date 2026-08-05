'use client';

import React from 'react';
import type { TimelineClip, AudioSettings } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Slider } from '@/shared/components/ui/Slider';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Button } from '@/shared/components/ui/Button';
import { RotateCcw } from 'lucide-react';

export interface AudioTabProps {
  clip: TimelineClip;
}

const defaultAudio: AudioSettings = {
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
};

export function AudioTab({ clip }: AudioTabProps) {
  const { updateClip } = useProjectStore();
  const audio = clip.audio || defaultAudio;

  const updateAudioProp = (updates: Partial<AudioSettings>) => {
    updateClip(clip.id, {
      audio: {
        ...audio,
        ...updates,
      },
    });
  };

  const handleReset = () => {
    updateClip(clip.id, {
      audio: { ...defaultAudio },
    });
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Volume */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[#9298A3]">Volume</label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round((audio.muted ? 0 : audio.volume) * 100)}%</span>
        </div>
        <Slider
          value={audio.volume}
          min={0}
          max={1}
          step={0.01}
          disabled={audio.muted}
          onValueChange={(val) => updateAudioProp({ volume: val })}
        />
      </div>

      {/* Mute Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#9298A3]">Mute Clip Audio</label>
        <Checkbox
          checked={audio.muted}
          onChange={(e) => updateAudioProp({ muted: e.target.checked })}
        />
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Fade In */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[#9298A3]">Fade In (seconds)</label>
          <span className="font-mono text-xs text-[#F4F5F7]">{audio.fadeIn.toFixed(1)}s</span>
        </div>
        <Slider
          value={audio.fadeIn}
          min={0}
          max={Math.max(0, clip.timelineDuration - audio.fadeOut)}
          step={0.1}
          onValueChange={(val) => updateAudioProp({ fadeIn: val })}
        />
      </div>

      {/* Fade Out */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[#9298A3]">Fade Out (seconds)</label>
          <span className="font-mono text-xs text-[#F4F5F7]">{audio.fadeOut.toFixed(1)}s</span>
        </div>
        <Slider
          value={audio.fadeOut}
          min={0}
          max={Math.max(0, clip.timelineDuration - audio.fadeIn)}
          step={0.1}
          onValueChange={(val) => updateAudioProp({ fadeOut: val })}
        />
      </div>

      {/* Reset Action */}
      <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 gap-1.5 text-xs text-[#9298A3] hover:text-[#E45858]">
        <RotateCcw className="h-3.5 w-3.5" /> Reset Audio Controls
      </Button>
    </div>
  );
}
