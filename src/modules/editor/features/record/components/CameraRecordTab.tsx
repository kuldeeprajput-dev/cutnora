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
          <label className="text-[11px] font-medium text-[#9298A3] block mb-1">Camera Device</label>
          <Select
            value={selectedVideoDevice}
            onChange={(e) => setSelectedVideoDevice(e.target.value)}
            disabled={isRecording}
            className="h-8 text-xs border-[#2B2F38]"
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
      <div className="relative aspect-video w-full rounded-xl border border-[#2B2F38] bg-[#101216] overflow-hidden flex items-center justify-center">
        <video ref={previewVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        {isRecording && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-xs font-mono font-bold text-[#FF5A36] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#FF5A36] animate-ping" />
            REC {formatTimer(recordDuration)}
          </div>
        )}
      </div>
    </div>
  );
}
