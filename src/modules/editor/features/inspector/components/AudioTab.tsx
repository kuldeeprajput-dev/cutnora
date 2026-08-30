"use client";

import React from "react";
import { Unlink, Volume2, Waves } from "lucide-react";
import type { AudioSettings, TimelineClip } from "@/modules/editor/types";
import { detachAudioFromVideo } from "@/modules/editor/features/audio/utils/detachAudio";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { Slider } from "@/shared/components/ui/Slider";
import {
  InspectorResetButton,
  InspectorSection,
  InspectorSliderHeader,
  inspectorActionClass,
} from "./InspectorControls";

export interface AudioTabProps {
  clip: TimelineClip;
}

const defaultAudio: AudioSettings = {
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
};

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

  return (
    <div className="flex flex-col gap-3 pb-2 text-studio-fg">
      <InspectorSection
        icon={Volume2}
        title="Clip audio"
        description="Control the playback level for this clip."
      >
        <div>
          <InspectorSliderHeader
            label="Volume"
            value={`${Math.round((audio.muted ? 0 : audio.volume) * 100)}%`}
          />
          <Slider
            aria-label="Clip volume"
            value={audio.volume}
            min={0}
            max={1}
            step={0.01}
            disabled={audio.muted}
            onValueChange={(value) => updateAudio({ volume: value })}
          />
        </div>

        <label className="mt-3 flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg border border-studio-border bg-studio-bg/45 px-3 transition-colors hover:border-brand/40">
          <span>
            <span className="block text-[11px] font-medium text-studio-fg">
              Mute clip audio
            </span>
            <span className="mt-0.5 block text-[9px] text-studio-muted">
              Keep the clip visible without its sound.
            </span>
          </span>
          <Checkbox
            aria-label="Mute clip audio"
            checked={audio.muted}
            onChange={(event) => updateAudio({ muted: event.target.checked })}
          />
        </label>
      </InspectorSection>

      <InspectorSection
        icon={Waves}
        title="Fade"
        description="Smooth the audio at the beginning and end."
      >
        <div className="space-y-3.5">
          <div>
            <InspectorSliderHeader
              label="Fade in"
              value={`${audio.fadeIn.toFixed(1)}s`}
            />
            <Slider
              aria-label="Audio fade in"
              value={audio.fadeIn}
              min={0}
              max={Math.max(0, clip.timelineDuration - audio.fadeOut)}
              step={0.1}
              onValueChange={(value) => updateAudio({ fadeIn: value })}
            />
          </div>
          <div>
            <InspectorSliderHeader
              label="Fade out"
              value={`${audio.fadeOut.toFixed(1)}s`}
            />
            <Slider
              aria-label="Audio fade out"
              value={audio.fadeOut}
              min={0}
              max={Math.max(0, clip.timelineDuration - audio.fadeIn)}
              step={0.1}
              onValueChange={(value) => updateAudio({ fadeOut: value })}
            />
          </div>
        </div>
      </InspectorSection>

      {(clip.type === "video" || clip.type === "overlay") && (
        <InspectorSection
          icon={Unlink}
          title="Separate audio"
          description="Move this video's sound to its own timeline track."
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => detachAudioFromVideo(clip.id)}
            className={`${inspectorActionClass} w-full justify-center text-brand`}
          >
            <Unlink className="h-3.5 w-3.5" /> Detach audio to track
          </Button>
        </InspectorSection>
      )}

      <InspectorResetButton onClick={resetAudio}>
        Reset audio controls
      </InspectorResetButton>
    </div>
  );
}
