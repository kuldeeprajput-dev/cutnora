"use client";

import React from "react";
import { Palette, Sparkles } from "lucide-react";
import type { Adjustments, TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { Slider } from "@/shared/components/ui/Slider";
import {
  InspectorResetButton,
  InspectorSection,
  InspectorSliderHeader,
} from "./InspectorControls";

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

const toneControls = [
  { key: "brightness", label: "Brightness", min: 0, max: 2, step: 0.05 },
  { key: "contrast", label: "Contrast", min: 0, max: 2, step: 0.05 },
  { key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.05 },
] as const;

const effectControls = [
  { key: "blur", label: "Blur", min: 0, max: 20, step: 1 },
  { key: "grayscale", label: "Grayscale", min: 0, max: 1, step: 0.05 },
  { key: "sepia", label: "Sepia", min: 0, max: 1, step: 0.05 },
] as const;

function formatValue(key: keyof Adjustments, value: number) {
  return key === "blur" ? `${value}px` : `${Math.round(value * 100)}%`;
}

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

  const resetAdjustment = (key: keyof Adjustments) => {
    updateAdjustment(key, defaultAdjustments[key]);
  };

  const resetAll = () => {
    updateClip(clip.id, {
      adjustments: { ...defaultAdjustments },
    });
  };

  const renderControls = (
    controls: ReadonlyArray<{
      key: keyof Adjustments;
      label: string;
      min: number;
      max: number;
      step: number;
    }>,
  ) => (
    <div className="space-y-3.5">
      {controls.map((control) => (
        <div key={control.key}>
          <InspectorSliderHeader
            label={control.label}
            value={formatValue(control.key, adjustments[control.key])}
            onReset={() => resetAdjustment(control.key)}
          />
          <Slider
            aria-label={control.label}
            value={adjustments[control.key]}
            min={control.min}
            max={control.max}
            step={control.step}
            onValueChange={(value) =>
              updateAdjustment(control.key, value)
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 pb-2 text-studio-fg">
      <div className="rounded-xl border border-brand/25 bg-brand/5 px-3 py-2 text-[10px] leading-4 text-studio-muted">
        Double-click a control label to restore its default value.
      </div>

      <InspectorSection
        icon={Palette}
        title="Tone & color"
        description="Balance the light, contrast, and color intensity."
      >
        {renderControls(toneControls)}
      </InspectorSection>

      <InspectorSection
        icon={Sparkles}
        title="Image effects"
        description="Add softness or stylized monochrome color."
      >
        {renderControls(effectControls)}
      </InspectorSection>

      <InspectorResetButton onClick={resetAll}>
        Reset all adjustments
      </InspectorResetButton>
    </div>
  );
}
