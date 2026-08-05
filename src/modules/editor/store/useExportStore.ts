import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ExportFormat = 'webm' | 'mp4';
export type ExportResolution = '1280x720' | '1920x1080' | '720p' | '1080p' | 'project';
export type ExportQuality = 'draft' | 'standard' | 'high';
export type ExportPhase = 'idle' | 'rendering' | 'converting' | 'completed' | 'error' | 'cancelled';

export interface Capabilities {
  hasCaptureStream: boolean;
  hasMediaRecorder: boolean;
  hasWebAudio: boolean;
  supportedWebMCodecs: string[];
  hasFFmpegSupport: boolean;
}

interface ExportState {
  isExportModalOpen: boolean;
  filename: string;
  exportFormat: ExportFormat;
  exportResolution: ExportResolution;
  exportFps: 24 | 30 | 60;
  exportQuality: ExportQuality;
  exportPhase: ExportPhase;
  exportProgress: number; // 0 to 100
  currentExportTime: number; // seconds
  exportError: string | null;
  exportBlobUrl: string | null;
  isCancelRequested: boolean;
  capabilities: Capabilities;

  setExportModalOpen: (open: boolean) => void;
  setFilename: (filename: string) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportResolution: (resolution: ExportResolution) => void;
  setExportFps: (fps: 24 | 30 | 60) => void;
  setExportQuality: (quality: ExportQuality) => void;
  setExportPhase: (phase: ExportPhase) => void;
  setExportProgress: (progress: number) => void;
  setCurrentExportTime: (time: number) => void;
  setExportError: (error: string | null) => void;
  setExportBlobUrl: (url: string | null) => void;
  setIsCancelRequested: (cancel: boolean) => void;
  detectCapabilities: () => void;
  resetExport: () => void;
}

export const useExportStore = create<ExportState>()(
  immer((set) => ({
    isExportModalOpen: false,
    filename: 'video-export',
    exportFormat: 'webm',
    exportResolution: '1080p',
    exportFps: 30,
    exportQuality: 'standard',
    exportPhase: 'idle',
    exportProgress: 0,
    currentExportTime: 0,
    exportError: null,
    exportBlobUrl: null,
    isCancelRequested: false,
    capabilities: {
      hasCaptureStream: true,
      hasMediaRecorder: true,
      hasWebAudio: true,
      supportedWebMCodecs: ['video/webm;codecs=vp9,opus', 'video/webm'],
      hasFFmpegSupport: true,
    },

    setExportModalOpen: (open) =>
      set((state) => {
        state.isExportModalOpen = open;
        if (!open && state.exportPhase !== 'rendering' && state.exportPhase !== 'converting') {
          state.exportPhase = 'idle';
          state.exportProgress = 0;
          state.exportError = null;
        }
      }),

    setFilename: (filename) =>
      set((state) => {
        state.filename = filename;
      }),

    setExportFormat: (format) =>
      set((state) => {
        state.exportFormat = format;
      }),

    setExportResolution: (resolution) =>
      set((state) => {
        state.exportResolution = resolution;
      }),

    setExportFps: (fps) =>
      set((state) => {
        state.exportFps = fps;
      }),

    setExportQuality: (quality) =>
      set((state) => {
        state.exportQuality = quality;
      }),

    setExportPhase: (phase) =>
      set((state) => {
        state.exportPhase = phase;
      }),

    setExportProgress: (progress) =>
      set((state) => {
        state.exportProgress = Math.min(100, Math.max(0, progress));
      }),

    setCurrentExportTime: (time) =>
      set((state) => {
        state.currentExportTime = time;
      }),

    setExportError: (error) =>
      set((state) => {
        state.exportError = error;
        state.exportPhase = 'error';
      }),

    setExportBlobUrl: (url) =>
      set((state) => {
        if (state.exportBlobUrl && state.exportBlobUrl !== url) {
          URL.revokeObjectURL(state.exportBlobUrl);
        }
        state.exportBlobUrl = url;
      }),

    setIsCancelRequested: (cancel) =>
      set((state) => {
        state.isCancelRequested = cancel;
        if (cancel) {
          state.exportPhase = 'cancelled';
        }
      }),

    detectCapabilities: () => {
      if (typeof window === 'undefined') return;

      const hasCaptureStream = typeof HTMLCanvasElement !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype;
      const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
      const hasWebAudio = typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext !== 'undefined';

      const webmCodecs = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
      ];
      const supportedWebMCodecs = hasMediaRecorder ? webmCodecs.filter((c) => MediaRecorder.isTypeSupported(c)) : [];

      const hasFFmpegSupport = typeof SharedArrayBuffer !== 'undefined' || typeof Worker !== 'undefined';

      set((state) => {
        state.capabilities = {
          hasCaptureStream,
          hasMediaRecorder,
          hasWebAudio,
          supportedWebMCodecs,
          hasFFmpegSupport,
        };
      });
    },

    resetExport: () =>
      set((state) => {
        if (state.exportBlobUrl) {
          URL.revokeObjectURL(state.exportBlobUrl);
        }
        state.exportPhase = 'idle';
        state.exportProgress = 0;
        state.currentExportTime = 0;
        state.exportError = null;
        state.exportBlobUrl = null;
        state.isCancelRequested = false;
      }),
  }))
);
