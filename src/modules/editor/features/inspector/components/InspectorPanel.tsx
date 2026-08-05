'use client';

import React, { useState } from 'react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { StudioPanel } from '@/shared/components/layout/StudioPanel';
import { Tabs, TabList, TabTrigger, TabContent } from '@/shared/components/ui/Tabs';
import { EmptyState } from '@/shared/components/ui/EmptyState';
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
import { MousePointer, Trash2, Layers } from 'lucide-react';

export function InspectorPanel() {
  const { selectedClipIds, activeTool, clearSelection } = useEditorUIStore();
  const { currentProject, deleteClips, updateClip } = useProjectStore();
  const [activeTab, setActiveTab] = useState('transform');

  if (!currentProject) return null;

  // Single clip selection
  const selectedClips = currentProject.tracks
    .flatMap((t) => t.clips)
    .filter((c) => selectedClipIds.includes(c.id));

  // Render Canvas settings when Canvas tool is active with no selection
  if (activeTool === 'canvas' && selectedClips.length === 0) {
    return (
      <StudioPanel title="Canvas Settings" className="h-full w-full">
        <CanvasSettingsPanel />
      </StudioPanel>
    );
  }

  // Empty selection state
  if (selectedClips.length === 0) {
    return (
      <StudioPanel title="Inspector" className="h-full w-full">
        <EmptyState
          title="No clip selected"
          description="Click a clip on the canvas stage or timeline to inspect and tweak its transform, filters, volume, and timing properties."
          icon={<MousePointer className="h-8 w-8 text-[#9298A3]" />}
        />
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
      <StudioPanel title={`${selectedClips.length} Clips Selected`} className="h-full w-full">
        <div className="flex flex-col gap-4 text-[#F4F5F7]">
          <div className="flex items-center gap-2 rounded-lg border border-[#2B2F38] bg-[#171A20] p-3 text-xs text-[#9298A3]">
            <Layers className="h-4 w-4 text-[#F2C94C] shrink-0" />
            <span>Multi-selection mode. Controls apply to all {selectedClips.length} selected clips simultaneously.</span>
          </div>

          {/* Group Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-[#9298A3]">Group Opacity</label>
              <span className="font-mono text-xs text-[#F4F5F7]">Mixed</span>
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
          <Button size="sm" variant="ghost" onClick={handleMultiDelete} className="h-8 gap-1.5 text-xs text-[#E45858] hover:bg-[#E45858]/10">
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
    <StudioPanel title={clip.name} className="h-full w-full">
      <Tabs defaultValue={isText ? 'text' : isElement ? 'element' : 'transform'} value={activeTab} onValueChange={setActiveTab}>
        <TabList className="grid grid-cols-4 gap-1 mb-4 bg-[#14161B] p-1 rounded-lg border border-[#2B2F38]">
          {isText && <TabTrigger value="text" className="text-xs py-1">Text</TabTrigger>}
          {isElement && <TabTrigger value="element" className="text-xs py-1">Shape</TabTrigger>}
          <TabTrigger value="transform" className="text-xs py-1">Transform</TabTrigger>
          {isVisual && <TabTrigger value="adjust" className="text-xs py-1">Adjust</TabTrigger>}
          {hasAudio && <TabTrigger value="audio" className="text-xs py-1">Audio</TabTrigger>}
          {hasAudio && <TabTrigger value="speed" className="text-xs py-1">Speed</TabTrigger>}
          <TabTrigger value="time" className="text-xs py-1">Time</TabTrigger>
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
    </StudioPanel>
  );
}
