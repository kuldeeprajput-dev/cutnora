import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ExportFormat = 'webm' | 'mp4';
export type ExportResolution = '720p' | '1080p' | '4k';
export type ExportStatus = 'idle' | 'rendering' | 'converting' | 'completed' | 'error';

interface ExportState {
  isExportModalOpen: boolean;
  exportFormat: ExportFormat;
  exportResolution: ExportResolution;
  exportFps: number;
  exportBitrateMbps: number;
  exportStatus: ExportStatus;
  exportProgress: number; // 0 to 100
  exportError: string | null;

  setExportModalOpen: (open: boolean) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportResolution: (resolution: ExportResolution) => void;
  setExportFps: (fps: number) => void;
  setExportBitrateMbps: (bitrate: number) => void;
  setExportStatus: (status: ExportStatus) => void;
  setExportProgress: (progress: number) => void;
  setExportError: (error: string | null) => void;
  resetExport: () => void;
}

export const useExportStore = create<ExportState>()(
  immer((set) => ({
    isExportModalOpen: false,
    exportFormat: 'webm',
    exportResolution: '1080p',
    exportFps: 30,
    exportBitrateMbps: 8,
    exportStatus: 'idle',
    exportProgress: 0,
    exportError: null,

    setExportModalOpen: (open) =>
      set((state) => {
        state.isExportModalOpen = open;
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

    setExportBitrateMbps: (bitrate) =>
      set((state) => {
        state.exportBitrateMbps = bitrate;
      }),

    setExportStatus: (status) =>
      set((state) => {
        state.exportStatus = status;
      }),

    setExportProgress: (progress) =>
      set((state) => {
        state.exportProgress = Math.min(100, Math.max(0, progress));
      }),

    setExportError: (error) =>
      set((state) => {
        state.exportError = error;
      }),

    resetExport: () =>
      set((state) => {
        state.exportStatus = 'idle';
        state.exportProgress = 0;
        state.exportError = null;
      }),
  }))
);
