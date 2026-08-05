'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { processAndStoreMediaFile } from '@/modules/editor/features/media-library/services/media-import-service';
import { getSupportedMimeType } from '../utils/codec-detection';
import { Tabs, TabList, TabTrigger, TabContent } from '@/shared/components/ui/Tabs';
import { Button } from '@/shared/components/ui/Button';
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
    <div className="flex flex-col gap-4 p-4 text-studio-fg select-none">
      <Tabs defaultValue="mic" value={activeTab} onValueChange={(val) => setActiveTab(val as 'mic' | 'screen' | 'camera')}>
        <TabList className="grid grid-cols-3 gap-1 mb-4 bg-studio-topbar p-1 rounded-lg border border-studio-border">
          <TabTrigger value="mic" className="text-xs py-1.5 gap-1.5" disabled={isRecording}>
            <Mic className="h-3.5 w-3.5" /> Mic
          </TabTrigger>
          <TabTrigger value="screen" className="text-xs py-1.5 gap-1.5" disabled={isRecording}>
            <Monitor className="h-3.5 w-3.5" /> Screen
          </TabTrigger>
          <TabTrigger value="camera" className="text-xs py-1.5 gap-1.5" disabled={isRecording}>
            <Camera className="h-3.5 w-3.5" /> Camera
          </TabTrigger>
        </TabList>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive mb-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
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

        <div className="mt-4 flex flex-col gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <Button size="md" variant="primary" onClick={handleStopRecording} className="flex-1 gap-2 bg-destructive hover:bg-destructive/90">
                <Square className="h-4 w-4 fill-current" /> Stop Recording
              </Button>
              <Button size="md" variant="secondary" onClick={handleCancelRecording}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="md" variant="primary" onClick={handleStartRecording} className="gap-2">
              <Circle className="h-4 w-4 fill-current text-brand" /> Start Recording
            </Button>
          )}

          {lastRecordedAssetId && !isRecording && (
            <div className="flex items-center justify-between rounded-lg border border-mkt-success/50 bg-mkt-success/10 p-2.5 mt-2">
              <div className="flex flex-col text-xs">
                <span className="font-bold text-mkt-success">Recording Saved!</span>
                <span className="text-[10px] text-studio-muted">{lastRecordedDuration.toFixed(1)}s duration saved to media library</span>
              </div>
              <Button size="sm" variant="selection" onClick={handleAddToTimeline} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add to Timeline
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
