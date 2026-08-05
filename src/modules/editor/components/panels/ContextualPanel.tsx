'use client';

import React from 'react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { StudioPanel } from '@/shared/components/layout/StudioPanel';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { MediaLibraryPanel } from '@/modules/editor/features/media-library';
import { InspectorPanel, CanvasSettingsPanel } from '@/modules/editor/features/inspector';
import { TextPanel } from '@/modules/editor/features/text';
import { ElementsPanel } from '@/modules/editor/features/elements';
import { Mic } from 'lucide-react';

export function ContextualPanel() {
  const { activeTool, selectedClipIds } = useEditorUIStore();

  // If clips are selected, priority goes to the Inspector Panel
  if (selectedClipIds.length > 0) {
    return <InspectorPanel />;
  }

  const renderContent = () => {
    switch (activeTool) {
      case 'media':
      case 'videos':
      case 'images':
      case 'audio':
        return <MediaLibraryPanel />;

      case 'text':
        return <TextPanel />;

      case 'elements':
        return <ElementsPanel />;

      case 'canvas':
        return (
          <div className="p-4">
            <CanvasSettingsPanel />
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
      case 'elements':
        return 'Shapes & Graphics';
      case 'canvas':
        return 'Canvas Settings';
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
