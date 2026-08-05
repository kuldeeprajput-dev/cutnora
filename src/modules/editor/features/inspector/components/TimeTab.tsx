'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Move, Scissors } from 'lucide-react';

export interface TimeTabProps {
  clip: TimelineClip;
}

export function TimeTab({ clip }: TimeTabProps) {
  const { moveClip, trimClip } = useProjectStore();
  const { playhead } = usePlaybackStore();

  const handleMoveToPlayhead = () => {
    moveClip(clip.id, clip.trackId, playhead);
  };

  const handleTrimStartToPlayhead = () => {
    if (playhead <= clip.timelineStart || playhead >= clip.timelineStart + clip.timelineDuration) return;
    const newStart = playhead;
    const newDuration = (clip.timelineStart + clip.timelineDuration) - playhead;
    const delta = playhead - clip.timelineStart;
    const newSourceStart = clip.sourceStart + delta * clip.speed;
    trimClip(clip.id, newStart, newDuration, newSourceStart);
  };

  const handleTrimEndToPlayhead = () => {
    if (playhead <= clip.timelineStart || playhead >= clip.timelineStart + clip.timelineDuration) return;
    const newDuration = playhead - clip.timelineStart;
    trimClip(clip.id, clip.timelineStart, newDuration, clip.sourceStart);
  };

  return (
    <div className="flex flex-col gap-4 text-studio-fg">
      {/* Playhead Actions */}
      <div>
        <label className="text-[11px] font-medium text-studio-muted block mb-2">Playhead Alignment</label>
        <div className="flex flex-col gap-1.5">
          <Button size="sm" variant="secondary" onClick={handleMoveToPlayhead} className="justify-start gap-2 text-xs">
            <Move className="h-3.5 w-3.5 text-brand" /> Move Clip Start to Playhead
          </Button>
          <Button size="sm" variant="secondary" onClick={handleTrimStartToPlayhead} className="justify-start gap-2 text-xs">
            <Scissors className="h-3.5 w-3.5 text-selection" /> Trim Start to Playhead
          </Button>
          <Button size="sm" variant="secondary" onClick={handleTrimEndToPlayhead} className="justify-start gap-2 text-xs">
            <Scissors className="h-3.5 w-3.5 text-mkt-info" /> Trim End to Playhead
          </Button>
        </div>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Timeline Timing Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Timeline Start (s)</label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={clip.timelineStart}
            onChange={(e) => moveClip(clip.id, clip.trackId, Math.max(0, parseFloat(e.target.value) || 0))}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Timeline Duration (s)</label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={clip.timelineDuration}
            onChange={(e) => {
              const dur = Math.max(0.1, parseFloat(e.target.value) || 1);
              trimClip(clip.id, clip.timelineStart, dur, clip.sourceStart);
            }}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Source Media Trims */}
      {clip.assetId && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-studio-muted block mb-1">Source Start (s)</label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={clip.sourceStart}
              onChange={(e) => {
                const sStart = Math.max(0, parseFloat(e.target.value) || 0);
                trimClip(clip.id, clip.timelineStart, clip.timelineDuration, sStart);
              }}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-studio-muted block mb-1">Source End (s)</label>
            <Input
              type="number"
              disabled
              value={(clip.sourceStart + clip.sourceDuration).toFixed(1)}
              className="h-8 text-xs font-mono opacity-60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
