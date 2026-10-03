"use client";

import React from "react";
import { Plus } from "lucide-react";
import type { TextPreset } from "../data/text-presets";
import { getTextPresetPreviewStyle } from "../data/text-presets";

export interface TextPresetCardProps {
  preset: TextPreset;
  onSelect: (preset: TextPreset) => void;
}

export function TextPresetCard({ preset, onSelect }: TextPresetCardProps) {
  return (
    <button
      type="button"
      aria-label={`Add ${preset.name} to timeline`}
      onClick={() => onSelect(preset)}
      title={`Add "${preset.name}" to timeline`}
      className="group relative flex min-w-0 h-28 flex-col gap-2 rounded-xl border border-studio-border bg-studio-panel-raised/40 hover:bg-studio-hover hover:border-studio-border-strong p-2 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 shadow-xs overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 w-full items-center justify-center rounded-lg bg-[#151515] px-2 overflow-hidden">
        <span
          style={getTextPresetPreviewStyle(preset.style)}
          className="truncate max-w-full leading-tight select-none"
        >
          {preset.previewText}
        </span>
      </div>
      <span className="w-full truncate text-[11px] font-medium text-studio-fg">
        {preset.name}
      </span>
      <div
        aria-hidden="true"
        className="absolute top-2 right-2 opacity-100 lg:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex h-5 w-5 items-center justify-center rounded-full bg-studio-fg text-studio-bg shadow-sm pointer-events-none"
      >
        <Plus className="h-3 w-3 stroke-[2.5]" />
      </div>
    </button>
  );
}
