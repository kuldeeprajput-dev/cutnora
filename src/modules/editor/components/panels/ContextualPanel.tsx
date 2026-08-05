'use client';

import React from 'react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { StudioPanel } from '@/shared/components/layout/StudioPanel';
import { MediaLibraryPanel } from '@/modules/editor/features/media-library';
import { InspectorPanel, CanvasSettingsPanel } from '@/modules/editor/features/inspector';
import { TextPanel } from '@/modules/editor/features/text';
import { ElementsPanel } from '@/modules/editor/features/elements';
import { RecordPanel } from '@/modules/editor/features/record/components/RecordPanel';

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
        return <RecordPanel />;

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
