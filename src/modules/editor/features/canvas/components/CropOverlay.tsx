'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Check, X } from 'lucide-react';

export interface CropOverlayProps {
  clip: TimelineClip;
  stageScale: number;
}

export function CropOverlay({ clip, stageScale }: CropOverlayProps) {
  const { setActiveTool } = useEditorUIStore();
  const { updateClip } = useProjectStore();

  const handleApplyCrop = () => {
    // Commit current crop settings
    setActiveTool('select');
  };

  const handleCancelCrop = () => {
    // Reset crop to default
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        crop: undefined,
      },
    });
    setActiveTool('select');
  };

  const left = clip.transform.x * stageScale;
  const top = clip.transform.y * stageScale;
  const width = clip.transform.width * stageScale;
  const height = clip.transform.height * stageScale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="pointer-events-auto border-2 border-dashed border-[#FF5A36] z-50 select-none bg-black/40 flex flex-col justify-between p-2"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-white bg-black/75 px-2 py-1 rounded">
        <span>Crop Mode</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleCancelCrop} className="h-6 px-1.5 text-xs text-[#E45858]">
            <X className="h-3 w-3" /> Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleApplyCrop} className="h-6 px-1.5 text-xs">
            <Check className="h-3 w-3" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
}
