'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { StudioPanel } from '@/shared/components/layout/StudioPanel';
import { Tabs, TabList, TabTrigger, TabContent } from '@/shared/components/ui/Tabs';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/Slider';
import { TransformTab } from './TransformTab';
import { AdjustTab } from './AdjustTab';
import { AudioTab } from './AudioTab';
import { SpeedTab } from './SpeedTab';
import { TimeTab } from './TimeTab';
import { CanvasSettingsPanel } from './CanvasSettingsPanel';
import { LayerOperations } from './LayerOperations';
import { TextInspectorTab } from '@/modules/editor/features/text';
import { ElementInspectorTab } from '@/modules/editor/features/elements';
import { Trash2, Layers, ChevronDown, Check, Type, Sparkles, Move, Sliders, Volume2, Gauge, Clock } from 'lucide-react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeTabObj = tabs.find((t) => t.value === activeTab) || tabs[0];

  return (
    <div ref={dropdownRef} className="relative w-full mb-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-9 w-full items-center justify-between rounded-lg border bg-studio-panel px-3 text-xs transition-all cursor-pointer select-none ${
          isOpen ? 'border-brand ring-1 ring-brand/50 shadow-md' : 'border-studio-border hover:border-brand/50'
        }`}
      >
        <span className="flex items-center gap-2 font-semibold text-studio-fg">
          {activeTabObj?.icon}
          <span>{activeTabObj?.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-studio-muted shrink-0 transition-transform ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-studio-border bg-studio-panel p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-80">
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
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand/20 text-brand font-bold border border-brand/40'
                      : 'text-studio-fg hover:bg-studio-panel-raised hover:text-brand'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    {t.icon}
                    <span>{t.label}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand shrink-0 ml-2" />}
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
  const {
    selectedClipIds,
    clearSelection,
    activeInspectorTab,
    setActiveInspectorTab,
    inspectorMode,
    setInspectorMode,
    leftPanelWidth,
  } = useEditorUIStore();
  const { currentProject, deleteClips, updateClip } = useProjectStore();

  const [isNarrow, setIsNarrow] = useState(leftPanelWidth < 360);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsNarrow(leftPanelWidth < 360);
  }, [leftPanelWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 360);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // When selected clip changes, automatically switch to clip inspector mode and seek playhead
  const selectedClipKey = selectedClipIds.join(',');
  useEffect(() => {
    if (selectedClipIds.length > 0) {
      setInspectorMode('clip');
      const clips = useProjectStore.getState().currentProject?.tracks.flatMap((t) => t.clips) || [];
      const firstClip = clips.find((c) => selectedClipIds.includes(c.id));
      if (firstClip) {
        if (firstClip.type === 'text') {
          setActiveInspectorTab('text');
        } else if (firstClip.type === 'overlay') {
          setActiveInspectorTab('element');
        } else if (firstClip.type === 'audio') {
          setActiveInspectorTab('audio');
        } else {
          setActiveInspectorTab('transform');
        }

        // Auto-seek playhead to selected clip start if playhead is out of bounds
        const playhead = usePlaybackStore.getState().playhead;
        const clipEnd = firstClip.timelineStart + firstClip.timelineDuration;
        if (playhead < firstClip.timelineStart || playhead >= clipEnd) {
          usePlaybackStore.getState().setPlayhead(firstClip.timelineStart);
        }
      }
    }
  }, [selectedClipKey, setInspectorMode, setActiveInspectorTab]);

  if (!currentProject) return null;

  // Single clip selection
  const selectedClips = currentProject.tracks
    .flatMap((t) => t.clips)
    .filter((c) => selectedClipIds.includes(c.id));

  // Render Canvas settings if mode is 'canvas' or no clips selected
  if (inspectorMode === 'canvas' || selectedClips.length === 0) {
    return (
      <StudioPanel
        title="Canvas Settings"
        actions={
          selectedClips.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInspectorMode('clip')}
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
            onClick={() => setInspectorMode('canvas')}
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
            <span>Multi-selection mode. Controls apply to all {selectedClips.length} selected clips simultaneously.</span>
          </div>

          {/* Group Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-studio-muted">Group Opacity</label>
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
          <Button size="sm" variant="ghost" onClick={handleMultiDelete} className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" /> Delete Selected Clips
          </Button>
        </div>
      </StudioPanel>
    );
  }

  // Single clip inspector
  const clip = selectedClips[0];
  const isVisual = clip.type === 'video' || clip.type === 'image' || clip.type === 'overlay';
  const hasAudio = clip.type === 'video' || clip.type === 'audio';
  const isText = clip.type === 'text';
  const isElement = clip.type === 'overlay';

  // Build available inspector tabs
  const availableTabs: InspectorTabItem[] = [];
  if (isText) availableTabs.push({ value: 'text', label: 'Text', icon: <Type className="h-3.5 w-3.5 text-brand shrink-0" /> });
  if (isElement) availableTabs.push({ value: 'element', label: 'Shape', icon: <Sparkles className="h-3.5 w-3.5 text-brand shrink-0" /> });
  if (clip.type !== 'audio' && clip.type !== 'text') availableTabs.push({ value: 'transform', label: 'Transform', icon: <Move className="h-3.5 w-3.5 text-brand shrink-0" /> });
  if (isVisual) availableTabs.push({ value: 'adjust', label: 'Adjust', icon: <Sliders className="h-3.5 w-3.5 text-brand shrink-0" /> });
  if (hasAudio) availableTabs.push({ value: 'audio', label: 'Audio', icon: <Volume2 className="h-3.5 w-3.5 text-brand shrink-0" /> });
  if (hasAudio) availableTabs.push({ value: 'speed', label: 'Speed', icon: <Gauge className="h-3.5 w-3.5 text-brand shrink-0" /> });
  availableTabs.push({ value: 'time', label: 'Time', icon: <Clock className="h-3.5 w-3.5 text-brand shrink-0" /> });

  return (
    <StudioPanel
      title={clip.name}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectorMode('canvas')}
          className="h-7 px-2 text-[10px] font-semibold cursor-pointer shrink-0 whitespace-nowrap"
        >
          Canvas Settings
        </Button>
      }
      className="h-full w-full"
    >
      <div ref={containerRef} className="h-full w-full overflow-y-auto p-3 studio-scrollbar">
        <Tabs defaultValue={isText ? 'text' : isElement ? 'element' : 'transform'} value={activeInspectorTab} onValueChange={setActiveInspectorTab}>
          {isNarrow ? (
            /* Custom Responsive Dropdown when panel is narrow (< 340px) */
            <InspectorTabDropdown
              tabs={availableTabs}
              activeTab={activeInspectorTab}
              onTabChange={setActiveInspectorTab}
            />
          ) : (
            /* Horizontal Tabs Bar when panel width is wide (>= 360px) */
            <TabList className="flex items-center gap-0.5 overflow-x-auto studio-scrollbar mb-4 bg-studio-topbar p-1 rounded-lg border border-studio-border shrink-0">
              {availableTabs.map((t) => (
                <TabTrigger key={t.value} value={t.value} className="flex-1 text-[11px] py-1 px-1 justify-center whitespace-nowrap cursor-pointer">
                  {t.label}
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

          {clip.type !== 'audio' && clip.type !== 'text' && (
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

        {/* Layer Ordering and Lock Operations */}
        <LayerOperations clip={clip} />
      </div>
    </StudioPanel>
  );
}
