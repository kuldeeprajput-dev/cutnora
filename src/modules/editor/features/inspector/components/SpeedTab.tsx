"use client";

import React from "react";
import { Activity, Gauge, Info, Timer } from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";
import {
  InspectorControlLabel,
  InspectorResetButton,
  InspectorSection,
  InspectorSliderHeader,
} from "./InspectorControls";

export interface SpeedTabProps {
  clip: TimelineClip;
}

const speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];

export function SpeedTab({ clip }: SpeedTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const currentProject = useProjectStore((state) => state.currentProject);
  const projectFps = currentProject?.settings.fps || 30;

  const changeSpeed = (newSpeed: number) => {
    const validSpeed = Math.min(4, Math.max(0.1, Number(newSpeed.toFixed(2))));
    const newTimelineDuration = clip.sourceDuration / validSpeed;

    updateClip(clip.id, {
      speed: validSpeed,
      timelineDuration: Math.max(0.1, newTimelineDuration),
    });
  };

  const estimatedEffectiveFps = Math.round(projectFps * clip.speed);

  return (
    <div className="flex select-none flex-col gap-3 pb-2 text-studio-fg">
      <InspectorSection
        icon={Gauge}
        title="Playback speed"
        description="Choose a preset, slide, or enter a custom multiplier."
      >
        <InspectorControlLabel>Speed presets</InspectorControlLabel>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {speedPresets.map((speed) => {
            const active = Math.abs(clip.speed - speed) < 0.01;
            return (
              <button
                key={speed}
                type="button"
                aria-pressed={active}
                onClick={() => changeSpeed(speed)}
                className={cn(
                  "h-9 rounded-lg border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  active
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-studio-border bg-studio-bg/45 text-studio-muted hover:border-brand/50 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                {speed}×
              </button>
            );
          })}
        </div>

        <div className="mt-3.5">
          <InspectorSliderHeader
            label="Speed multiplier"
            value={`${clip.speed.toFixed(2)}×`}
            onReset={() => changeSpeed(1)}
          />
          <Slider
            aria-label="Speed multiplier"
            value={clip.speed}
            min={0.1}
            max={4}
            step={0.05}
            onValueChange={changeSpeed}
          />
        </div>

        <div className="mt-3">
          <InspectorControlLabel htmlFor="custom-speed">
            Custom multiplier
          </InspectorControlLabel>
          <div className="relative mt-1.5">
            <Input
              id="custom-speed"
              aria-label="Custom speed multiplier"
              type="number"
              min={0.1}
              max={4}
              step={0.05}
              value={clip.speed}
              onChange={(event) =>
                changeSpeed(Number.parseFloat(event.target.value) || 1)
              }
              className="h-9 pr-8 font-mono text-xs"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-studio-muted">
              ×
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => changeSpeed(clip.speed - 0.1)}
            disabled={clip.speed <= 0.15}
            className="h-7 flex-1 text-[10px] font-mono"
            title="Decrease speed by 0.1x"
          >
            -0.10×
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => changeSpeed(clip.speed + 0.1)}
            disabled={clip.speed >= 3.95}
            className="h-7 flex-1 text-[10px] font-mono"
            title="Increase speed by 0.1x"
          >
            +0.10×
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => changeSpeed(clip.speed * 0.5)}
            disabled={clip.speed <= 0.2}
            className="h-7 flex-1 text-[10px] font-mono"
            title="Half speed (0.5x)"
          >
            ½×
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => changeSpeed(clip.speed * 2)}
            disabled={clip.speed >= 2}
            className="h-7 flex-1 text-[10px] font-mono"
            title="Double speed (2.0x)"
          >
            2×
          </Button>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Timer}
        title="Duration result"
        description="The timeline length updates automatically."
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-studio-border bg-studio-bg/45 p-2.5">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-studio-muted">
              Source
            </span>
            <span className="mt-1 block font-mono text-xs text-studio-fg">
              {clip.sourceDuration.toFixed(2)}s
            </span>
          </div>
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-2.5">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-studio-muted">
              Timeline
            </span>
            <span className="mt-1 block font-mono text-xs text-brand">
              {clip.timelineDuration.toFixed(2)}s
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex items-start gap-2 text-[10px] leading-4 text-studio-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          <span>
            Speed changes visible duration while preserving the current source
            trim.
          </span>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Activity}
        title="Playback motion"
        description="Estimated motion smoothness at current speed."
      >
        <div className="flex items-center justify-between rounded-lg border border-studio-border bg-studio-bg/45 px-3 py-2">
          <span className="text-[11px] font-medium text-studio-muted">
            Effective frame rate
          </span>
          <span className="font-mono text-xs font-semibold text-studio-fg">
            ~{estimatedEffectiveFps} fps
          </span>
        </div>
      </InspectorSection>

      <InspectorResetButton onClick={() => changeSpeed(1)}>
        Reset speed to 1×
      </InspectorResetButton>
    </div>
  );
}
