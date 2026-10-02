"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { useProjectStore } from "@/modules/projects";
import { ProjectPanel } from "@/shared/components/layout/ProjectPanel";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
} from "@/shared/components/ui/Tabs";
import { Slider } from "@/shared/components/ui/Slider";
import { TransformTab } from "./TransformTab";
import { AdjustTab } from "./AdjustTab";
import { AudioTab } from "./AudioTab";
import { SpeedTab } from "./SpeedTab";
import { TimeTab } from "./TimeTab";
import { CanvasSettingsPanel } from "./CanvasSettingsPanel";
import { TextInspectorTab } from "@/modules/editor/features/text";
import { ElementInspectorTab } from "@/modules/editor/features/elements";
import { cn } from "@/shared/utils/cn";
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
import type { TimelineClip } from "@/modules/editor/types";

function getValidTabsForClip(clip: TimelineClip): string[] {
  const isVisual =
    clip.type === "video" || clip.type === "image" || clip.type === "overlay";
  const hasAudio = clip.type === "video" || clip.type === "audio";
  const isText = clip.type === "text";
  const isElement = clip.type === "overlay";

  const tabs: string[] = [];
  if (isText) tabs.push("text");
  if (isElement) tabs.push("element");
  if (clip.type !== "audio" && clip.type !== "text") tabs.push("transform");
  if (isVisual) tabs.push("adjust");
  if (hasAudio) tabs.push("audio", "speed");
  tabs.push("time");
  return tabs;
}

