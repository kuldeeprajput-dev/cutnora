'use client';

import React from 'react';
import type { TimelineClip, ElementStyle } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Slider } from '@/shared/components/ui/Slider';

export interface ElementInspectorTabProps {
  clip: TimelineClip;
}

export function ElementInspectorTab({ clip }: ElementInspectorTabProps) {
  const { updateClip } = useProjectStore();

  const elementStyle: ElementStyle = clip.elementStyle || {
    fillColor: '#FF5A36',
    borderRadius: 8,
  };

  const updateStyle = (updates: Partial<ElementStyle>) => {
    updateClip(clip.id, {
      elementStyle: {
        ...elementStyle,
        ...updates,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Fill & Border Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Fill Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={elementStyle.fillColor || '#FF5A36'}
              onChange={(e) => updateStyle({ fillColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">{elementStyle.fillColor}</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Border Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={elementStyle.strokeColor || '#FFFFFF'}
              onChange={(e) => updateStyle({ strokeColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">{elementStyle.strokeColor || 'None'}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Border Width */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[#9298A3]">Border Width (px)</label>
          <span className="font-mono text-xs text-[#F4F5F7]">{elementStyle.strokeWidth || 0}px</span>
        </div>
        <Slider
          value={elementStyle.strokeWidth || 0}
          min={0}
          max={20}
          step={1}
          onValueChange={(val) => updateStyle({ strokeWidth: val })}
        />
      </div>

      {/* Corner Radius */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[#9298A3]">Corner Radius (px)</label>
          <span className="font-mono text-xs text-[#F4F5F7]">{elementStyle.borderRadius || 0}px</span>
        </div>
        <Slider
          value={elementStyle.borderRadius || 0}
          min={0}
          max={100}
          step={1}
          onValueChange={(val) => updateStyle({ borderRadius: val })}
        />
      </div>
    </div>
  );
}
