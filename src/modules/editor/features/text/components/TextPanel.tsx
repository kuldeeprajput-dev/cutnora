"use client";

import React, { useState } from "react";
import { nanoid } from "nanoid";
import { useProjectStore } from "@/modules/projects";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import type { TimelineClip } from "@/modules/editor/types";
import { Search, Sparkles, Plus } from "lucide-react";
import {
  textPresets,
  getTextPresetLayout,
  type TextPreset,
} from "../data/text-presets";
import {
  TextCategoryFilter,
  type CategoryFilter,
} from "./TextCategoryFilter";
import { TextPresetCard } from "./TextPresetCard";

export type { TextPreset } from "../data/text-presets";

export function TextPanel() {
  const { currentProject, addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPresets = textPresets.filter((preset) => {
    const matchesCategory =
      activeCategory === "all" || preset.category === activeCategory;
    const matchesSearch = [
      preset.name,
      preset.previewText,
      preset.style.fontFamily,
      ...(preset.keywords || []),
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesSearch;
  });

  const handleAddPreset = (preset: TextPreset) => {
    if (!currentProject) return;

    let textTrack = currentProject.tracks.find((t) => t.type === "text");
    if (!textTrack) {
      addTrack("text", "Text Track");
      const updatedTracks =
        useProjectStore.getState().currentProject?.tracks || [];
      textTrack = updatedTracks.find((t) => t.type === "text");
    }

    if (!textTrack) return;

    const projW = currentProject.settings.width || 1920;
    const projH = currentProject.settings.height || 1080;
    const {
      textStyle,
      width: clipW,
      height: clipH,
      x: posX,
      y: posY,
    } = getTextPresetLayout(preset, projW, projH);

    const newClipId = nanoid();
    const newClip: TimelineClip = {
      id: newClipId,
      trackId: textTrack.id,
      type: "text",
      timelineStart: playhead,
      timelineDuration: 5,
      sourceStart: 0,
      sourceDuration: 5,
      name: preset.style.text,
      textStyle,
      transform: {
        x: posX,
        y: posY,
        width: clipW,
        height: clipH,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fitMode: "contain",
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    };

    addClip(textTrack.id, newClip);
    setSelectedClipIds([newClipId]);
  };

  return (
    <div className="@container flex flex-col gap-3 p-3 text-studio-fg select-none h-full min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-studio-muted pointer-events-none" />
        <input
          type="text"
          aria-label="Search text styles"
          placeholder="Search text styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 lg:h-9 w-full rounded-xl border border-studio-border bg-studio-panel-raised/60 pl-9 pr-3 text-base lg:text-xs text-studio-fg placeholder:text-studio-muted focus:border-studio-fg/40 focus:ring-1 focus:ring-studio-fg/20 focus:outline-none transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={() => handleAddPreset(textPresets[0])}
        className="flex min-h-11 lg:min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-studio-fg px-3 text-xs font-semibold text-studio-bg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="h-4 w-4" /> Add text
      </button>

      <TextCategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        presetCount={filteredPresets.length}
      />

      <div className="grid grid-cols-2 @[420px]:grid-cols-3 gap-2 pt-1 pb-4">
        {filteredPresets.map((preset) => (
          <TextPresetCard
            key={preset.id}
            preset={preset}
            onSelect={handleAddPreset}
          />
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-studio-muted">
          <Sparkles className="h-7 w-7 mb-2 opacity-40 text-studio-muted" />
          <p className="text-xs font-semibold text-studio-fg">
            No text styles found
          </p>
          <p className="text-[11px] text-studio-muted mt-0.5">
            Try searching for a different keyword
          </p>
        </div>
      )}
    </div>
  );
}
