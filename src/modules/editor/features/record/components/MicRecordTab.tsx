'use client';

import React from 'react';
import { Select } from '@/shared/components/ui/Select';
import { Mic } from 'lucide-react';

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
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Microphone Input</label>
          <Select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            disabled={isRecording}
            className="h-8 text-xs border-studio-border"
          >
            {audioInputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-studio-border bg-studio-topbar p-4 flex flex-col items-center justify-center gap-3 min-h-[140px]">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isRecording ? 'bg-brand/20 text-brand animate-pulse' : 'bg-studio-panel-raised text-studio-muted'
          }`}
        >
          <Mic className="h-6 w-6" />
        </div>

        {isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand">
              <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
              REC {formatTimer(recordDuration)}
            </div>
            <span className="text-[10px] text-studio-muted">Speak clearly into your microphone...</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs font-semibold text-studio-fg">Voiceover Recording</span>
            <p className="text-[10px] text-studio-muted mt-0.5">Click below to start narration recording.</p>
          </div>
        )}
      </div>
    </div>
  );
}
