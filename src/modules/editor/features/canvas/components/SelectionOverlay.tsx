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

export function SelectionOverlay({ clip, stageScale, onStartTransform, isDragging = false }: SelectionOverlayProps) {
  const { transform } = clip;

  const left = transform.x * stageScale;
  const top = transform.y * stageScale;
  const width = transform.width * stageScale;
  const height = transform.height * stageScale;

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
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${transform.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      className="pointer-events-none border-2 border-[#F2C94C] z-30 select-none"
    >
      {/* Center Dot Indicator during drag */}
      {isDragging && (
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#FF5A36] shadow-md z-40" />
      )}

      {/* Rotation Handle */}
      <div
        onPointerDown={(e) => onStartTransform(clip, 'rotate', e)}
        className="pointer-events-auto absolute -top-7 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-[#2B2F38] bg-[#14161B] text-[#F2C94C] hover:scale-110 cursor-grab active:cursor-grabbing transition-transform z-40 shadow-sm"
        title="Click and drag to rotate"
      >
        <RotateCw className="h-3 w-3" />
      </div>

      {/* 8 Resize Handles */}
      {handles.map((h) => (
        <div
          key={h.mode}
          onPointerDown={(e) => onStartTransform(clip, h.mode, e)}
          className={`pointer-events-auto absolute h-3 w-3 rounded-sm border-2 border-[#101216] bg-[#F2C94C] shadow-sm z-40 hover:scale-125 transition-transform ${h.className}`}
        />
      ))}
    </div>
  );
}
