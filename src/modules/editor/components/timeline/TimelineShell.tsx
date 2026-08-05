'use client';

import React from 'react';
import { TimelineEditor } from '@/modules/editor/features/timeline';

export function TimelineShell() {
  return (
    <div className="h-full w-full overflow-hidden bg-timeline-bg">
      <TimelineEditor />
    </div>
  );
}
