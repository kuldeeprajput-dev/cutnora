'use client';

import React from 'react';
import type { TimelineClip, TextStyle } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/Slider';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

export interface TextInspectorTabProps {
  clip: TimelineClip;
}

const fontFamilies = [
  { label: 'Inter (Sans-Serif)', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New (Monospace)', value: 'Courier New, monospace' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

export function TextInspectorTab({ clip }: TextInspectorTabProps) {
  const { updateClip } = useProjectStore();

  const textStyle: TextStyle = clip.textStyle || {
    text: clip.name || 'Sample Text',
    fontSize: 48,
    fontFamily: 'Inter, sans-serif',
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  };

  const updateTextStyle = (updates: Partial<TextStyle>) => {
    const updatedStyle = { ...textStyle, ...updates };
    updateClip(clip.id, {
      name: updates.text !== undefined ? updates.text.slice(0, 20) || 'Text' : clip.name,
      textStyle: updatedStyle,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Text Content Textarea */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Text Content</label>
        <textarea
          rows={3}
          value={textStyle.text}
          onChange={(e) => updateTextStyle({ text: e.target.value })}
          className="w-full rounded-lg border border-[#2B2F38] bg-[#171A20] p-2 text-xs text-[#F4F5F7] focus:outline-none focus:ring-2 focus:ring-[#FF5A36] resize-none"
        />
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Font Family & Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Font Family</label>
          <Select
            value={textStyle.fontFamily}
            onChange={(e) => updateTextStyle({ fontFamily: e.target.value })}
            className="h-8 text-xs border-[#2B2F38]"
          >
            {fontFamilies.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Font Size (px)</label>
          <Input
            type="number"
            min={10}
            max={200}
            value={textStyle.fontSize}
            onChange={(e) => updateTextStyle({ fontSize: parseInt(e.target.value, 10) || 48 })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Alignment & Weight / Style */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Style & Alignment</label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={textStyle.fontWeight === 'bold' ? 'selection' : 'secondary'}
            onClick={() => updateTextStyle({ fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold' })}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={textStyle.fontStyle === 'italic' ? 'selection' : 'secondary'}
            onClick={() => updateTextStyle({ fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="flex items-center rounded-lg border border-[#2B2F38] bg-[#171A20] p-0.5 ml-auto">
            <Button
              size="sm"
              variant={textStyle.textAlign === 'left' ? 'secondary' : 'ghost'}
              onClick={() => updateTextStyle({ textAlign: 'left' })}
              className="h-7 w-7 p-0"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={textStyle.textAlign === 'center' ? 'secondary' : 'ghost'}
              onClick={() => updateTextStyle({ textAlign: 'center' })}
              className="h-7 w-7 p-0"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={textStyle.textAlign === 'right' ? 'secondary' : 'ghost'}
              onClick={() => updateTextStyle({ textAlign: 'right' })}
              className="h-7 w-7 p-0"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Line Height</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{(textStyle.lineHeight || 1.2).toFixed(1)}</span>
          </div>
          <Slider
            value={textStyle.lineHeight || 1.2}
            min={0.8}
            max={2.5}
            step={0.1}
            onValueChange={(val) => updateTextStyle({ lineHeight: val })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Letter Spacing (px)</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{textStyle.letterSpacing || 0}px</span>
          </div>
          <Slider
            value={textStyle.letterSpacing || 0}
            min={-5}
            max={30}
            step={1}
            onValueChange={(val) => updateTextStyle({ letterSpacing: val })}
          />
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textStyle.color || '#FFFFFF'}
              onChange={(e) => updateTextStyle({ color: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">{textStyle.color}</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Background Fill</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textStyle.backgroundColor || '#000000'}
              onChange={(e) => updateTextStyle({ backgroundColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">{textStyle.backgroundColor || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Background Padding & Corner Radius */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Bg Padding (px)</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{textStyle.bgPadding || 0}px</span>
          </div>
          <Slider
            value={textStyle.bgPadding || 0}
            min={0}
            max={40}
            step={1}
            onValueChange={(val) => updateTextStyle({ bgPadding: val })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Bg Radius (px)</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{textStyle.bgRadius || 0}px</span>
          </div>
          <Slider
            value={textStyle.bgRadius || 0}
            min={0}
            max={40}
            step={1}
            onValueChange={(val) => updateTextStyle({ bgRadius: val })}
          />
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Text Outline / Stroke */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Text Outline</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textStyle.outlineColor || '#000000'}
              onChange={(e) => updateTextStyle({ outlineColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">{textStyle.outlineColor || '#000'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#9298A3]">Width</span>
              <span className="font-mono text-xs text-[#F4F5F7]">{textStyle.outlineWidth || 0}px</span>
            </div>
            <Slider
              value={textStyle.outlineWidth || 0}
              min={0}
              max={10}
              step={1}
              onValueChange={(val) => updateTextStyle({ outlineWidth: val })}
            />
          </div>
        </div>
      </div>

      {/* Drop Shadow */}
      <div>
        <label className="text-[11px] font-medium text-[#9298A3] block mb-1.5">Text Shadow</label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textStyle.shadowColor || '#000000'}
              onChange={(e) => updateTextStyle({ shadowColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
            />
            <span className="font-mono text-xs text-[#9298A3]">Shadow Color</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-[#9298A3] block">Blur</span>
              <Slider
                value={textStyle.shadowBlur || 0}
                min={0}
                max={30}
                step={1}
                onValueChange={(val) => updateTextStyle({ shadowBlur: val })}
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9298A3] block">Offset X</span>
              <Slider
                value={textStyle.shadowOffsetX || 0}
                min={-20}
                max={20}
                step={1}
                onValueChange={(val) => updateTextStyle({ shadowOffsetX: val })}
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9298A3] block">Offset Y</span>
              <Slider
                value={textStyle.shadowOffsetY || 0}
                min={-20}
                max={20}
                step={1}
                onValueChange={(val) => updateTextStyle({ shadowOffsetY: val })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
