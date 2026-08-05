'use client';

import React from 'react';
import type { TimelineClip, Adjustments } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Slider } from '@/shared/components/ui/Slider';
import { Button } from '@/shared/components/ui/Button';
import { RotateCcw } from 'lucide-react';

export interface AdjustTabProps {
  clip: TimelineClip;
}

const defaultAdjustments: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
  grayscale: 0,
  sepia: 0,
};

export function AdjustTab({ clip }: AdjustTabProps) {
  const { updateClip } = useProjectStore();
  const adj = clip.adjustments || defaultAdjustments;

  const updateAdj = (key: keyof Adjustments, val: number) => {
    updateClip(clip.id, {
      adjustments: {
        ...adj,
        [key]: val,
      },
    });
  };

  const handleResetProp = (key: keyof Adjustments) => {
    updateAdj(key, defaultAdjustments[key]);
  };

  const handleResetAll = () => {
    updateClip(clip.id, {
      adjustments: { ...defaultAdjustments },
    });
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      <p className="text-[11px] text-[#9298A3]">Double-click any label to reset that property.</p>

      {/* Brightness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('brightness')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Brightness
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(adj.brightness * 100)}%</span>
        </div>
        <Slider
          value={adj.brightness}
          min={0}
          max={2}
          step={0.05}
          onValueChange={(val) => updateAdj('brightness', val)}
        />
      </div>

      {/* Contrast */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('contrast')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Contrast
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(adj.contrast * 100)}%</span>
        </div>
        <Slider
          value={adj.contrast}
          min={0}
          max={2}
          step={0.05}
          onValueChange={(val) => updateAdj('contrast', val)}
        />
      </div>

      {/* Saturation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('saturation')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Saturation
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(adj.saturation * 100)}%</span>
        </div>
        <Slider
          value={adj.saturation}
          min={0}
          max={2}
          step={0.05}
          onValueChange={(val) => updateAdj('saturation', val)}
        />
      </div>

      {/* Blur */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('blur')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Blur (px)
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{adj.blur}px</span>
        </div>
        <Slider
          value={adj.blur}
          min={0}
          max={20}
          step={1}
          onValueChange={(val) => updateAdj('blur', val)}
        />
      </div>

      {/* Grayscale */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('grayscale')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Grayscale
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(adj.grayscale * 100)}%</span>
        </div>
        <Slider
          value={adj.grayscale}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(val) => updateAdj('grayscale', val)}
        />
      </div>

      {/* Sepia */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            onDoubleClick={() => handleResetProp('sepia')}
            className="text-[11px] font-medium text-[#9298A3] cursor-pointer hover:text-[#F4F5F7]"
            title="Double-click to reset"
          >
            Sepia
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(adj.sepia * 100)}%</span>
        </div>
        <Slider
          value={adj.sepia}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(val) => updateAdj('sepia', val)}
        />
      </div>

      {/* Reset Action */}
      <Button size="sm" variant="ghost" onClick={handleResetAll} className="h-8 gap-1.5 text-xs text-[#9298A3] hover:text-[#E45858]">
        <RotateCcw className="h-3.5 w-3.5" /> Reset All Adjustments
      </Button>
    </div>
  );
}
