'use client';

import React from 'react';
import { Info } from 'lucide-react';

export interface ScreenRecordTabProps {
  includeSystemAudio: boolean;
  setIncludeSystemAudio: (val: boolean) => void;
  isRecording: boolean;
}

export function ScreenRecordTab({
  includeSystemAudio,
  setIncludeSystemAudio,
  isRecording,
}: ScreenRecordTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-lg border border-studio-border bg-studio-topbar p-2.5 text-[11px] text-studio-muted">
        <Info className="h-4 w-4 text-selection shrink-0 mt-0.5" />
        <span>Available screen, tab, and audio capture options are controlled directly by your web browser popup.</span>
      </div>

      <div className="flex items-center justify-between border-t border-b border-studio-border py-2">
        <label className="text-xs font-medium text-studio-fg">Request System Audio</label>
        <input
          type="checkbox"
          checked={includeSystemAudio}
          onChange={(e) => setIncludeSystemAudio(e.target.checked)}
          disabled={isRecording}
          className="h-4 w-4 rounded accent-brand"
        />
      </div>
    </div>
  );
}
