'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { processAndStoreMediaFile } from '@/modules/editor/features/media-library/services/media-import-service';
import { getSupportedMimeType } from '../utils/codec-detection';
import { Tabs, TabList, TabTrigger, TabContent } from '@/shared/components/ui/Tabs';
import { Mic, Monitor, Camera, Square, Circle, Plus, AlertCircle } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { TimelineClip } from '@/modules/editor/types';
import { MicRecordTab, type MediaDeviceItem } from './MicRecordTab';
import { ScreenRecordTab } from './ScreenRecordTab';
import { CameraRecordTab } from './CameraRecordTab';

export function RecordPanel() {
  const { currentProject, addAsset, addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();

  const [activeTab, setActiveTab] = useState<'mic' | 'screen' | 'camera'>('mic');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Device lists
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceItem[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceItem[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);

  // Last recorded result state
  const [lastRecordedAssetId, setLastRecordedAssetId] = useState<string | null>(null);
  const [lastRecordedType, setLastRecordedType] = useState<'audio' | 'video'>('audio');
  const [lastRecordedDuration, setLastRecordedDuration] = useState<number>(0);

  // Refs for stream & recorder
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  }, []);

  const startCameraPreview = useCallback(async () => {
    stopMediaStream();
    setErrorMsg(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera preview error:', err);
      setErrorMsg('Camera access denied or device unavailable.');
    }
  }, [selectedVideoDevice, stopMediaStream]);

  // Cleanup tracks on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stopMediaStream]);

  // Enumerate devices when tab changes
  useEffect(() => {
    async function enumerateDevices() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();

        const audioInputs = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));

        const videoInputs = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));

        setAudioInputDevices(audioInputs);
        setVideoInputDevices(videoInputs);

        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Device enumeration error:', err);
      }
    }

    enumerateDevices();
  }, [activeTab, selectedAudioDevice, selectedVideoDevice]);

  // Handle Camera Live Preview Stream
  useEffect(() => {
    if (activeTab === 'camera' && !isRecording) {
      startCameraPreview();
    } else if (activeTab !== 'camera' && !isRecording) {
      stopMediaStream();
    }
  }, [activeTab, isRecording, startCameraPreview, stopMediaStream]);

  const startTimer = () => {
    setRecordDuration(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 0.1);
    }, 100);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    if (!currentProject) return;
    setErrorMsg(null);
    setLastRecordedAssetId(null);
    recordedChunksRef.current = [];

    try {
      let stream: MediaStream;

      if (activeTab === 'mic') {
        const constraints: MediaStreamConstraints = {
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (activeTab === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: includeSystemAudio,
        });
      } else {
        if (mediaStreamRef.current && mediaStreamRef.current.active) {
          stream = mediaStreamRef.current;
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
            audio: true,
          });
        }
      }

      mediaStreamRef.current = stream;
      const mimeType = getSupportedMimeType(activeTab === 'mic' ? 'audio' : 'video');

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stopTimer();
        setIsRecording(false);

        if (recordedChunksRef.current.length === 0) return;

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const filename = `${activeTab === 'mic' ? 'Voiceover' : activeTab === 'screen' ? 'Screen Recording' : 'Camera Recording'}_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.webm`;
        const file = new File([blob], filename, { type: mimeType });

        try {
          const importRes = await processAndStoreMediaFile(file, currentProject.id);
          addAsset(importRes.asset);

          setLastRecordedAssetId(importRes.asset.id);
          setLastRecordedType(importRes.asset.type === 'audio' ? 'audio' : 'video');
          setLastRecordedDuration(importRes.asset.duration);
        } catch (saveErr) {
          console.error('Failed to process recorded asset:', saveErr);
          setErrorMsg('Failed to save recording file.');
        } finally {
          stopMediaStream();
        }
      };

      recorder.start(500);
      setIsRecording(true);
      startTimer();
    } catch (err: unknown) {
      console.warn('Recording start error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        setErrorMsg('Permission denied by browser.');
      } else {
        setErrorMsg('Failed to initialize recording media.');
      }
      stopMediaStream();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    recordedChunksRef.current = [];
    stopTimer();
    setIsRecording(false);
    stopMediaStream();
    if (activeTab === 'camera') {
      startCameraPreview();
    }
  };

  const handleAddToTimeline = () => {
    if (!currentProject || !lastRecordedAssetId) return;

    let targetTrack = currentProject.tracks.find((t) => t.type === lastRecordedType);
    if (!targetTrack) {
      addTrack(lastRecordedType, lastRecordedType === 'audio' ? 'Audio Track' : 'Video Track');
      const updated = useProjectStore.getState().currentProject?.tracks || [];
      targetTrack = updated.find((t) => t.type === lastRecordedType);
    }

    if (!targetTrack) return;

    const newClipId = nanoid();
    const newClip: TimelineClip = {
      id: newClipId,
      trackId: targetTrack.id,
      assetId: lastRecordedAssetId,
      type: lastRecordedType === 'audio' ? 'audio' : 'video',
      timelineStart: playhead,
      timelineDuration: Math.max(1, lastRecordedDuration),
      sourceStart: 0,
      sourceDuration: Math.max(1, lastRecordedDuration),
      name: `${lastRecordedType === 'audio' ? 'Voiceover' : 'Recording'} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      transform: {
        x: 0,
        y: 0,
        width: currentProject.settings.width,
        height: currentProject.settings.height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fitMode: 'contain',
      },
      adjustments: { brightness: 1, contrast: 1, saturation: 1, blur: 0, grayscale: 0, sepia: 0 },
      audio: { volume: 1, muted: false, fadeIn: 0, fadeOut: 0 },
      speed: 1,
    };

    addClip(targetTrack.id, newClip);
    setSelectedClipIds([newClipId]);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-studio-fg select-none h-full overflow-y-auto overscroll-contain studio-scrollbar">
      <Tabs
        defaultValue="mic"
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as 'mic' | 'screen' | 'camera');
          setErrorMsg(null);
        }}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabList className="grid grid-cols-3 gap-1 mb-4 bg-studio-panel-raised p-1 rounded-xl border border-studio-border shrink-0">
          <TabTrigger
            value="mic"
            className="text-xs py-1.5 gap-1.5 rounded-lg data-[state=active]:bg-studio-hover data-[state=active]:text-studio-fg data-[state=active]:font-semibold data-[state=active]:shadow-xs text-studio-muted hover:text-studio-fg hover:bg-studio-hover/50 transition-all"
            disabled={isRecording}
          >
            <Mic className="h-3.5 w-3.5" /> Mic
          </TabTrigger>
          <TabTrigger
            value="screen"
            className="text-xs py-1.5 gap-1.5 rounded-lg data-[state=active]:bg-studio-hover data-[state=active]:text-studio-fg data-[state=active]:font-semibold data-[state=active]:shadow-xs text-studio-muted hover:text-studio-fg hover:bg-studio-hover/50 transition-all"
            disabled={isRecording}
          >
            <Monitor className="h-3.5 w-3.5" /> Screen
          </TabTrigger>
          <TabTrigger
            value="camera"
            className="text-xs py-1.5 gap-1.5 rounded-lg data-[state=active]:bg-studio-hover data-[state=active]:text-studio-fg data-[state=active]:font-semibold data-[state=active]:shadow-xs text-studio-muted hover:text-studio-fg hover:bg-studio-hover/50 transition-all"
            disabled={isRecording}
          >
            <Camera className="h-3.5 w-3.5" /> Camera
          </TabTrigger>
        </TabList>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400 mb-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="flex-1 leading-snug">{errorMsg}</span>
          </div>
        )}

        <TabContent value="mic">
          <MicRecordTab
            audioInputDevices={audioInputDevices}
            selectedAudioDevice={selectedAudioDevice}
            setSelectedAudioDevice={setSelectedAudioDevice}
            isRecording={isRecording}
            recordDuration={recordDuration}
            formatTimer={formatTimer}
          />
        </TabContent>

        <TabContent value="screen">
          <ScreenRecordTab
            includeSystemAudio={includeSystemAudio}
            setIncludeSystemAudio={setIncludeSystemAudio}
            isRecording={isRecording}
          />
        </TabContent>

        <TabContent value="camera">
          <CameraRecordTab
            videoInputDevices={videoInputDevices}
            selectedVideoDevice={selectedVideoDevice}
            setSelectedVideoDevice={setSelectedVideoDevice}
            isRecording={isRecording}
            recordDuration={recordDuration}
            formatTimer={formatTimer}
            previewVideoRef={previewVideoRef}
          />
        </TabContent>

        <div className="mt-4 flex flex-col gap-2 pb-4 shrink-0">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex-1 h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop Recording</span>
              </button>
              <button
                type="button"
                onClick={handleCancelRecording}
                className="h-10 px-4 rounded-xl border border-studio-border bg-studio-panel-raised hover:bg-studio-hover text-studio-muted hover:text-studio-fg font-medium text-xs transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              className="w-full h-10 px-4 rounded-xl bg-studio-fg text-studio-bg font-semibold text-xs tracking-wide hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
            >
              <Circle className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
              <span>Start Recording</span>
            </button>
          )}

          {lastRecordedAssetId && !isRecording && (
            <div className="flex flex-col gap-2.5 rounded-xl border border-studio-border bg-studio-panel-raised p-3.5 mt-2 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-xs text-emerald-400 truncate">Recording Saved!</span>
                </div>
                <span className="text-[10px] font-mono text-studio-muted bg-studio-hover border border-studio-border px-2 py-0.5 rounded-md shrink-0">
                  {lastRecordedDuration.toFixed(1)}s
                </span>
              </div>

              <p className="text-[11px] text-studio-muted">
                Clip saved to project media library.
              </p>

              <button
                type="button"
                onClick={handleAddToTimeline}
                className="w-full h-9 rounded-xl bg-studio-fg text-studio-bg font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Add to Timeline</span>
              </button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
