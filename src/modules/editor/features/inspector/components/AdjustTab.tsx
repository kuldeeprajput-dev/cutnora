"use client";

import React from "react";
import {
  Palette,
  Sparkles,
  Sun,
  Contrast,
  Droplets,
  RotateCcw,
  Sliders,
  Check,
} from "lucide-react";
import type { Adjustments, TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";

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

interface ColorFilterPreset {
  id: string;
  name: string;
  subtitle: string;
  values: Adjustments;
}

const FILTER_PRESETS: ColorFilterPreset[] = [
  {
    id: "normal",
    name: "Original",
    subtitle: "Standard natural",
    values: {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    },
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    subtitle: "Punchy & bright",
    values: {
      brightness: 1.05,
      contrast: 1.2,
      saturation: 1.35,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    },
  },
  {
    id: "warm",
    name: "Warm Glow",
    subtitle: "Golden sunset",
    values: {
      brightness: 1.05,
      contrast: 1.1,
      saturation: 1.15,
      blur: 0,
      grayscale: 0,
      sepia: 0.35,
    },
  },
  {
    id: "cool",
    name: "Cool Drama",
    subtitle: "Cinematic moody",
    values: {
      brightness: 0.95,
      contrast: 1.25,
      saturation: 0.85,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    },
  },
  {
    id: "bw",
    name: "Classic B&W",
    subtitle: "Monochrome film",
    values: {
      brightness: 1.05,
      contrast: 1.25,
      saturation: 0,
      blur: 0,
      grayscale: 1,
      sepia: 0,
    },
  },
  {
    id: "vintage",
    name: "Vintage Film",
    subtitle: "Nostalgic retro",
    values: {
      brightness: 0.95,
      contrast: 1.15,
      saturation: 0.9,
      blur: 0,
      grayscale: 0,
      sepia: 0.6,
    },
  },
];

export function AdjustTab({ clip }: AdjustTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const adjustments = clip.adjustments || defaultAdjustments;

  const updateAdjustment = (key: keyof Adjustments, value: number) => {
    updateClip(clip.id, {
      adjustments: {
        ...adjustments,
        [key]: value,
      },
    });
  };

  const applyFilterPreset = (preset: ColorFilterPreset) => {
    updateClip(clip.id, {
      adjustments: { ...preset.values },
    });
  };

  const resetAdjustment = (key: keyof Adjustments) => {
    updateAdjustment(key, defaultAdjustments[key]);
  };

  const resetAll = () => {
    updateClip(clip.id, {
      adjustments: { ...defaultAdjustments },
    });
  };

  // Determine active preset (if current adjustments match)
  const activePreset = FILTER_PRESETS.find((p) => {
    return (
      Math.abs(adjustments.brightness - p.values.brightness) < 0.02 &&
      Math.abs(adjustments.contrast - p.values.contrast) < 0.02 &&
      Math.abs(adjustments.saturation - p.values.saturation) < 0.02 &&
      Math.abs(adjustments.grayscale - p.values.grayscale) < 0.02 &&
      Math.abs(adjustments.sepia - p.values.sepia) < 0.02 &&
      adjustments.blur === p.values.blur
    );
  });

  return (
    <div className="flex flex-col gap-3 pb-2 text-studio-fg">
      {/* 1. 1-Click Color Filter Looks */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> 1-Click Color Looks
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Choose an instant artistic color filter
            </p>
          </div>
          {activePreset?.id !== "normal" && (
            <button
              type="button"
              onClick={resetAll}
              className="text-[10px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Filter Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FILTER_PRESETS.map((preset) => {
            const isActive = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyFilterPreset(preset)}
                className={cn(
                  "relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer select-none",
                  isActive
                    ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      isActive ? "text-brand" : "text-studio-fg",
                    )}
                  >
                    {preset.name}
                  </span>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-brand shrink-0 ml-1" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] mt-1 truncate",
                    isActive ? "text-brand/80 font-medium" : "text-studio-muted",
                  )}
                >
                  {preset.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Tone & Lighting (Brightness, Contrast, Saturation) */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3.5">
        <div>
          <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-brand" /> Tone & Lighting
          </h3>
          <p className="mt-0.5 text-[10px] text-studio-muted">
            Fine-tune brightness, contrast, and color vibrance
          </p>
        </div>

        {/* Brightness Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg flex items-center gap-1.5">
              <Sun className="h-3 w-3 text-studio-muted" /> Brightness
            </span>
            <div className="flex items-center gap-1.5">
              {adjustments.brightness !== 1 && (
                <button
                  type="button"
                  onClick={() => resetAdjustment("brightness")}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                  title="Reset brightness"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {Math.round(adjustments.brightness * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={adjustments.brightness}
            min={0}
            max={2}
            step={0.05}
            onValueChange={(val) => updateAdjustment("brightness", val)}
          />
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("brightness", 0.8)}
              className="h-6 text-[10px]"
            >
              Darker (80%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("brightness", 1)}
              className="h-6 text-[10px]"
            >
              Normal (100%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("brightness", 1.2)}
              className="h-6 text-[10px]"
            >
              Brighter (120%)
            </Button>
          </div>
        </div>

        {/* Contrast Control */}
        <div className="space-y-1.5 pt-1 border-t border-studio-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg flex items-center gap-1.5">
              <Contrast className="h-3 w-3 text-studio-muted" /> Contrast
            </span>
            <div className="flex items-center gap-1.5">
              {adjustments.contrast !== 1 && (
                <button
                  type="button"
                  onClick={() => resetAdjustment("contrast")}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                  title="Reset contrast"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {Math.round(adjustments.contrast * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={adjustments.contrast}
            min={0}
            max={2}
            step={0.05}
            onValueChange={(val) => updateAdjustment("contrast", val)}
          />
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("contrast", 0.85)}
              className="h-6 text-[10px]"
            >
              Soft (85%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("contrast", 1)}
              className="h-6 text-[10px]"
            >
              Normal (100%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("contrast", 1.3)}
              className="h-6 text-[10px]"
            >
              High Pop (130%)
            </Button>
          </div>
        </div>

        {/* Saturation Control */}
        <div className="space-y-1.5 pt-1 border-t border-studio-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg flex items-center gap-1.5">
              <Droplets className="h-3 w-3 text-studio-muted" /> Color Saturation
            </span>
            <div className="flex items-center gap-1.5">
              {adjustments.saturation !== 1 && (
                <button
                  type="button"
                  onClick={() => resetAdjustment("saturation")}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                  title="Reset saturation"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {Math.round(adjustments.saturation * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={adjustments.saturation}
            min={0}
            max={2}
            step={0.05}
            onValueChange={(val) => updateAdjustment("saturation", val)}
          />
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("saturation", 0.5)}
              className="h-6 text-[10px]"
            >
              Muted (50%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("saturation", 1)}
              className="h-6 text-[10px]"
            >
              Natural (100%)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateAdjustment("saturation", 1.4)}
              className="h-6 text-[10px]"
            >
              Vibrant (140%)
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Visual Effects (Blur & Stylization) */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3.5">
        <div>
          <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-brand" /> Visual Effects & Blur
          </h3>
          <p className="mt-0.5 text-[10px] text-studio-muted">
            Add softening blur, black & white, or vintage sepia
          </p>
        </div>

        {/* Blur Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg">
              Softness & Blur
            </span>
            <div className="flex items-center gap-1.5">
              {adjustments.blur > 0 && (
                <button
                  type="button"
                  onClick={() => resetAdjustment("blur")}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {adjustments.blur}px
              </span>
            </div>
          </div>
          <Slider
            value={adjustments.blur}
            min={0}
            max={20}
            step={1}
            onValueChange={(val) => updateAdjustment("blur", val)}
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: "Off", val: 0 },
              { label: "Soft", val: 3 },
              { label: "Medium", val: 8 },
              { label: "Heavy", val: 15 },
            ].map((b) => (
              <Button
                key={b.label}
                size="sm"
                variant="secondary"
                onClick={() => updateAdjustment("blur", b.val)}
                className={cn(
                  "h-6 text-[10px]",
                  adjustments.blur === b.val &&
                    "border-brand/40 bg-brand/15 text-brand font-semibold",
                )}
              >
                {b.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Tints: Black & White and Sepia */}
        <div className="pt-2 border-t border-studio-border/50 space-y-2.5">
          <span className="text-[11px] font-medium text-studio-fg block">
            Special Color Style
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                updateClip(clip.id, {
                  adjustments: {
                    ...adjustments,
                    grayscale: 0,
                    sepia: 0,
                  },
                });
              }}
              className={cn(
                "p-2 rounded-lg border text-center transition-all cursor-pointer select-none",
                adjustments.grayscale === 0 && adjustments.sepia === 0
                  ? "border-brand bg-brand/15 text-brand font-bold shadow-xs ring-1 ring-brand/50"
                  : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg",
              )}
            >
              <span className="text-[11px] font-bold block">Full Color</span>
              <span className="text-[9px] text-studio-muted mt-0.5 block">
                Standard
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                updateClip(clip.id, {
                  adjustments: {
                    ...adjustments,
                    grayscale: 1,
                    sepia: 0,
                  },
                });
              }}
              className={cn(
                "p-2 rounded-lg border text-center transition-all cursor-pointer select-none",
                adjustments.grayscale > 0
                  ? "border-brand bg-brand/15 text-brand font-bold shadow-xs ring-1 ring-brand/50"
                  : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg",
              )}
            >
              <span className="text-[11px] font-bold block">B & W</span>
              <span className="text-[9px] text-studio-muted mt-0.5 block">
                Grayscale
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                updateClip(clip.id, {
                  adjustments: {
                    ...adjustments,
                    grayscale: 0,
                    sepia: 0.6,
                  },
                });
              }}
              className={cn(
                "p-2 rounded-lg border text-center transition-all cursor-pointer select-none",
                adjustments.sepia > 0
                  ? "border-brand bg-brand/15 text-brand font-bold shadow-xs ring-1 ring-brand/50"
                  : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg",
              )}
            >
              <span className="text-[11px] font-bold block">Sepia</span>
              <span className="text-[9px] text-studio-muted mt-0.5 block">
                Vintage
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={resetAll}
        className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset All Color Adjustments
      </Button>
    </div>
  );
}
