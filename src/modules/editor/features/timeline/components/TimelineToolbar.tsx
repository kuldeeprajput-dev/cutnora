'use client';

import React from 'react';
import { Scissors, Copy, Trash2, Magnet, ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/Slider';
import { formatTimecode } from '../utils/ruler-utils';

export function TimelineToolbar() {
  const { selectedClipIds, zoom, setZoom, snappingEnabled, setSnappingEnabled } = useEditorUIStore();
  const { playhead, duration, fps } = usePlaybackStore();
  const { currentProject, splitClip, duplicateClips, deleteClips, addTrack } = useProjectStore();

  const hasSelection = selectedClipIds.length > 0;

  const handleSplit = () => {
    if (selectedClipIds.length > 0) {
      selectedClipIds.forEach((id) => splitClip(id, playhead));
    }
  };

  const handleDuplicate = () => {
    if (selectedClipIds.length > 0) {
      duplicateClips(selectedClipIds);
    }
  };

  const handleDelete = () => {
    if (selectedClipIds.length > 0) {
      deleteClips(selectedClipIds);
      useEditorUIStore.getState().clearSelection();
    }
  };

  const handleFitTimeline = () => {
    if (!currentProject) return;
    const projDuration = currentProject.settings.duration || 10;
    // Calculate zoom level to fit entire timeline inside 1000px
    const fitZoom = Math.max(10, Math.min(200, Math.floor(800 / projDuration)));
    setZoom(fitZoom);
  };

  return (
    <div className="flex h-10 w-full shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar px-3 select-none">
      {/* Left: Edit Actions (Split, Duplicate, Delete, Add Track) */}
      <div className="flex items-center gap-1">
        <IconButton
          label="Split clip at playhead (S)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleSplit}
        >
          <Scissors className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Duplicate selection (Ctrl+D)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDuplicate}
        >
          <Copy className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Delete selection (Delete)"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </IconButton>

        <div className="mx-1.5 h-4 w-px bg-studio-border" />

        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => addTrack('video')}>
          <Plus className="h-3.5 w-3.5" /> Add Track
        </Button>
      </div>

      {/* Center: Playhead Timecode & Duration */}
      <div className="font-mono text-xs font-semibold text-studio-fg">
        <span>{formatTimecode(playhead, fps, true)}</span>
        <span className="text-studio-muted mx-1">/</span>
        <span className="text-studio-muted">{formatTimecode(duration, fps, false)}</span>
      </div>

      {/* Right: Snapping & Zoom Controls */}
      <div className="flex items-center gap-3">
        <IconButton
          label={snappingEnabled ? 'Disable snapping (Hold Alt)' : 'Enable snapping'}
          size="sm"
          variant={snappingEnabled ? 'selection' : 'ghost'}
          onClick={() => setSnappingEnabled(!snappingEnabled)}
        >
          <Magnet className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton label="Fit timeline to view" size="sm" variant="ghost" onClick={handleFitTimeline}>
          <Maximize2 className="h-3.5 w-3.5" />
        </IconButton>

        <div className="flex items-center gap-1.5 w-32">
          <IconButton label="Zoom out" size="sm" variant="ghost" onClick={() => setZoom(zoom - 10)}>
            <ZoomOut className="h-3.5 w-3.5 text-studio-muted" />
          </IconButton>
          <Slider value={zoom} min={10} max={200} step={5} onValueChange={setZoom} />
          <IconButton label="Zoom in" size="sm" variant="ghost" onClick={() => setZoom(zoom + 10)}>
            <ZoomIn className="h-3.5 w-3.5 text-studio-muted" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
