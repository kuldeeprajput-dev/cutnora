'use client';

import React from 'react';
import { TimelineEditor } from '@/modules/editor/features/timeline';

export function TimelineShell() {
  return (
    <div className="h-full w-full overflow-hidden bg-[#1C1F25]">
      <TimelineEditor />
    </div>
  );
}
