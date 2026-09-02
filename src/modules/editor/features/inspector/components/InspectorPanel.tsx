"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { useProjectStore } from "@/modules/projects";
import { StudioPanel } from "@/shared/components/layout/StudioPanel";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
} from "@/shared/components/ui/Tabs";
import { Button } from "@/shared/components/ui/Button";
import { Slider } from "@/shared/components/ui/Slider";
import { TransformTab } from "./TransformTab";
import { AdjustTab } from "./AdjustTab";
import { AudioTab } from "./AudioTab";
import { SpeedTab } from "./SpeedTab";
import { TimeTab } from "./TimeTab";
import { CanvasSettingsPanel } from "./CanvasSettingsPanel";
import { TextInspectorTab } from "@/modules/editor/features/text";
import { ElementInspectorTab } from "@/modules/editor/features/elements";
import {
  Trash2,
  Layers,
  ChevronDown,
  Check,
  Type,
  Sparkles,
  Move,
  Sliders,
  Volume2,
  Gauge,
  Clock,
} from "lucide-react";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";

interface InspectorTabItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

function InspectorTabDropdown({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: InspectorTabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeTabObj = tabs.find((t) => t.value === activeTab) || tabs[0];

  return (
    <div ref={dropdownRef} className="relative mb-3 w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-10 w-full cursor-pointer select-none items-center justify-between rounded-xl border bg-studio-panel/70 px-3 text-xs transition-colors ${
          isOpen
            ? "border-brand ring-1 ring-brand/40"
            : "border-studio-border hover:border-brand/50"
        }`}
      >
        <span className="flex items-center gap-2 font-semibold text-studio-fg">
          {activeTabObj?.icon}
          <span>{activeTabObj?.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-studio-muted shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-studio-border bg-studio-panel p-1.5 shadow-2xl animate-in fade-in-80"
        >
          <div className="flex flex-col gap-1">
            {tabs.map((t) => {
              const isSelected = t.value === activeTab;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    onTabChange(t.value);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex min-h-9 w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? "border-brand/40 bg-brand/15 font-semibold text-brand"
                      : "border-transparent text-studio-fg hover:border-studio-border hover:bg-studio-panel-raised"
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    {t.icon}
                    <span>{t.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-brand shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function InspectorPanel() {
  const selectedClipIds = useEditorUIStore((state) => state.selectedClipIds);
  const clearSelection = useEditorUIStore((state) => state.clearSelection);
  const activeInspectorTab = useEditorUIStore(
    (state) => state.activeInspectorTab,
  );
  const setActiveInspectorTab = useEditorUIStore(
    (state) => state.setActiveInspectorTab,
  );
  const inspectorMode = useEditorUIStore((state) => state.inspectorMode);
  const setInspectorMode = useEditorUIStore((state) => state.setInspectorMode);
  const leftPanelWidth = useEditorUIStore((state) => state.leftPanelWidth);
  const currentProject = useProjectStore((state) => state.currentProject);
  const deleteClips = useProjectStore((state) => state.deleteClips);
  const updateClip = useProjectStore((state) => state.updateClip);

  const [isNarrow, setIsNarrow] = useState(leftPanelWidth < 420);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsNarrow(leftPanelWidth < 420);
  }, [leftPanelWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 420);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // When selected clip changes, automatically switch to clip inspector mode and seek playhead
  useEffect(() => {
    if (selectedClipIds.length > 0) {
      setInspectorMode("clip");
      const clips =
        useProjectStore
          .getState()
          .currentProject?.tracks.flatMap((t) => t.clips) || [];
      const firstClip = clips.find((c) => selectedClipIds.includes(c.id));
      if (firstClip) {
        if (firstClip.type === "text") {
          setActiveInspectorTab("text");
        } else if (firstClip.type === "overlay") {
          setActiveInspectorTab("element");
        } else if (firstClip.type === "audio") {
          setActiveInspectorTab("audio");
        } else {
          setActiveInspectorTab("transform");
        }

        // Auto-seek playhead to selected clip start if playhead is out of bounds
        const playhead = usePlaybackStore.getState().playhead;
        const clipEnd = firstClip.timelineStart + firstClip.timelineDuration;
        if (playhead < firstClip.timelineStart || playhead >= clipEnd) {
          usePlaybackStore.getState().setPlayhead(firstClip.timelineStart);
        }
      }
    }
  }, [selectedClipIds, setInspectorMode, setActiveInspectorTab]);

  if (!currentProject) return null;

  // Single clip selection
  const selectedClips = currentProject.tracks
    .flatMap((t) => t.clips)
    .filter((c) => selectedClipIds.includes(c.id));

  // Render Canvas settings if mode is 'canvas' or no clips selected
  if (inspectorMode === "canvas" || selectedClips.length === 0) {
    return (
      <StudioPanel
        title="Canvas Settings"
        actions={
          selectedClips.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInspectorMode("clip")}
              className="h-7 px-2.5 text-[11px] font-semibold cursor-pointer shrink-0 whitespace-nowrap"
            >
              Clip Properties
            </Button>
          ) : null
        }
        className="h-full w-full"
      >
        <div className="h-full w-full overflow-y-auto p-3 studio-scrollbar">
          <CanvasSettingsPanel />
        </div>
      </StudioPanel>
    );
  }

  // Multi-selection inspector
  if (selectedClips.length > 1) {
    const handleMultiOpacityChange = (opacity: number) => {
      selectedClips.forEach((c) => {
        updateClip(c.id, {
          transform: {
            ...c.transform,
            opacity,
          },
        });
      });
    };

    const handleMultiDelete = () => {
      deleteClips(selectedClipIds);
      clearSelection();
    };

    return (
      <StudioPanel
        title={`${selectedClips.length} Clips Selected`}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInspectorMode("canvas")}
            className="h-7 px-2 text-[10px] font-semibold cursor-pointer shrink-0 whitespace-nowrap"
          >
            Canvas Settings
          </Button>
        }
        className="h-full w-full"
      >
        <div className="flex h-full w-full flex-col gap-4 p-3 overflow-y-auto studio-scrollbar text-studio-fg">
          <div className="flex items-center gap-2 rounded-lg border border-studio-border bg-studio-panel p-3 text-xs text-studio-muted">
            <Layers className="h-4 w-4 text-selection shrink-0" />
            <span>
              Multi-selection mode. Controls apply to all {selectedClips.length}{" "}
              selected clips simultaneously.
            </span>
          </div>

          {/* Group Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-studio-muted">
                Group Opacity
              </label>
              <span className="font-mono text-xs text-studio-fg">Mixed</span>
            </div>
            <Slider
              value={1}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleMultiOpacityChange}
            />
          </div>

          {/* Group Delete Action */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMultiDelete}
            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Selected Clips
          </Button>
        </div>
      </StudioPanel>
    );
  }

  // Single clip inspector
  const clip = selectedClips[0];
  const isVisual =
    clip.type === "video" || clip.type === "image" || clip.type === "overlay";
  const hasAudio = clip.type === "video" || clip.type === "audio";
  const isText = clip.type === "text";
  const isElement = clip.type === "overlay";

  // Build available inspector tabs
  const availableTabs: InspectorTabItem[] = [];
  if (isText)
    availableTabs.push({
      value: "text",
      label: "Text",
      icon: (
        <Type className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  if (isElement)
    availableTabs.push({
      value: "element",
      label: "Shape",
      icon: (
        <Sparkles className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  if (clip.type !== "audio" && clip.type !== "text")
    availableTabs.push({
      value: "transform",
      label: "Transform",
      icon: (
        <Move className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  if (isVisual)
    availableTabs.push({
      value: "adjust",
      label: "Adjust",
      icon: (
        <Sliders className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  if (hasAudio)
    availableTabs.push({
      value: "audio",
      label: "Audio",
      icon: (
        <Volume2 className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  if (hasAudio)
    availableTabs.push({
      value: "speed",
      label: "Speed",
      icon: (
        <Gauge className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
      ),
    });
  availableTabs.push({
    value: "time",
    label: "Time",
    icon: (
      <Clock className="h-3.5 w-3.5 text-studio-muted shrink-0 group-aria-selected:text-brand" />
    ),
  });

  return (
    <StudioPanel
      title={clip.name}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectorMode("canvas")}
          className="h-7 px-2 text-[10px] font-semibold cursor-pointer shrink-0 whitespace-nowrap"
        >
          Canvas Settings
        </Button>
      }
      className="h-full w-full"
    >
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto p-3 studio-scrollbar"
      >
        <Tabs
          defaultValue={isText ? "text" : isElement ? "element" : "transform"}
          value={activeInspectorTab}
          onValueChange={setActiveInspectorTab}
        >
          {isNarrow ? (
            /* Custom Responsive Dropdown when panel is narrow (< 340px) */
            <InspectorTabDropdown
              tabs={availableTabs}
              activeTab={activeInspectorTab}
              onTabChange={setActiveInspectorTab}
            />
          ) : (
            /* Horizontal Tabs Bar when panel width is wide (>= 360px) */
            <TabList className="mb-3 flex w-full shrink-0 items-center gap-0 overflow-x-auto rounded-lg border border-studio-border bg-studio-topbar p-0.5 studio-scrollbar">
              {availableTabs.map((t) => (
                <TabTrigger
                  key={t.value}
                  value={t.value}
                  className="group relative min-h-9 flex-1 cursor-pointer justify-center gap-1.5 whitespace-nowrap border-0 bg-transparent px-2 py-1 text-[10px] shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform data-[state=active]:bg-brand/[0.06] data-[state=active]:text-brand data-[state=active]:shadow-none data-[state=active]:after:scale-x-100"
                >
                  {t.icon}
                  <span>{t.label}</span>
                </TabTrigger>
              ))}
            </TabList>
          )}

          {isText && (
            <TabContent value="text">
              <TextInspectorTab clip={clip} />
            </TabContent>
          )}

          {isElement && (
            <TabContent value="element">
              <ElementInspectorTab clip={clip} />
            </TabContent>
          )}

          {clip.type !== "audio" && clip.type !== "text" && (
            <TabContent value="transform">
              <TransformTab clip={clip} />
            </TabContent>
          )}

          {isVisual && (
            <TabContent value="adjust">
              <AdjustTab clip={clip} />
            </TabContent>
          )}

          {hasAudio && (
            <TabContent value="audio">
              <AudioTab clip={clip} />
            </TabContent>
          )}

          {hasAudio && (
            <TabContent value="speed">
              <SpeedTab clip={clip} />
            </TabContent>
          )}

          <TabContent value="time">
            <TimeTab clip={clip} />
          </TabContent>
        </Tabs>
      </div>
    </StudioPanel>
  );
}
