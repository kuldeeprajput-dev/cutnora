'use client';

import React, { useState, useEffect } from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Slider } from '@/shared/components/ui/Slider';
import { Maximize2, RotateCcw, Crop, FlipHorizontal, FlipVertical, Lock, Unlock } from 'lucide-react';

export interface TransformTabProps {
  clip: TimelineClip;
}

export function TransformTab({ clip }: TransformTabProps) {
  const { updateClip, currentProject } = useProjectStore();
  const { setActiveTool } = useEditorUIStore();

  const [x, setX] = useState(clip.transform.x);
  const [y, setY] = useState(clip.transform.y);
  const [width, setWidth] = useState(clip.transform.width);
  const [height, setHeight] = useState(clip.transform.height);
  const [rotation, setRotation] = useState(clip.transform.rotation);
  const [opacity, setOpacity] = useState(clip.transform.opacity);
  const [isAspectLocked, setIsAspectLocked] = useState(true);

  useEffect(() => {
    setX(clip.transform.x);
    setY(clip.transform.y);
    setWidth(clip.transform.width);
    setHeight(clip.transform.height);
    setRotation(clip.transform.rotation);
    setOpacity(clip.transform.opacity);
  }, [clip.transform]);

  const commitTransform = (updates: Partial<TimelineClip['transform']>) => {
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        ...updates,
      },
    });
  };

  const handleFit = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: 'contain',
    });
  };

  const handleFill = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: 'cover',
    });
  };

  const handleFlipH = () => {
    commitTransform({ scaleX: clip.transform.scaleX === -1 ? 1 : -1 });
  };

  const handleFlipV = () => {
    commitTransform({ scaleY: clip.transform.scaleY === -1 ? 1 : -1 });
  };

  const handleReset = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      fitMode: 'contain',
    });
  };

  // Keyboard arrow key increment helper
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentVal: number,
    setter: (v: number) => void,
    fieldKey: keyof TimelineClip['transform']
  ) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const delta = e.key === 'ArrowUp' ? step : -step;
      const newVal = Math.round((currentVal + delta) * 10) / 10;
      setter(newVal);
      commitTransform({ [fieldKey]: newVal });
    }
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Quick Layout Actions (Fit, Fill, Crop, Flips) */}
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" onClick={handleFit} className="gap-1 text-xs">
          <Maximize2 className="h-3 w-3" /> Fit
        </Button>
        <Button size="sm" variant="secondary" onClick={handleFill} className="gap-1 text-xs">
          Fill
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setActiveTool('crop')} className="gap-1 text-xs">
          <Crop className="h-3 w-3" /> Crop
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={handleFlipH} className="gap-1 text-xs">
          <FlipHorizontal className="h-3 w-3" /> Flip H
        </Button>
        <Button size="sm" variant="secondary" onClick={handleFlipV} className="gap-1 text-xs">
          <FlipVertical className="h-3 w-3" /> Flip V
        </Button>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Position & Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">X Position (px)</label>
          <Input
            type="number"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value) || 0)}
            onBlur={() => commitTransform({ x })}
            onKeyDown={(e) => handleKeyDown(e, x, setX, 'x')}
            className="h-8 text-xs font-mono"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Y Position (px)</label>
          <Input
            type="number"
            value={y}
            onChange={(e) => setY(parseFloat(e.target.value) || 0)}
            onBlur={() => commitTransform({ y })}
            onKeyDown={(e) => handleKeyDown(e, y, setY, 'y')}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Width (px)</label>
            <button
              type="button"
              onClick={() => setIsAspectLocked(!isAspectLocked)}
              className="text-[#9298A3] hover:text-[#F4F5F7]"
              title={isAspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {isAspectLocked ? <Lock className="h-3 w-3 text-[#FF5A36]" /> : <Unlock className="h-3 w-3" />}
            </button>
          </div>
          <Input
            type="number"
            value={width}
            onChange={(e) => {
              const newW = parseFloat(e.target.value) || 20;
              setWidth(newW);
              if (isAspectLocked && clip.transform.width > 0) {
                const ratio = clip.transform.height / clip.transform.width;
                setHeight(Math.round(newW * ratio));
              }
            }}
            onBlur={() => commitTransform({ width, height })}
            onKeyDown={(e) => handleKeyDown(e, width, setWidth, 'width')}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Height (px)</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => {
              const newH = parseFloat(e.target.value) || 20;
              setHeight(newH);
              if (isAspectLocked && clip.transform.height > 0) {
                const ratio = clip.transform.width / clip.transform.height;
                setWidth(Math.round(newH * ratio));
              }
            }}
            onBlur={() => commitTransform({ width, height })}
            onKeyDown={(e) => handleKeyDown(e, height, setHeight, 'height')}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Rotation & Opacity */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Rotation (°)</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{rotation}°</span>
          </div>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            onValueChange={(val) => {
              setRotation(val);
              commitTransform({ rotation: val });
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#9298A3]">Opacity</label>
            <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(opacity * 100)}%</span>
          </div>
          <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => {
              setOpacity(val);
              commitTransform({ opacity: val });
            }}
          />
        </div>
      </div>

      {/* Reset Action */}
      <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 gap-1.5 text-xs text-[#9298A3] hover:text-[#E45858]">
        <RotateCcw className="h-3.5 w-3.5" /> Reset Transform
      </Button>
    </div>
  );
}
