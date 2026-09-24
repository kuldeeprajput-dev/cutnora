"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

import { useInspectorExpanded } from "../hooks/useInspectorAccordion";

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

  const [speedExpanded, toggleSpeedExpanded] = useInspectorExpanded("speed.playbackSpeed", true);

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

  const activeSpeedPreset = SPEED_PRESETS.find(
    (p) => Math.abs(currentSpeed - p.speed) < 0.02
  );

  const speedDisplay = activeSpeedPreset
    ? activeSpeedPreset.label
    : `${currentSpeed.toFixed(2)}×`;

  return (
    <div className="flex flex-col text-xs text-studio-fg pb-3 select-none">
      {/* Row: Playback Speed & Duration Impact */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={toggleSpeedExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">
            Playback speed
          </span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            {currentSpeed !== 1.0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  changeSpeed(1.0);
                }}
                className="text-[10px] text-studio-muted hover:text-studio-fg cursor-pointer mr-0.5"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs">{speedDisplay}</span>
            <span className="text-[11px] text-studio-muted font-mono">
              ({formatTime(clip.timelineDuration)})
            </span>
            {speedExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Controls: Slider, Presets & Duration Impact Cards */}
        {speedExpanded && (
          <div className="mt-2.5 space-y-2.5 pt-0.5">
            <Slider
              aria-label="Speed multiplier slider"
              value={currentSpeed}
              min={0.1}
              max={4.0}
              step={0.05}
              fillClassName="bg-studio-fg group-hover:bg-studio-fg"
              trackClassName="bg-studio-hover"
              onValueChange={changeSpeed}
            />

            {/* Speed Preset Chips */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {SPEED_PRESETS.map((p) => {
                const isActive = Math.abs(currentSpeed - p.speed) < 0.02;
                return (
                  <button
                    key={p.speed}
                    type="button"
                    onClick={() => changeSpeed(p.speed)}
                    className={cn(
                      "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer border",
                      isActive
                        ? "bg-studio-hover text-studio-fg font-semibold border-studio-border shadow-xs"
                        : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border-studio-border"
                    )}
                    title={`${p.label} (${p.sub})`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Source vs Timeline Duration Cards */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg border border-studio-border bg-studio-panel-raised/50 p-2.5 hover:border-studio-border-strong transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-studio-muted">
                    Source
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-studio-muted/40" />
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-studio-fg">
                  {formatTime(clip.sourceDuration)}
                </div>
                <div className="text-[10px] text-studio-muted mt-0.5 font-mono">
                  {clip.sourceDuration.toFixed(2)}s raw
                </div>
              </div>

              <div className="rounded-lg border border-studio-border bg-studio-panel-raised/50 p-2.5 hover:border-studio-border-strong transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-studio-muted">
                    Timeline
                  </span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      currentSpeed === 1
                        ? "bg-studio-muted/40"
                        : currentSpeed > 1
                          ? "bg-amber-400"
                          : "bg-sky-400"
                    )}
                  />
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-studio-fg">
                  {formatTime(clip.timelineDuration)}
                </div>
                <div className="text-[10px] text-studio-muted mt-0.5 font-mono flex items-center justify-between">
                  <span>
                    {currentSpeed === 1
                      ? "Realtime"
                      : currentSpeed > 1
                        ? `${currentSpeed}× Fast`
                        : `${currentSpeed}× Slow`}
                  </span>
                  <span className="text-studio-muted">~{estimatedEffectiveFps} fps</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => changeSpeed(1.0)}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-studio-border bg-studio-panel-raised/40 text-xs text-studio-muted hover:border-studio-border-strong hover:bg-studio-hover hover:text-studio-fg cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-studio-muted" /> Reset Speed (1.0×)
        </button>
      </div>
    </div>
  );
}
