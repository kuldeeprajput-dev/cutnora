'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Slider } from '@/shared/components/ui/Slider';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Volume2, AlertTriangle } from 'lucide-react';
import type { AspectRatio } from '@/modules/projects/types';

export function CanvasSettingsPanel() {
  const { currentProject, updateProjectSettings } = useProjectStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingResolution, setPendingResolution] = useState<{ width: number; height: number } | null>(null);

  if (!currentProject) return null;

  const settings = currentProject.settings;
  const hasClips = currentProject.tracks.some((t) => t.clips.length > 0);

  const handleRatioChange = (ratio: AspectRatio) => {
    let w = 1920;
    let h = 1080;
    if (ratio === '9:16') {
      w = 1080;
      h = 1920;
    } else if (ratio === '1:1') {
      w = 1080;
      h = 1080;
    } else if (ratio === '4:5') {
      w = 1080;
      h = 1350;
    }

    if (hasClips) {
      setPendingResolution({ width: w, height: h });
      setIsConfirmOpen(true);
    } else {
      updateProjectSettings({ width: w, height: h, aspectRatio: ratio });
    }
  };

  const confirmResolutionChange = () => {
    if (pendingResolution) {
      updateProjectSettings({
        width: pendingResolution.width,
        height: pendingResolution.height,
      });
      setPendingResolution(null);
    }
    setIsConfirmOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 text-[#F4F5F7]">
      {/* Aspect Ratio Presets */}
      <div>
        <label className="text-xs font-medium text-[#9298A3] block mb-2">Aspect Ratio Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => (
            <Button
              key={ratio}
              size="sm"
              variant={settings.aspectRatio === ratio ? 'selection' : 'secondary'}
              onClick={() => handleRatioChange(ratio)}
            >
              {ratio}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Resolution Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Width (px)</label>
          <Input
            type="number"
            value={settings.width}
            onChange={(e) => updateProjectSettings({ width: parseInt(e.target.value, 10) || 1920 })}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Height (px)</label>
          <Input
            type="number"
            value={settings.height}
            onChange={(e) => updateProjectSettings({ height: parseInt(e.target.value, 10) || 1080 })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Frame Rate */}
      <div>
        <label className="text-xs font-medium text-[#9298A3] block mb-1.5">Project Frame Rate (FPS)</label>
        <Select
          value={settings.fps}
          onChange={(e) => updateProjectSettings({ fps: parseInt(e.target.value, 10) || 30 })}
          className="h-8 text-xs border-[#2B2F38]"
        >
          <option value="24">24 FPS (Cinematic)</option>
          <option value="30">30 FPS (Standard Video)</option>
          <option value="60">60 FPS (Smooth High-FPS)</option>
        </Select>
      </div>

      {/* Background Color */}
      <div>
        <label className="text-xs font-medium text-[#9298A3] block mb-1.5">Canvas Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColor || '#000000'}
            onChange={(e) => updateProjectSettings({ backgroundColor: e.target.value })}
            className="h-8 w-12 rounded cursor-pointer border border-[#2B2F38] bg-[#171A20] p-0.5"
          />
          <span className="font-mono text-xs text-[#9298A3]">{settings.backgroundColor}</span>
        </div>
      </div>

      <div className="h-px bg-[#2B2F38]" />

      {/* Master Volume */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-[#9298A3] flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-[#248A5A]" /> Master Volume
          </label>
          <span className="font-mono text-xs text-[#F4F5F7]">{Math.round(settings.masterVolume * 100)}%</span>
        </div>
        <Slider
          value={settings.masterVolume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(val) => updateProjectSettings({ masterVolume: val })}
        />
      </div>

      {/* Confirmation Dialog on Resolution Resize */}
      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Change Project Dimensions?">
        <div className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-6 w-6 text-[#F2C94C] shrink-0" />
          <div className="text-xs text-[#9298A3]">
            Changing resolution will scale the project canvas dimensions. Existing clips on the timeline may require position adjustments.
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#2B2F38]">
          <Button size="sm" variant="ghost" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={confirmResolutionChange}>
            Confirm Resize
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
