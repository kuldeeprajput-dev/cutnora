'use client';

import React from 'react';
import type { TimelineClip, ElementStyle } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Slider } from '@/shared/components/ui/Slider';
import { Select } from '@/shared/components/ui/Select';

export interface ElementInspectorTabProps {
  clip: TimelineClip;
}

export function ElementInspectorTab({ clip }: ElementInspectorTabProps) {
  const { updateClip } = useProjectStore();

  const elementStyle: ElementStyle = clip.elementStyle || {
    fillColor: '#FF5A36',
    borderRadius: 8,
    shapeType: 'rectangle',
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

      {/* Border Width & Style */}
      <div className="grid grid-cols-2 gap-3">
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

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Line Style</label>
          <Select
            value={elementStyle.lineStyle || 'solid'}
            onChange={(e) => updateStyle({ lineStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
            className="h-8 text-xs border-[#2B2F38]"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </Select>
        </div>
      </div>

      {/* Arrowhead Option (if shapeType === 'arrow') */}
      {elementStyle.shapeType === 'arrow' && (
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Arrowheads</label>
          <Select
            value={elementStyle.arrowHead || 'end'}
            onChange={(e) => updateStyle({ arrowHead: e.target.value as 'none' | 'end' | 'both' })}
            className="h-8 text-xs border-[#2B2F38]"
          >
            <option value="none">None</option>
            <option value="end">End Arrowhead</option>
            <option value="both">Both Ends</option>
          </Select>
        </div>
      )}

      {/* Progress % Slider (if shapeType === 'progress-bar') */}
      {elementStyle.shapeType === 'progress-bar' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Progress Value</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{elementStyle.progress ?? 65}%</span>
          </div>
          <Slider
            value={elementStyle.progress ?? 65}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => updateStyle({ progress: val })}
          />
        </div>
      )}

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

      <div className="h-px bg-[#2B2F38]" />

      {/* Shape Drop Shadow */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Drop Shadow</label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={elementStyle.shadowColor || '#000000'}
              onChange={(e) => updateStyle({ shadowColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">Shadow Color</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-[#9298A3] block">Blur</span>
              <Slider
                value={elementStyle.shadowBlur || 0}
                min={0}
                max={30}
                step={1}
                onValueChange={(val) => updateStyle({ shadowBlur: val })}
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9298A3] block">Offset X</span>
              <Slider
                value={elementStyle.shadowOffsetX || 0}
                min={-20}
                max={20}
                step={1}
                onValueChange={(val) => updateStyle({ shadowOffsetX: val })}
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9298A3] block">Offset Y</span>
              <Slider
                value={elementStyle.shadowOffsetY || 0}
                min={-20}
                max={20}
                step={1}
                onValueChange={(val) => updateStyle({ shadowOffsetY: val })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
