"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Unlink,
  RotateCcw,
} from "lucide-react";
import type { AudioSettings, TimelineClip } from "@/modules/editor/types";
import { detachAudioFromVideo } from "@/modules/editor/features/audio/utils/detachAudio";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

import { useInspectorExpanded } from "../hooks/useInspectorAccordion";

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

  const [volumeExpanded, toggleVolumeExpanded] = useInspectorExpanded("audio.volume", false);
  const [fadeInExpanded, toggleFadeInExpanded] = useInspectorExpanded("audio.fadeIn", false);
  const [fadeOutExpanded, toggleFadeOutExpanded] = useInspectorExpanded("audio.fadeOut", false);

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

  const activeVolumePreset = VOLUME_PRESETS.find((p) => {
    if (p.mute) return audio.muted;
    return !audio.muted && Math.abs(audio.volume - p.val) < 0.005;
  });

  const volumeDisplay = activeVolumePreset
    ? activeVolumePreset.label
    : `${Math.round(effectiveVolume * 100)}%`;

  return (
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      {/* Row 1: Volume */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={toggleVolumeExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Volume
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            {(audio.volume !== 1 || audio.muted) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateAudio({ volume: 1, muted: false });
                }}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer mr-0.5"
              >
                Reset
              </button>
            )}
            <span
              className={cn(
                activeVolumePreset ? "" : "font-mono",
                audio.muted && "text-red-400 font-semibold"
              )}
            >
              {volumeDisplay}
            </span>
            {volumeExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {/* Volume Controls when expanded */}
        {volumeExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            <Slider
              aria-label="Clip volume slider"
              value={effectiveVolume}
              min={0}
              max={1}
              step={0.01}
              fillClassName="bg-white/90"
              trackClassName="bg-white/10"
              onValueChange={(val) => {
                updateAudio({ volume: val, muted: false });
              }}
            />
            <div className="grid grid-cols-4 gap-1 pt-1">
              {VOLUME_PRESETS.map((p) => {
                const isActive = p.mute
                  ? audio.muted
                  : !audio.muted && Math.abs(audio.volume - p.val) < 0.005;

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
                      "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Fade In */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={toggleFadeInExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Fade In (Start)
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            {audio.fadeIn > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateAudio({ fadeIn: 0 });
                }}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer mr-0.5"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs">
              {audio.fadeIn.toFixed(1)}s
            </span>
            {fadeInExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {fadeInExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            <Slider
              aria-label="Audio fade in"
              value={audio.fadeIn}
              min={0}
              max={Math.max(0.1, maxFadeIn)}
              step={0.1}
              fillClassName="bg-white/90"
              trackClassName="bg-white/10"
              onValueChange={(val) => updateAudio({ fadeIn: val })}
            />
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[
                { label: "None (0s)", val: 0 },
                { label: "0.5s", val: 0.5 },
                { label: "1.0s", val: 1.0 },
                { label: "2.0s", val: 2.0 },
              ].map((f) => (
                <button
                  key={f.label}
                  type="button"
                  disabled={f.val > maxFadeIn}
                  onClick={() => updateAudio({ fadeIn: f.val })}
                  className={cn(
                    "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed",
                    Math.abs(audio.fadeIn - f.val) < 0.05
                      ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Fade Out */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={toggleFadeOutExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Fade Out (End)
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            {audio.fadeOut > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateAudio({ fadeOut: 0 });
                }}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer mr-0.5"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs">
              {audio.fadeOut.toFixed(1)}s
            </span>
            {fadeOutExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {fadeOutExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            <Slider
              aria-label="Audio fade out"
              value={audio.fadeOut}
              min={0}
              max={Math.max(0.1, maxFadeOut)}
              step={0.1}
              fillClassName="bg-white/90"
              trackClassName="bg-white/10"
              onValueChange={(val) => updateAudio({ fadeOut: val })}
            />
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[
                { label: "None (0s)", val: 0 },
                { label: "0.5s", val: 0.5 },
                { label: "1.0s", val: 1.0 },
                { label: "2.0s", val: 2.0 },
              ].map((f) => (
                <button
                  key={f.label}
                  type="button"
                  disabled={f.val > maxFadeOut}
                  onClick={() => updateAudio({ fadeOut: f.val })}
                  className={cn(
                    "py-1 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed",
                    Math.abs(audio.fadeOut - f.val) < 0.05
                      ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Separate Audio Track */}
      {(clip.type === "video" || clip.type === "overlay") && (
        <div className="py-2.5 border-b border-white/[0.06] group select-none">
          <div className="flex items-center justify-between">
            <span className="text-white/50 group-hover:text-white font-medium transition-colors">
              Audio track
            </span>
            <button
              type="button"
              onClick={() => detachAudioFromVideo(clip.id)}
              className="h-6 px-2.5 rounded-md border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Unlink className="h-3 w-3 text-white/60" /> Detach to Timeline Track
            </button>
          </div>
        </div>
      )}

      {/* Row 5: Reset Audio */}
      <div className="pt-3">
        <button
          type="button"
          onClick={resetAudio}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-white/40" /> Reset Audio Controls
        </button>
      </div>
    </div>
  );
}
