"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  Volume1,
  Waves,
  Unlink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { AudioSettings, TimelineClip } from "@/modules/editor/types";
import { detachAudioFromVideo } from "@/modules/editor/features/audio/utils/detachAudio";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

export interface AudioTabProps {
  clip: TimelineClip;
}

const defaultAudio: AudioSettings = {
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
};

const VOLUME_PRESETS = [
  { label: "Mute", sub: "0% silence", val: 0, mute: true },
  { label: "BGM Soft", sub: "30% background", val: 0.3, mute: false },
  { label: "Dialogue", sub: "70% speech", val: 0.7, mute: false },
  { label: "Full 100%", sub: "Standard max", val: 1, mute: false },
];

export function AudioTab({ clip }: AudioTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const audio = clip.audio || defaultAudio;

  const updateAudio = (updates: Partial<AudioSettings>) => {
    updateClip(clip.id, {
      audio: {
        ...audio,
        ...updates,
      },
    });
  };

  const resetAudio = () => {
    updateClip(clip.id, {
      audio: { ...defaultAudio },
    });
  };

  const effectiveVolume = audio.muted ? 0 : audio.volume;
  const maxFadeIn = Math.max(0, clip.timelineDuration - audio.fadeOut);
  const maxFadeOut = Math.max(0, clip.timelineDuration - audio.fadeIn);

  return (
    <div className="flex flex-col gap-3 pb-2 text-studio-fg">
      {/* 1. Volume & Audio Levels */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              {audio.muted || effectiveVolume === 0 ? (
                <VolumeX className="h-3.5 w-3.5 text-studio-muted" />
              ) : effectiveVolume < 0.5 ? (
                <Volume1 className="h-3.5 w-3.5 text-brand" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-brand" />
              )}
              Volume & Levels
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Adjust clip loudness or choose a quick preset
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateAudio({ muted: !audio.muted })}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer",
                audio.muted
                  ? "border-red-500/50 bg-red-500/15 text-red-400 font-bold"
                  : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg",
              )}
            >
              {audio.muted ? (
                <>
                  <VolumeX className="h-3 w-3" /> Muted
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" /> Active
                </>
              )}
            </button>
            <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
              {Math.round(effectiveVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Quick Volume Preset Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {VOLUME_PRESETS.map((p) => {
            const isActive = p.mute
              ? audio.muted
              : !audio.muted && Math.abs(audio.volume - p.val) < 0.05;

            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  if (p.mute) {
                    updateAudio({ muted: true });
                  } else {
                    updateAudio({ volume: p.val, muted: false });
                  }
                }}
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
                    "text-[9px] mt-0.5",
                    isActive ? "text-brand/80 font-medium" : "text-studio-muted",
                  )}
                >
                  {p.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Volume Slider */}
        <div className="pt-1">
          <Slider
            aria-label="Clip volume slider"
            value={effectiveVolume}
            min={0}
            max={1}
            step={0.01}
            disabled={audio.muted}
            onValueChange={(val) => {
              if (audio.muted) updateAudio({ muted: false });
              updateAudio({ volume: val, muted: false });
            }}
          />
        </div>
      </section>

      {/* 2. Fade In & Fade Out Transitions */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3.5">
        <div>
          <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <Waves className="h-3.5 w-3.5 text-brand" /> Audio Fade Transitions
          </h3>
          <p className="mt-0.5 text-[10px] text-studio-muted">
            Smoothly fade audio in at the start and out at the end
          </p>
        </div>

        {/* Fade In */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg">
              Fade In (Start)
            </span>
            <div className="flex items-center gap-1.5">
              {audio.fadeIn > 0 && (
                <button
                  type="button"
                  onClick={() => updateAudio({ fadeIn: 0 })}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {audio.fadeIn.toFixed(1)}s
              </span>
            </div>
          </div>
          <Slider
            aria-label="Audio fade in"
            value={audio.fadeIn}
            min={0}
            max={maxFadeIn}
            step={0.1}
            onValueChange={(val) => updateAudio({ fadeIn: val })}
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: "None (0s)", val: 0 },
              { label: "0.5s", val: 0.5 },
              { label: "1.0s", val: 1.0 },
              { label: "2.0s", val: 2.0 },
            ].map((f) => (
              <Button
                key={f.label}
                size="sm"
                variant="secondary"
                disabled={f.val > maxFadeIn}
                onClick={() => updateAudio({ fadeIn: f.val })}
                className={cn(
                  "h-6 text-[10px]",
                  Math.abs(audio.fadeIn - f.val) < 0.05 &&
                    "border-brand/40 bg-brand/15 text-brand font-semibold",
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Fade Out */}
        <div className="space-y-1.5 pt-1.5 border-t border-studio-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-studio-fg">
              Fade Out (End)
            </span>
            <div className="flex items-center gap-1.5">
              {audio.fadeOut > 0 && (
                <button
                  type="button"
                  onClick={() => updateAudio({ fadeOut: 0 })}
                  className="text-[9px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                {audio.fadeOut.toFixed(1)}s
              </span>
            </div>
          </div>
          <Slider
            aria-label="Audio fade out"
            value={audio.fadeOut}
            min={0}
            max={maxFadeOut}
            step={0.1}
            onValueChange={(val) => updateAudio({ fadeOut: val })}
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: "None (0s)", val: 0 },
              { label: "0.5s", val: 0.5 },
              { label: "1.0s", val: 1.0 },
              { label: "2.0s", val: 2.0 },
            ].map((f) => (
              <Button
                key={f.label}
                size="sm"
                variant="secondary"
                disabled={f.val > maxFadeOut}
                onClick={() => updateAudio({ fadeOut: f.val })}
                className={cn(
                  "h-6 text-[10px]",
                  Math.abs(audio.fadeOut - f.val) < 0.05 &&
                    "border-brand/40 bg-brand/15 text-brand font-semibold",
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Separate Audio Track (For Video / Overlay Clips) */}
      {(clip.type === "video" || clip.type === "overlay") && (
        <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg border border-studio-border bg-studio-panel text-brand shrink-0">
              <Unlink className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-studio-fg">
                Separate Audio Track
              </h3>
              <p className="mt-0.5 text-[10px] text-studio-muted">
                Detach this video's audio into an independent track on the
                timeline for advanced editing.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => detachAudioFromVideo(clip.id)}
            className="w-full h-8 justify-center gap-1.5 text-xs font-semibold text-brand hover:text-brand border-brand/30 hover:border-brand/60 bg-brand/5 hover:bg-brand/10 cursor-pointer"
          >
            <Unlink className="h-3.5 w-3.5" /> Detach Audio to Timeline Track
          </Button>
        </section>
      )}

      {/* 4. Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={resetAudio}
        className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Audio Controls
      </Button>
    </div>
  );
}
