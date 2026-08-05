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
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Microphone Input</label>
          <Select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            disabled={isRecording}
            className="h-8 text-xs border-[#2B2F38]"
          >
            {audioInputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-[#2B2F38] bg-[#14161B] p-4 flex flex-col items-center justify-center gap-3 min-h-[140px]">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isRecording ? 'bg-[#FF5A36]/20 text-[#FF5A36] animate-pulse' : 'bg-[#1D2027] text-[#9298A3]'
          }`}
        >
          <Mic className="h-6 w-6" />
        </div>

        {isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF5A36]">
              <span className="h-2 w-2 rounded-full bg-[#FF5A36] animate-ping" />
              REC {formatTimer(recordDuration)}
            </div>
            <span className="text-[10px] text-[#9298A3]">Speak clearly into your microphone...</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs font-semibold text-[#F4F5F7]">Voiceover Recording</span>
            <p className="text-[10px] text-[#9298A3] mt-0.5">Click below to start narration recording.</p>
          </div>
        )}
      </div>
    </div>
  );
}
