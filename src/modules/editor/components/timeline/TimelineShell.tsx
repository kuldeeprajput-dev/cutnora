'use client';

import React from 'react';
import { Magnet, ZoomIn, ZoomOut, Plus, Film } from 'lucide-react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Slider } from '@/shared/components/ui/Slider';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Button } from '@/shared/components/ui/Button';

export function TimelineShell() {
  const { zoom, setZoom, snappingEnabled, setSnappingEnabled } = useEditorUIStore();
  const { currentProject, addTrack } = useProjectStore();

  const tracks = currentProject?.tracks || [];
  const hasClips = tracks.some((t) => t.clips.length > 0);

  return (
    <div className="flex h-full w-full flex-col bg-[#1C1F25] text-[#F4F5F7] select-none border-t border-[#2B2F38]">
      {/* Timeline Toolbar Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#2B2F38] bg-[#14161B] px-4">
        {/* Left: Track Controls */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addTrack('video')}>
            <Plus className="h-3.5 w-3.5" /> Add Track
          </Button>
        </div>

        {/* Right: Snapping & Zoom Controls */}
        <div className="flex items-center gap-4">
          <IconButton
            label={snappingEnabled ? 'Disable snapping' : 'Enable snapping'}
            size="sm"
            variant={snappingEnabled ? 'selection' : 'ghost'}
            onClick={() => setSnappingEnabled(!snappingEnabled)}
          >
            <Magnet className="h-3.5 w-3.5" />
          </IconButton>

          <div className="flex items-center gap-2 w-36">
            <ZoomOut className="h-3.5 w-3.5 text-[#9298A3]" />
            <Slider value={zoom} min={10} max={200} step={5} onValueChange={setZoom} />
            <ZoomIn className="h-3.5 w-3.5 text-[#9298A3]" />
          </div>
        </div>
      </div>

      {/* Main Timeline Workspace Body */}
      <div className="flex-1 overflow-auto p-4 flex flex-col justify-center">
        {!hasClips ? (
          <EmptyState
            title="No media added to timeline yet"
            description="Import assets from the media library to start building your video composition."
            icon={<Film className="h-10 w-10 text-[#9298A3]" />}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {tracks.map((track) => (
              <div key={track.id} className="flex h-10 rounded border border-[#2B2F38] bg-[#171A20] items-center px-3 justify-between">
                <span className="text-xs font-semibold text-[#9298A3]">{track.name}</span>
                <span className="text-[11px] text-[#6F716F]">{track.clips.length} clips</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
