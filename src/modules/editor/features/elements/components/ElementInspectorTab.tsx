"use client";

import React from "react";
import { Palette, PenTool, Sparkles, Square } from "lucide-react";
import type { ElementStyle, TimelineClip } from "@/modules/editor/types";
import {
  InspectorColorControl,
  InspectorControlLabel,
  InspectorSection,
  InspectorSliderHeader,
} from "@/modules/editor/features/inspector/components/InspectorControls";
import { useProjectStore } from "@/modules/projects";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";

export interface ElementInspectorTabProps {
  clip: TimelineClip;
}

export function ElementInspectorTab({ clip }: ElementInspectorTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);

  const elementStyle: ElementStyle = clip.elementStyle || {
    fillColor: "#FF5A36",
    borderRadius: 8,
    shapeType: "rectangle",
  };

  const updateStyle = (updates: Partial<ElementStyle>) => {
    updateClip(clip.id, {
      elementStyle: {
        ...elementStyle,
        ...updates,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 pb-2 text-studio-fg">
      <InspectorSection
        icon={Palette}
        title="Shape colors"
        description="Set the fill and outline colors."
      >
        <div className="grid grid-cols-2 gap-2.5">
          <InspectorColorControl
            label="Fill color"
            value={elementStyle.fillColor || "#FF5A36"}
            onChange={(value) => updateStyle({ fillColor: value })}
          />
          <InspectorColorControl
            label="Border color"
            value={elementStyle.strokeColor || "#FFFFFF"}
            onChange={(value) => updateStyle({ strokeColor: value })}
          />
        </div>
      </InspectorSection>

      <InspectorSection
        icon={PenTool}
        title="Border"
        description="Control the outline weight and line style."
      >
        <div>
          <InspectorSliderHeader
            label="Border width"
            value={`${elementStyle.strokeWidth || 0}px`}
          />
          <Slider
            aria-label="Border width"
            value={elementStyle.strokeWidth || 0}
            min={0}
            max={20}
            step={1}
            onValueChange={(value) => updateStyle({ strokeWidth: value })}
          />
        </div>
        <div className="mt-3">
          <InspectorControlLabel htmlFor="element-line-style">
            Line style
          </InspectorControlLabel>
          <Select
            id="element-line-style"
            value={elementStyle.lineStyle || "solid"}
            onChange={(e) => updateStyle({ lineStyle: e.target.value as "solid" | "dashed" | "dotted" })}
            className="mt-1.5 h-9 text-xs"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </Select>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Square}
        title="Shape details"
        description="Fine-tune corners and shape-specific settings."
      >
        <div className="space-y-3.5">
          {elementStyle.shapeType === "arrow" && (
            <div>
              <InspectorControlLabel htmlFor="element-arrowheads">
                Arrowheads
              </InspectorControlLabel>
              <Select
                id="element-arrowheads"
                value={elementStyle.arrowHead || "end"}
                onChange={(e) => updateStyle({ arrowHead: e.target.value as "none" | "end" | "both" })}
                className="mt-1.5 h-9 text-xs"
              >
                <option value="none">None</option>
                <option value="end">End arrowhead</option>
                <option value="both">Both ends</option>
              </Select>
            </div>
          )}

          {elementStyle.shapeType === "progress-bar" && (
            <div>
              <InspectorSliderHeader
                label="Progress value"
                value={`${elementStyle.progress ?? 65}%`}
              />
              <Slider
                aria-label="Progress value"
                value={elementStyle.progress ?? 65}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateStyle({ progress: value })}
              />
            </div>
          )}

          <div>
            <InspectorSliderHeader
              label="Corner radius"
              value={`${elementStyle.borderRadius || 0}px`}
            />
            <Slider
              aria-label="Corner radius"
              value={elementStyle.borderRadius || 0}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) =>
                updateStyle({ borderRadius: value })
              }
            />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Sparkles}
        title="Drop shadow"
        description="Add depth and separation from the canvas."
      >
        <InspectorColorControl
          label="Shadow color"
          value={elementStyle.shadowColor || "#000000"}
          onChange={(value) => updateStyle({ shadowColor: value })}
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <InspectorSliderHeader
              label="Blur"
              value={`${elementStyle.shadowBlur || 0}px`}
            />
            <Slider
              aria-label="Blur"
              value={elementStyle.shadowBlur || 0}
              min={0}
              max={30}
              step={1}
              onValueChange={(value) => updateStyle({ shadowBlur: value })}
            />
          </div>
          <div>
            <InspectorSliderHeader
              label="X"
              value={`${elementStyle.shadowOffsetX || 0}px`}
            />
            <Slider
              aria-label="Offset X"
              value={elementStyle.shadowOffsetX || 0}
              min={-20}
              max={20}
              step={1}
              onValueChange={(value) => updateStyle({ shadowOffsetX: value })}
            />
          </div>
          <div>
            <InspectorSliderHeader
              label="Y"
              value={`${elementStyle.shadowOffsetY || 0}px`}
            />
            <Slider
              aria-label="Offset Y"
              value={elementStyle.shadowOffsetY || 0}
              min={-20}
              max={20}
              step={1}
              onValueChange={(value) => updateStyle({ shadowOffsetY: value })}
            />
          </div>
        </div>
      </InspectorSection>
    </div>
  );
}
