"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Sun,
  Contrast,
  Droplets,
  RotateCcw,
  Sliders,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Adjustments, TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
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
    name: "Warm Gold",
    subtitle: "Cozy sunset tone",
    values: {
      brightness: 1.02,
      contrast: 1.05,
      saturation: 1.15,
      blur: 0,
      grayscale: 0,
      sepia: 0.25,
    },
  },
  {
    id: "cool",
    name: "Cool Crisp",
    subtitle: "Fresh & sharp",
    values: {
      brightness: 0.98,
      contrast: 1.15,
      saturation: 0.9,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    },
  },
  {
    id: "cinema",
    name: "Moody Cinema",
    subtitle: "Dramatic shadow look",
    values: {
      brightness: 0.92,
      contrast: 1.3,
      saturation: 0.85,
      blur: 0,
      grayscale: 0,
      sepia: 0.1,
    },
  },
  {
    id: "bw",
    name: "Pure B&W",
    subtitle: "Classic monochrome",
    values: {
      brightness: 1,
      contrast: 1.25,
      saturation: 0,
      blur: 0,
      grayscale: 1,
      sepia: 0,
    },
  },
  {
    id: "vintage",
    name: "Vintage Sepia",
    subtitle: "Retro nostalgic warmth",
    values: {
      brightness: 0.95,
      contrast: 0.95,
      saturation: 0.7,
      blur: 0,
      grayscale: 0,
      sepia: 0.75,
    },
  },
  {
    id: "dreamy",
    name: "Dreamy Soft",
    subtitle: "Ethereal glow",
    values: {
      brightness: 1.1,
      contrast: 0.9,
      saturation: 1.1,
      blur: 3,
      grayscale: 0,
      sepia: 0.05,
    },
  },
];

export function AdjustTab({ clip }: AdjustTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const adjustments = clip.adjustments || defaultAdjustments;
  const [presetsExpanded, setPresetsExpanded] = useState(false);

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
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      {/* Row 1: Color Look / Presets */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-white/50 font-medium">Color look</span>
          <button
            type="button"
            onClick={() => setPresetsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <span>{activePreset?.name || "Custom"}</span>
            {presetsExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            )}
          </button>
        </div>

        {/* Presets Grid when expanded */}
        {presetsExpanded && (
          <div className="mt-2 grid grid-cols-4 gap-1.5 pt-1">
            {FILTER_PRESETS.map((preset) => {
              const isActive = activePreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyFilterPreset(preset)}
                  className={cn(
                    "py-1.5 px-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer truncate",
                    isActive
                      ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                  )}
                  title={`${preset.name} (${preset.subtitle})`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 2: Brightness */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 font-medium">Brightness</span>
          <div className="flex items-center gap-1.5">
            {adjustments.brightness !== 1 && (
              <button
                type="button"
                onClick={() => resetAdjustment("brightness")}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs text-white/90">
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
        <div className="grid grid-cols-3 gap-1 pt-1.5">
          {[
            { label: "Dark (80%)", val: 0.8 },
            { label: "Normal (100%)", val: 1 },
            { label: "Bright (120%)", val: 1.2 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => updateAdjustment("brightness", item.val)}
              className={cn(
                "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                Math.abs(adjustments.brightness - item.val) < 0.03
                  ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Contrast */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 font-medium">Contrast</span>
          <div className="flex items-center gap-1.5">
            {adjustments.contrast !== 1 && (
              <button
                type="button"
                onClick={() => resetAdjustment("contrast")}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs text-white/90">
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
        <div className="grid grid-cols-3 gap-1 pt-1.5">
          {[
            { label: "Soft (85%)", val: 0.85 },
            { label: "Normal (100%)", val: 1 },
            { label: "Pop (130%)", val: 1.3 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => updateAdjustment("contrast", item.val)}
              className={cn(
                "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                Math.abs(adjustments.contrast - item.val) < 0.03
                  ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: Saturation */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 font-medium">Saturation</span>
          <div className="flex items-center gap-1.5">
            {adjustments.saturation !== 1 && (
              <button
                type="button"
                onClick={() => resetAdjustment("saturation")}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs text-white/90">
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
        <div className="grid grid-cols-3 gap-1 pt-1.5">
          {[
            { label: "Muted (50%)", val: 0.5 },
            { label: "Normal (100%)", val: 1 },
            { label: "Vibrant (140%)", val: 1.4 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => updateAdjustment("saturation", item.val)}
              className={cn(
                "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                Math.abs(adjustments.saturation - item.val) < 0.03
                  ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 5: Blur */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 font-medium">Blur</span>
          <div className="flex items-center gap-1.5">
            {adjustments.blur > 0 && (
              <button
                type="button"
                onClick={() => resetAdjustment("blur")}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs text-white/90">{adjustments.blur}px</span>
          </div>
        </div>
        <Slider
          value={adjustments.blur}
          min={0}
          max={20}
          step={1}
          onValueChange={(val) => updateAdjustment("blur", val)}
        />
        <div className="grid grid-cols-4 gap-1 pt-1.5">
          {[
            { label: "Off", val: 0 },
            { label: "Soft", val: 3 },
            { label: "Med", val: 8 },
            { label: "Heavy", val: 15 },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => updateAdjustment("blur", b.val)}
              className={cn(
                "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                adjustments.blur === b.val
                  ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 6: Color Style (Full, B&W, Sepia) */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 font-medium">Color mode</span>
          <span className="font-mono text-xs text-white/80">
            {adjustments.grayscale > 0
              ? "B&W"
              : adjustments.sepia > 0
                ? "Sepia"
                : "Full Color"}
          </span>
        </div>
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
              "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
              adjustments.grayscale === 0 && adjustments.sepia === 0
                ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
            )}
          >
            Full Color
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
              "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
              adjustments.grayscale > 0
                ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
            )}
          >
            B & W
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
              "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
              adjustments.sepia > 0
                ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
            )}
          >
            Sepia
          </button>
        </div>
      </div>

      {/* Row 7: Reset Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={resetAll}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-white/40" /> Reset Adjustments
        </button>
      </div>
    </div>
  );
}
