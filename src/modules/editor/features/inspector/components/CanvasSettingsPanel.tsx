import React from 'react';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Slider } from '@/shared/components/ui/Slider';
import { Volume2, RotateCcw } from 'lucide-react';
import type { AspectRatio } from '@/modules/projects/types';

export function CanvasSettingsPanel() {
  const { currentProject, updateProjectSettings } = useProjectStore();

  if (!currentProject) return null;

  const settings = currentProject.settings;

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

    updateProjectSettings({ width: w, height: h, aspectRatio: ratio });
  };

  const handleResetCanvasSettings = () => {
    updateProjectSettings({
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      fps: 30,
      backgroundColor: '#000000',
      masterVolume: 1.0,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-studio-fg select-none">
      {/* Aspect Ratio Presets */}
      <div>
        <label className="text-xs font-medium text-studio-muted block mb-2">Aspect Ratio Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => {
            const isActive = settings.aspectRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => handleRatioChange(ratio)}
                className={`flex h-9 items-center justify-center rounded-lg text-xs transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white font-bold shadow-sm'
                    : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
                }`}
              >
                {ratio}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Resolution Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Width (px)</label>
          <Input
            type="number"
            value={settings.width}
            onChange={(e) => updateProjectSettings({ width: parseInt(e.target.value, 10) || 1920 })}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Height (px)</label>
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
        <label className="text-xs font-medium text-studio-muted block mb-1.5">Project Frame Rate (FPS)</label>
        <Select
          value={settings.fps}
          onChange={(e) => updateProjectSettings({ fps: parseInt(e.target.value, 10) || 30 })}
          className="h-8 text-xs border-studio-border cursor-pointer"
        >
          <option value="24">24 FPS (Cinematic)</option>
          <option value="30">30 FPS (Standard Video)</option>
          <option value="60">60 FPS (Smooth High-FPS)</option>
        </Select>
      </div>

      {/* Background Color */}
      <div>
        <label className="text-xs font-medium text-studio-muted block mb-1.5">Canvas Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColor || '#000000'}
            onChange={(e) => updateProjectSettings({ backgroundColor: e.target.value })}
            className="h-8 w-12 rounded cursor-pointer border border-studio-border bg-studio-panel p-0.5"
          />
          <span className="font-mono text-xs text-studio-muted">{settings.backgroundColor}</span>
        </div>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Master Volume */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-studio-muted flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-mkt-success" /> Master Volume
          </label>
          <span className="font-mono text-xs text-studio-fg">{Math.round(settings.masterVolume * 100)}%</span>
        </div>
        <Slider
          value={settings.masterVolume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(val) => updateProjectSettings({ masterVolume: val })}
        />
      </div>

      <div className="h-px bg-studio-border mt-1" />

      {/* Reset Canvas Settings Action */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleResetCanvasSettings}
        className="w-full h-8 gap-1.5 text-xs text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset Canvas Settings</span>
      </Button>
    </div>
  );
}
