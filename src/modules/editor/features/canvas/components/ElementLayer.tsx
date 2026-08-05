'use client';

import React from 'react';
import type { TimelineClip } from '@/modules/editor/types';

export interface ElementLayerProps {
  clip: TimelineClip;
}

export function ElementLayer({ clip }: ElementLayerProps) {
  const elementStyle = clip.elementStyle || {
    fillColor: '#FF5A36',
    borderRadius: 8,
  };

  return (
    <div
      className="h-full w-full pointer-events-none"
      style={{
        backgroundColor: elementStyle.fillColor,
        border: elementStyle.strokeColor ? `${elementStyle.strokeWidth || 2}px solid ${elementStyle.strokeColor}` : undefined,
        borderRadius: `${elementStyle.borderRadius || 0}px`,
        opacity: clip.transform.opacity,
      }}
    />
  );
}
