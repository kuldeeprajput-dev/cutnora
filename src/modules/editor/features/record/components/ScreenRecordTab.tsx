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
      <div className="flex items-start gap-2 rounded-lg border border-[#2B2F38] bg-[#14161B] p-2.5 text-[11px] text-[#9298A3]">
        <Info className="h-4 w-4 text-[#F2C94C] shrink-0 mt-0.5" />
        <span>Available screen, tab, and audio capture options are controlled directly by your web browser popup.</span>
      </div>

      <div className="flex items-center justify-between border-t border-b border-[#2B2F38] py-2">
        <label className="text-xs font-medium text-[#F4F5F7]">Request System Audio</label>
        <input
          type="checkbox"
          checked={includeSystemAudio}
          onChange={(e) => setIncludeSystemAudio(e.target.checked)}
          disabled={isRecording}
          className="h-4 w-4 rounded accent-[#FF5A36]"
        />
      </div>
    </div>
  );
}
