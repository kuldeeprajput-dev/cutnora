'use client';

import React from 'react';
import type { Track, TimelineClip } from '@/modules/editor/types';
import { TimelineClipItem } from './TimelineClipItem';

export interface TrackLaneProps {
  track: Track;
  zoom: number; // Px per second
  totalWidthPx: number;
  onStartDragClip: (clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end', e: React.PointerEvent) => void;
}

export function TrackLane({ track, zoom, totalWidthPx, onStartDragClip }: TrackLaneProps) {
  return (
    <div
      style={{ width: `${totalWidthPx}px` }}
      className="relative h-12 border-b border-[#2B2F38]/60 bg-[#1C1F25] select-none"
    >
      {track.clips.map((clip) => (
        <TimelineClipItem
          key={clip.id}
          clip={clip}
          track={track}
          zoom={zoom}
          onStartDrag={onStartDragClip}
        />
      ))}
    </div>
  );
}
