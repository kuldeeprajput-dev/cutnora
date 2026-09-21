"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

export interface SpeedTabProps {
  clip: TimelineClip;
}

const SPEED_PRESETS = [
  { speed: 0.25, label: "0.25×", sub: "Super Slow" },
  { speed: 0.5, label: "0.5×", sub: "Slow Mo" },
  { speed: 0.75, label: "0.75×", sub: "Gentle" },
  { speed: 1.0, label: "1.0×", sub: "Normal" },
  { speed: 1.25, label: "1.25×", sub: "Brisk" },
  { speed: 1.5, label: "1.5×", sub: "Fast" },
  { speed: 2.0, label: "2.0×", sub: "Double" },
  { speed: 4.0, label: "4.0×", sub: "Hyper" },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function SpeedTab({ clip }: SpeedTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const currentProject = useProjectStore((state) => state.currentProject);
  const projectFps = currentProject?.settings.fps || 30;

  const currentSpeed = clip.speed ?? 1.0;

  const changeSpeed = (newSpeed: number) => {
    const validSpeed = Math.min(4, Math.max(0.1, Number(newSpeed.toFixed(2))));
    const newTimelineDuration = clip.sourceDuration / validSpeed;

    updateClip(clip.id, {
      speed: validSpeed,
      timelineDuration: Math.max(0.1, newTimelineDuration),
    });
  };

  const estimatedEffectiveFps = Math.round(projectFps * currentSpeed);

  return (
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      {/* Row 1: Playback Speed */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 font-medium">Playback speed</span>
          <div className="flex items-center gap-1.5">
            {currentSpeed !== 1.0 && (
              <button
                type="button"
                onClick={() => changeSpeed(1.0)}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer transition-colors"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs text-white/90">
              {currentSpeed.toFixed(2)}×
            </span>
          </div>
        </div>

        {/* Speed Slider */}
        <Slider
          aria-label="Speed multiplier slider"
          value={currentSpeed}
          min={0.1}
          max={4.0}
          step={0.05}
          onValueChange={changeSpeed}
        />

        {/* Speed Preset Pills */}
        <div className="grid grid-cols-4 gap-1 pt-2">
          {SPEED_PRESETS.map((p) => {
            const isActive = Math.abs(currentSpeed - p.speed) < 0.03;
            return (
              <button
                key={p.speed}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeSpeed(p.speed)}
                className={cn(
                  "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer border",
                  isActive
                    ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                )}
                title={p.sub}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Duration Impact */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 font-medium">Duration impact</span>
          <span className="font-mono text-[11px] text-white/40">
            ~{estimatedEffectiveFps} fps
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-white/40">
              Source
            </span>
            <span className="mt-0.5 block font-mono text-xs font-semibold text-white/90">
              {formatTime(clip.sourceDuration)}
            </span>
            <span className="text-[9px] text-white/40 mt-0.5 block font-mono">
              {clip.sourceDuration.toFixed(2)}s raw
            </span>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-white/40">
              Timeline
            </span>
            <span className="mt-0.5 block font-mono text-xs font-semibold text-white/90">
              {formatTime(clip.timelineDuration)}
            </span>
            <span className="text-[9px] text-white/40 mt-0.5 block font-mono">
              {currentSpeed === 1
                ? "Realtime"
                : currentSpeed > 1
                  ? `${Math.round((1 / currentSpeed) * 100)}% shorter`
                  : `${Math.round((1 / currentSpeed) * 100)}% longer`}
            </span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => changeSpeed(1.0)}
        className="mt-3 h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-medium text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5 text-white/40" /> Reset Speed (1.0×)
      </button>
    </div>
  );
}
