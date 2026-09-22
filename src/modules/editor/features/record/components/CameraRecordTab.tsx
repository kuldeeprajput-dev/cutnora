'use client';

import React from 'react';
import { Select } from '@/shared/components/ui/Select';
import type { MediaDeviceItem } from './MicRecordTab';

export interface CameraRecordTabProps {
  videoInputDevices: MediaDeviceItem[];
  selectedVideoDevice: string;
  setSelectedVideoDevice: (id: string) => void;
  isRecording: boolean;
  recordDuration: number;
  formatTimer: (sec: number) => string;
  previewVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export function CameraRecordTab({
  videoInputDevices,
  selectedVideoDevice,
  setSelectedVideoDevice,
  isRecording,
  recordDuration,
  formatTimer,
  previewVideoRef,
}: CameraRecordTabProps) {
  return (
    <div className="flex flex-col gap-3">
      {videoInputDevices.length > 0 && (
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1.5">Camera Device</label>
          <Select
            value={selectedVideoDevice}
            onChange={(e) => setSelectedVideoDevice(e.target.value)}
            disabled={isRecording}
            className="h-9 text-xs border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white rounded-xl"
          >
            {videoInputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Live Camera Viewport */}
      <div className="relative aspect-video w-full rounded-xl border border-white/10 bg-black/70 overflow-hidden flex items-center justify-center shadow-inner">
        <video ref={previewVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        {isRecording && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-rose-500 border border-rose-500/30 backdrop-blur shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            REC {formatTimer(recordDuration)}
          </div>
        )}
      </div>
    </div>
  );
}