function getDefaultTabForClip(clip: TimelineClip): string {
  if (clip.type === "text") return "text";
  if (clip.type === "overlay") return "element";
  if (clip.type === "audio") return "audio";
  return "transform";
}

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
        className={cn(
          "flex h-9 w-full cursor-pointer select-none items-center justify-between rounded-lg border px-3 text-xs transition-colors",
          isOpen
            ? "border-studio-border-strong bg-studio-panel-raised text-studio-fg"
            : "border-studio-border bg-studio-panel-raised/50 text-studio-fg hover:border-studio-border-strong hover:bg-studio-hover"
        )}
      >
        <span className="flex items-center gap-2 font-medium text-studio-fg">
          {activeTabObj?.icon}
          <span>{activeTabObj?.label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-studio-muted shrink-0 transition-transform",
            isOpen && "rotate-180 text-studio-fg"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-studio-border bg-studio-panel p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-80"
        >
          <div className="flex flex-col gap-0.5">
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
                  className={cn(
                    "flex min-h-8 w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    isSelected
                      ? "bg-studio-hover font-semibold text-studio-fg"
                      : "text-studio-fg/90 hover:bg-studio-hover/60 hover:text-studio-fg"
                  )}
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    {t.icon}
                    <span>{t.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-studio-fg shrink-0 ml-2 stroke-[2.5]" />
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

export function InspectorPanel({
  view,
  dockAction,
  sidebarAction,
}: {
  view?: "clip" | "canvas";
  dockAction?: React.ReactNode;
  sidebarAction?: React.ReactNode;
} = {}) {
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

  const [isNarrow, setIsNarrow] = useState(view === "clip" || leftPanelWidth < 420);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateWidth = () => setIsNarrow(container.clientWidth < 420);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [view, inspectorMode, selectedClipIds.length]);

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
        const validTabs = getValidTabsForClip(firstClip);
        const currentTab = useEditorUIStore.getState().activeInspectorTab;
        if (!validTabs.includes(currentTab)) {
          setActiveInspectorTab(getDefaultTabForClip(firstClip));
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

  if (view === "clip" && selectedClips.length === 0) {
    return (
      <ProjectPanel
        title="Clip Properties"
        className="h-full w-full"
        actions={dockAction}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-2 text-sm font-medium text-studio-fg">
            No clip selected
          </div>
          <p className="max-w-52 text-xs leading-relaxed text-studio-muted">
            Select a clip on the canvas or timeline to see its properties here.
          </p>
        </div>
      </ProjectPanel>
    );
  }

  if (
    view === "canvas" ||
    selectedClips.length === 0 ||
    (!view && inspectorMode === "canvas")
  ) {
    return (
      <ProjectPanel
        title="Canvas Settings"
        className="h-full w-full"
        actions={
          <>
            {!view && selectedClips.length > 0 && (
              <button
                type="button"
                onClick={() => setInspectorMode("clip")}
                className="h-7 cursor-pointer rounded-lg border border-studio-border bg-studio-panel-raised/60 px-2.5 text-[11px] font-medium text-studio-fg transition-colors hover:bg-studio-hover"
              >
                Clip Properties
              </button>
            )}
            {sidebarAction}
          </>
        }
      >
        <div className="h-full w-full overflow-y-auto p-3 no-scrollbar">
          <CanvasSettingsPanel />
        </div>
      </ProjectPanel>
    );
  }

  const clipActions = (
    <>
      {view !== "clip" && (
        <button
          type="button"
          onClick={() => setInspectorMode("canvas")}
          className="h-7 cursor-pointer whitespace-nowrap rounded-lg border border-studio-border bg-studio-panel-raised/60 px-2.5 text-[11px] font-medium text-studio-fg transition-colors hover:border-studio-border-strong hover:bg-studio-hover"
        >
          Canvas Settings
        </button>
      )}
      {dockAction}
      {sidebarAction}
    </>
  );
  const clipPanelClass = cn("h-full w-full", view === "clip" && "lg:min-w-0");

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
      <ProjectPanel
        title={`${selectedClips.length} Clips Selected`}
        actions={clipActions}
        className={clipPanelClass}
      >
        <div className="flex h-full w-full flex-col text-xs text-studio-fg p-3 overflow-y-auto no-scrollbar select-none">
          <div className="py-2.5 border-b border-studio-border flex items-center gap-2 text-studio-muted">
            <Layers className="h-3.5 w-3.5 text-studio-muted shrink-0" />
            <span>Multi-selection ({selectedClips.length} clips)</span>
          </div>

          {/* Group Opacity Slider */}
          <div className="py-2.5 border-b border-studio-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-studio-muted font-medium">Group Opacity</span>
              <span className="font-mono text-xs text-studio-muted">Mixed</span>
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
          <button
            type="button"
            onClick={handleMultiDelete}
            className="mt-3 h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete {selectedClips.length} Clips
          </button>
        </div>
      </ProjectPanel>
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
        <Type className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  if (isElement)
    availableTabs.push({
      value: "element",
      label: "Shape",
      icon: (
        <Sparkles className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  if (clip.type !== "audio" && clip.type !== "text")
    availableTabs.push({
      value: "transform",
      label: "Transform",
      icon: (
        <Move className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  if (isVisual)
    availableTabs.push({
      value: "adjust",
      label: "Adjust",
      icon: (
        <Sliders className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  if (hasAudio)
    availableTabs.push({
      value: "audio",
      label: "Audio",
      icon: (
        <Volume2 className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  if (hasAudio)
    availableTabs.push({
      value: "speed",
      label: "Speed",
      icon: (
        <Gauge className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
      ),
    });
  availableTabs.push({
    value: "time",
    label: "Time",
    icon: (
      <Clock className="h-3.5 w-3.5 text-studio-muted shrink-0 group-data-[state=active]:text-studio-fg transition-colors" />
    ),
  });

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Clip Properties View */}
      <div className="h-full w-full">
        <ProjectPanel
          title={view === "clip" ? "Clip Properties" : clip.name}
          actions={clipActions}
          className={clipPanelClass}
        >
          <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto p-3 no-scrollbar"
          >
            {view === "clip" && (
              <p title={clip.name} className="mb-3 truncate text-xs font-medium text-studio-muted">
                {clip.name}
              </p>
            )}
            <Tabs
              defaultValue={isText ? "text" : isElement ? "element" : "transform"}
              value={activeInspectorTab}
              onValueChange={setActiveInspectorTab}
              variant="line"
            >
              {isNarrow ? (
                /* Categories for panels narrower than 420px. */
                <InspectorTabDropdown
                  tabs={availableTabs}
                  activeTab={activeInspectorTab}
                  onTabChange={setActiveInspectorTab}
                />
              ) : (
                /* Category tabs for panels at least 420px wide. */
                <TabList className="mb-3 flex w-full shrink-0 items-center gap-0 overflow-x-auto no-scrollbar">
                  {availableTabs.map((t) => (
                    <TabTrigger
                      key={t.value}
                      value={t.value}
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
        </ProjectPanel>
      </div>
    </div>
  );
}
