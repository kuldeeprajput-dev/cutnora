'use client';

import React, { useState, useEffect } from 'react';
import type { TimelineClip, CropSettings } from '@/modules/editor/types';
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
  const { activeTool, setActiveTool } = useEditorUIStore();

  const [x, setX] = useState(clip.transform.x);
  const [y, setY] = useState(clip.transform.y);
  const [width, setWidth] = useState(clip.transform.width);
  const [height, setHeight] = useState(clip.transform.height);
  const [rotation, setRotation] = useState(clip.transform.rotation);
  const [opacity, setOpacity] = useState(clip.transform.opacity);
  const [isAspectLocked, setIsAspectLocked] = useState(true);

  const isCropping = activeTool === 'crop';
  const crop: CropSettings = clip.transform.crop || { top: 0, right: 0, bottom: 0, left: 0 };
  const hasActiveCrop = crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0;

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

  const handleToggleCrop = () => {
    setActiveTool(isCropping ? 'canvas' : 'crop');
  };

  const handleCropChange = (side: keyof CropSettings, value: number) => {
    const newCrop = {
      ...crop,
      [side]: Math.max(0, Math.min(80, value)),
    };
    commitTransform({ crop: newCrop });
  };

  const handleResetCrop = () => {
    commitTransform({ crop: { top: 0, right: 0, bottom: 0, left: 0 } });
    if (isCropping) setActiveTool('canvas');
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
    updateClip(clip.id, {
      transform: {
        x: 0,
        y: 0,
        width: projW,
        height: projH,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        crop: { top: 0, right: 0, bottom: 0, left: 0 },
        fitMode: 'contain',
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    });

    if (isCropping) setActiveTool('canvas');
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
    <div className="flex flex-col gap-4 text-studio-fg select-none">
      {/* Quick Layout Actions (Fit, Fill, Crop, Flips) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleFit}
          className={`flex h-8 items-center justify-center gap-1 rounded-lg text-xs transition-all select-none cursor-pointer ${
            clip.transform.fitMode === 'contain'
              ? 'bg-brand text-white font-bold shadow-sm'
              : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
          }`}
        >
          <Maximize2 className="h-3 w-3" /> Fit
        </button>
        <button
          type="button"
          onClick={handleFill}
          className={`flex h-8 items-center justify-center gap-1 rounded-lg text-xs transition-all select-none cursor-pointer ${
            clip.transform.fitMode === 'cover'
              ? 'bg-brand text-white font-bold shadow-sm'
              : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
          }`}
        >
          Fill
        </button>
        <button
          type="button"
          onClick={handleToggleCrop}
          className={`flex h-8 items-center justify-center gap-1 rounded-lg text-xs transition-all select-none cursor-pointer ${
            isCropping || hasActiveCrop
              ? 'bg-brand text-white font-bold shadow-sm'
              : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
          }`}
        >
          <Crop className="h-3 w-3" /> {isCropping ? 'Cropping' : 'Crop'}
        </button>
      </div>

      {/* Crop Controls Section (Visible when cropping or crop exists) */}
      {(isCropping || hasActiveCrop) && (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand flex items-center gap-1.5">
              <Crop className="h-3.5 w-3.5" /> Clip Crop Offsets (%)
            </span>
            {hasActiveCrop && (
              <button
                type="button"
                onClick={handleResetCrop}
                className="text-[10px] text-studio-muted hover:text-brand underline cursor-pointer"
              >
                Reset Crop
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Top</span>
                <span className="font-mono">{crop.top}%</span>
              </div>
              <Slider
                value={crop.top}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) => handleCropChange('top', val)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Bottom</span>
                <span className="font-mono">{crop.bottom}%</span>
              </div>
              <Slider
                value={crop.bottom}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) => handleCropChange('bottom', val)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Left</span>
                <span className="font-mono">{crop.left}%</span>
              </div>
              <Slider
                value={crop.left}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) => handleCropChange('left', val)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Right</span>
                <span className="font-mono">{crop.right}%</span>
              </div>
              <Slider
                value={crop.right}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) => handleCropChange('right', val)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleFlipH}
          className={`flex h-8 items-center justify-center gap-1 rounded-lg text-xs transition-all select-none cursor-pointer ${
            clip.transform.scaleX === -1
              ? 'bg-brand text-white font-bold shadow-sm'
              : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
          }`}
        >
          <FlipHorizontal className="h-3 w-3" /> Flip H
        </button>
        <button
          type="button"
          onClick={handleFlipV}
          className={`flex h-8 items-center justify-center gap-1 rounded-lg text-xs transition-all select-none cursor-pointer ${
            clip.transform.scaleY === -1
              ? 'bg-brand text-white font-bold shadow-sm'
              : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
          }`}
        >
          <FlipVertical className="h-3 w-3" /> Flip V
        </button>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Position & Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">X Position (px)</label>
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
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Y Position (px)</label>
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
            <label className="text-[11px] font-medium text-studio-muted">Width (px)</label>
            <button
              type="button"
              onClick={() => setIsAspectLocked(!isAspectLocked)}
              className="text-studio-muted hover:text-studio-fg cursor-pointer"
              title={isAspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {isAspectLocked ? <Lock className="h-3 w-3 text-brand" /> : <Unlock className="h-3 w-3" />}
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
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Height (px)</label>
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

      <div className="h-px bg-studio-border" />

      {/* Rotation & Opacity */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-studio-muted">Rotation (°)</label>
            <span className="font-mono text-xs text-studio-fg">{rotation}°</span>
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
            <label className="text-[11px] font-medium text-studio-muted">Opacity</label>
            <span className="font-mono text-xs text-studio-fg">{Math.round(opacity * 100)}%</span>
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
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReset}
        className="h-8 gap-1.5 text-xs text-studio-muted hover:text-destructive cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Transform & Properties
      </Button>
    </div>
  );
}
