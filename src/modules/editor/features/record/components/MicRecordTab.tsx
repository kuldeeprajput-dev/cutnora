'use client';

import React from 'react';
import { Select } from '@/shared/components/ui/Select';
import { Mic } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface MediaDeviceItem {
  deviceId: string;
  label: string;
}

export interface MicRecordTabProps {
  audioInputDevices: MediaDeviceItem[];
  selectedAudioDevice: string;
  setSelectedAudioDevice: (id: string) => void;
  isRecording: boolean;
  recordDuration: number;
  formatTimer: (sec: number) => string;
}

export function MicRecordTab({
  audioInputDevices,
  selectedAudioDevice,
  setSelectedAudioDevice,
  isRecording,
  recordDuration,
  formatTimer,
}: MicRecordTabProps) {
  return (
    <div className="flex flex-col gap-3">
      {audioInputDevices.length > 0 && (
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1.5">Microphone Input</label>
          <Select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            disabled={isRecording}
            className="h-9 text-xs border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white rounded-xl"
          >
            {audioInputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-3.5 min-h-[160px]">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-all',
            isRecording
              ? 'bg-rose-500/15 border border-rose-500/40 text-rose-500 animate-pulse shadow-[0_0_16px_rgba(244,63,94,0.25)]'
              : 'bg-white/5 border border-white/10 text-white/80'
          )}
        >
          <Mic className="h-5 w-5" />
        </div>

        {isRecording ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              REC {formatTimer(recordDuration)}
            </div>
            <span className="text-[11px] text-studio-muted">Speak clearly into your microphone...</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs font-semibold text-white tracking-wide">Voiceover Recording</span>
            <p className="text-[11px] text-studio-muted mt-1">Click below to start narration recording.</p>
          </div>
        )}
      </div>
    </div>
  );
}
