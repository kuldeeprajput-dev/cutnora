"use client";

import React from "react";
import { Gauge, Timer, RotateCcw } from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

export interface SpeedTabProps {
  clip: TimelineClip;
}

const SPEED_PRESETS = [
  { speed: 0.25, label: "0.25×", sub: "Super Slow" },
  { speed: 0.5, label: "0.5×", sub: "Slow Mo" },
  { speed: 0.75, label: "0.75×", sub: "Gentle Slow" },
  { speed: 1.0, label: "1.0×", sub: "Normal" },
  { speed: 1.25, label: "1.25×", sub: "Brisk" },
  { speed: 1.5, label: "1.5×", sub: "Fast" },
  { speed: 2.0, label: "2.0×", sub: "Double" },
  { speed: 4.0, label: "4.0×", sub: "Hyperlapse" },
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
    <div className="flex select-none flex-col gap-3 pb-2 text-studio-fg">
      {/* 1. Quick Playback Speed Presets */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-brand" /> Playback Speed
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Speed up or slow down video & audio playback
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {currentSpeed !== 1.0 && (
              <button
                type="button"
                onClick={() => changeSpeed(1.0)}
                className="text-[10px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
              {currentSpeed.toFixed(2)}×
            </span>
          </div>
        </div>

        {/* Speed Preset Chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {SPEED_PRESETS.map((p) => {
            const isActive = Math.abs(currentSpeed - p.speed) < 0.03;
            return (
              <button
                key={p.speed}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeSpeed(p.speed)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none",
                  isActive
                    ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-bold",
                    isActive ? "text-brand" : "text-studio-fg",
                  )}
                >
                  {p.label}
                </span>
                <span
                  className={cn(
                    "text-[8px] mt-0.5 font-medium truncate",
                    isActive ? "text-brand/80" : "text-studio-muted",
                  )}
                >
                  {p.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Speed Slider */}
        <div className="pt-1">
          <Slider
            aria-label="Speed multiplier slider"
            value={currentSpeed}
            min={0.1}
            max={4.0}
            step={0.05}
            onValueChange={changeSpeed}
          />
        </div>
      </section>

      {/* 2. Duration & Timeline Impact */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-2.5">
        <div>
          <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-brand" /> Duration Impact
          </h3>
          <p className="mt-0.5 text-[10px] text-studio-muted">
            How speed affects clip duration on your timeline
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-studio-border bg-studio-panel/50 p-2.5">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-studio-muted">
              Source Duration
            </span>
            <span className="mt-1 block font-mono text-xs font-bold text-studio-fg">
              {formatTime(clip.sourceDuration)}
            </span>
            <span className="text-[9px] text-studio-muted mt-0.5 block font-mono">
              {clip.sourceDuration.toFixed(2)}s raw
            </span>
          </div>

          <div className="rounded-lg border border-brand/40 bg-brand/10 p-2.5">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-brand">
              Timeline Duration
            </span>
            <span className="mt-1 block font-mono text-xs font-bold text-brand">
              {formatTime(clip.timelineDuration)}
            </span>
            <span className="text-[9px] text-brand/80 mt-0.5 block font-mono">
              {currentSpeed === 1
                ? "100% (Realtime)"
                : currentSpeed > 1
                  ? `${Math.round((1 / currentSpeed) * 100)}% shorter`
                  : `${Math.round((1 / currentSpeed) * 100)}% longer`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-studio-border bg-studio-panel/30 px-3 py-2">
          <span className="text-[10px] text-studio-muted">
            Effective frame rate
          </span>
          <span className="font-mono text-[11px] font-semibold text-studio-fg">
            ~{estimatedEffectiveFps} fps
          </span>
        </div>
      </section>

      {/* 3. Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => changeSpeed(1.0)}
        className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Speed to 1.0× Normal
      </Button>
    </div>
  );
}
