'use client';

import React, { useState, useEffect } from 'react';
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
import { Trash2, Layers } from 'lucide-react';

import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';

export function InspectorPanel() {
  const {
    selectedClipIds,
    clearSelection,
    activeInspectorTab,
    setActiveInspectorTab,
    inspectorMode,
    setInspectorMode,
  } = useEditorUIStore();
  const { currentProject, deleteClips, updateClip } = useProjectStore();

  // When selected clip changes, automatically switch to clip inspector mode and seek playhead
  useEffect(() => {
    if (selectedClipIds.length > 0) {
      setInspectorMode('clip');
      const clips = currentProject?.tracks.flatMap((t) => t.clips) || [];
      const firstClip = clips.find((c) => selectedClipIds.includes(c.id));
      if (firstClip) {
        if (firstClip.type === 'text') {
          setActiveInspectorTab('text');
        } else if (firstClip.type === 'overlay') {
          setActiveInspectorTab('element');
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
  }, [selectedClipIds, currentProject, setInspectorMode, setActiveInspectorTab]);

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
              className="h-7 px-2.5 text-[11px] font-semibold cursor-pointer"
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
            className="h-7 px-2 text-[10px] font-semibold cursor-pointer"
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

  return (
    <StudioPanel
      title={clip.name}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectorMode('canvas')}
          className="h-7 px-2 text-[10px] font-semibold cursor-pointer"
        >
          Canvas Settings
        </Button>
      }
      className="h-full w-full"
    >
      <div className="h-full w-full overflow-y-auto p-3 studio-scrollbar">
        <Tabs defaultValue={isText ? 'text' : isElement ? 'element' : 'transform'} value={activeInspectorTab} onValueChange={setActiveInspectorTab}>
          <TabList className="flex items-center gap-1 overflow-x-auto studio-scrollbar mb-4 bg-studio-topbar p-1 rounded-lg border border-studio-border shrink-0">
            {isText && <TabTrigger value="text" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Text</TabTrigger>}
            {isElement && <TabTrigger value="element" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Shape</TabTrigger>}
            <TabTrigger value="transform" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Transform</TabTrigger>
            {isVisual && <TabTrigger value="adjust" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Adjust</TabTrigger>}
            {hasAudio && <TabTrigger value="audio" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Audio</TabTrigger>}
            {hasAudio && <TabTrigger value="speed" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Speed</TabTrigger>}
            <TabTrigger value="time" className="flex-1 min-w-max text-xs py-1 px-2.5 cursor-pointer">Time</TabTrigger>
          </TabList>

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

          <TabContent value="transform">
            <TransformTab clip={clip} />
          </TabContent>

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
