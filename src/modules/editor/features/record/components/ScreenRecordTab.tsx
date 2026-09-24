import React from 'react';
import { Info, Check } from 'lucide-react';

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
      <div className="flex items-start gap-2.5 rounded-xl border border-studio-border bg-studio-panel-raised/50 p-3 text-[11px] text-studio-muted leading-relaxed">
        <Info className="h-4 w-4 text-studio-muted shrink-0 mt-0.5" />
        <span>Available screen, tab, and audio capture options are controlled directly by your web browser popup.</span>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-studio-border bg-studio-panel-raised/50 p-3.5 cursor-pointer hover:bg-studio-hover transition-colors select-none">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-studio-fg">Request System Audio</span>
          <span className="text-[10px] text-studio-muted">Capture computer audio alongside screen stream</span>
        </div>
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={includeSystemAudio}
            onChange={(e) => setIncludeSystemAudio(e.target.checked)}
            disabled={isRecording}
            className="sr-only peer"
          />
          <div className="h-4.5 w-4.5 rounded-md border border-studio-border bg-studio-panel-raised peer-checked:bg-studio-fg peer-checked:border-studio-fg transition-all flex items-center justify-center">
            {includeSystemAudio && <Check className="h-3 w-3 text-studio-bg stroke-[3]" />}
          </div>
        </div>
      </label>
    </div>
  );
}
