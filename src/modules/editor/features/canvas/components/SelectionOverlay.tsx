'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import type { TransformMode } from '../hooks/useTransformHandler';
import { RotateCw } from 'lucide-react';

export interface SelectionOverlayProps {
  clip: TimelineClip;
  stageScale: number;
  onStartTransform: (clip: TimelineClip, mode: TransformMode, e: React.PointerEvent) => void;
  isDragging?: boolean;
}

export function SelectionOverlay({ clip, onStartTransform, isDragging = false }: SelectionOverlayProps) {
  const handles: { mode: TransformMode; className: string }[] = [
    { mode: 'resize-nw', className: '-top-1.5 -left-1.5 cursor-nwse-resize' },
    { mode: 'resize-n', className: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { mode: 'resize-ne', className: '-top-1.5 -right-1.5 cursor-nesw-resize' },
    { mode: 'resize-e', className: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize' },
    { mode: 'resize-se', className: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
    { mode: 'resize-s', className: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { mode: 'resize-sw', className: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
    { mode: 'resize-w', className: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize' },
  ];

  return (
    <div
      id={`overlay-${clip.id}`}
      className="absolute inset-0 pointer-events-none border-2 border-selection z-30 select-none"
    >
      {/* Center Dot Indicator during drag */}
      {isDragging && (
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand shadow-md z-40" />
      )}

      {/* Rotation Handle - Positioned below top selection line */}
      <div
        onPointerDown={(e) => onStartTransform(clip, 'rotate', e)}
        className="pointer-events-auto absolute top-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-selection/40 bg-studio-topbar/90 backdrop-blur-sm text-selection hover:scale-110 cursor-grab active:cursor-grabbing transition-transform z-40 shadow-md"
        title="Click and drag to rotate"
      >
        <RotateCw className="h-3.5 w-3.5" />
      </div>

      {/* 8 Resize Handles */}
      {handles.map((h) => (
        <div
          key={h.mode}
          onPointerDown={(e) => onStartTransform(clip, h.mode, e)}
          className={`pointer-events-auto absolute h-3 w-3 rounded-sm border-2 border-studio-bg bg-selection shadow-sm z-40 hover:scale-125 transition-transform ${h.className}`}
        />
      ))}
    </div>
  );
}
