'use client';

import React from 'react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { StudioPanel } from '@/shared/components/layout/StudioPanel';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { MediaLibraryPanel } from '@/modules/editor/features/media-library';
import { Type, Shapes, Mic } from 'lucide-react';

export function ContextualPanel() {
  const { activeTool } = useEditorUIStore();
  const { currentProject, updateProjectSettings } = useProjectStore();

  const renderContent = () => {
    switch (activeTool) {
      case 'media':
      case 'videos':
      case 'images':
      case 'audio':
        return <MediaLibraryPanel />;

      case 'text':
        return (
          <div className="flex flex-col gap-4 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9298A3]">Text Presets</h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="md" className="justify-start gap-2">
                <Type className="h-4 w-4 text-[#FF5A36]" />
                <span className="font-bold">Add Heading</span>
              </Button>
              <Button variant="secondary" size="md" className="justify-start gap-2">
                <Type className="h-4 w-4 text-[#F2C94C]" />
                <span className="font-semibold">Add Subtitle</span>
              </Button>
              <Button variant="secondary" size="md" className="justify-start gap-2">
                <Type className="h-4 w-4 text-[#9298A3]" />
                <span>Add Body Text</span>
              </Button>
            </div>
          </div>
        );

      case 'canvas':
        return (
          <div className="flex flex-col gap-4 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9298A3]">Canvas Settings</h3>
            <div>
              <label className="text-xs font-medium text-[#9298A3] block mb-1.5">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => (
                  <Button
                    key={ratio}
                    size="sm"
                    variant={currentProject?.settings.aspectRatio === ratio ? 'selection' : 'secondary'}
                    onClick={() => updateProjectSettings({ aspectRatio: ratio })}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'elements':
        return (
          <div className="flex flex-col gap-4 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9298A3]">Shapes & Overlays</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" className="justify-start gap-2">
                <Shapes className="h-4 w-4 text-[#FF5A36]" /> Rectangle
              </Button>
              <Button variant="secondary" size="sm" className="justify-start gap-2">
                <Shapes className="h-4 w-4 text-[#3478D4]" /> Circle
              </Button>
            </div>
          </div>
        );

      case 'record':
        return (
          <div className="flex flex-col gap-4 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9298A3]">Voiceover Recorder</h3>
            <EmptyState
              title="Record Voiceover"
              description="Click below to record narration directly into your project."
              icon={<Mic className="h-8 w-8 text-[#FF5A36]" />}
              action={
                <Button size="sm" variant="primary">
                  Start Recording
                </Button>
              }
            />
          </div>
        );

      default:
        return <MediaLibraryPanel />;
    }
  };

  const getPanelTitle = () => {
    switch (activeTool) {
      case 'text':
        return 'Text Layers';
      case 'canvas':
        return 'Canvas Settings';
      case 'elements':
        return 'Shapes & Graphics';
      case 'record':
        return 'Recorder';
      case 'videos':
        return 'Video Assets';
      case 'images':
        return 'Image Assets';
      case 'audio':
        return 'Audio Tracks';
      case 'media':
      default:
        return 'Media Library';
    }
  };

  return (
    <StudioPanel title={getPanelTitle()} className="h-full w-full border-r-0 border-t-0 border-b-0">
      {renderContent()}
    </StudioPanel>
  );
}
