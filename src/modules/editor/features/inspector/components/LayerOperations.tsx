'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { Button } from '@/shared/components/ui/Button';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Copy, Lock, Eye, Trash2 } from 'lucide-react';

export interface LayerOperationsProps {
  clip: TimelineClip;
}

export function LayerOperations({ clip }: LayerOperationsProps) {
  const { currentProject, duplicateClips, deleteClips, reorderTracks } = useProjectStore();
  const { clearSelection } = useEditorUIStore();

  const track = currentProject?.tracks.find((t) => t.id === clip.trackId);
  const trackIndex = currentProject?.tracks.findIndex((t) => t.id === clip.trackId) ?? 0;
  const totalTracks = currentProject?.tracks.length ?? 1;

  const handleBringForward = () => {
    if (trackIndex < totalTracks - 1) {
      reorderTracks(trackIndex, trackIndex + 1);
    }
  };

  const handleSendBackward = () => {
    if (trackIndex > 0) {
      reorderTracks(trackIndex, trackIndex - 1);
    }
  };

  const handleBringToFront = () => {
    if (trackIndex < totalTracks - 1) {
      reorderTracks(trackIndex, totalTracks - 1);
    }
  };

  const handleSendToBack = () => {
    if (trackIndex > 0) {
      reorderTracks(trackIndex, 0);
    }
  };

  const handleDuplicate = () => {
    duplicateClips([clip.id]);
  };

  const handleDelete = () => {
    deleteClips([clip.id]);
    clearSelection();
  };

  const handleToggleLockTrack = () => {
    if (!track) return;
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.locked = !t.locked;
      }
    });
  };

  const handleToggleHideTrack = () => {
    if (!track) return;
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.hidden = !t.hidden;
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 text-studio-fg border-t border-studio-border pt-4 mt-4">
      <label className="text-[11px] font-medium text-studio-muted">Layer Operations</label>

      {/* Z-Index / Track Reorder */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={handleBringForward} disabled={trackIndex >= totalTracks - 1} className="text-xs justify-start gap-1.5">
          <ArrowUp className="h-3.5 w-3.5 text-brand" /> Bring Forward
        </Button>
        <Button size="sm" variant="secondary" onClick={handleSendBackward} disabled={trackIndex <= 0} className="text-xs justify-start gap-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-mkt-info" /> Send Backward
        </Button>
        <Button size="sm" variant="secondary" onClick={handleBringToFront} disabled={trackIndex >= totalTracks - 1} className="text-xs justify-start gap-1.5">
          <ChevronsUp className="h-3.5 w-3.5 text-brand" /> Bring to Front
        </Button>
        <Button size="sm" variant="secondary" onClick={handleSendToBack} disabled={trackIndex <= 0} className="text-xs justify-start gap-1.5">
          <ChevronsDown className="h-3.5 w-3.5 text-mkt-info" /> Send to Back
        </Button>
      </div>

      {/* Duplicate, Lock, Hide, Delete */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={handleDuplicate} className="text-xs justify-start gap-1.5">
          <Copy className="h-3.5 w-3.5 text-selection" /> Duplicate
        </Button>
        <Button size="sm" variant="secondary" onClick={handleToggleLockTrack} className="text-xs justify-start gap-1.5">
          <Lock className="h-3.5 w-3.5" /> {track?.locked ? 'Unlock Track' : 'Lock Track'}
        </Button>
        <Button size="sm" variant="secondary" onClick={handleToggleHideTrack} className="text-xs justify-start gap-1.5">
          <Eye className="h-3.5 w-3.5" /> {track?.hidden ? 'Show Track' : 'Hide Track'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} className="text-xs justify-start gap-1.5 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" /> Delete Clip
        </Button>
      </div>
    </div>
  );
}
