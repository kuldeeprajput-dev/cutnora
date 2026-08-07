import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EditorTool } from '../types';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from './usePlaybackStore';

function autoSeekToClipIfOutOfBounds(clipIds: string[]) {
  if (clipIds.length === 0) return;
  const project = useProjectStore.getState().currentProject;
  if (!project) return;

  const allClips = project.tracks.flatMap((t) => t.clips);
  const targetClip = allClips.find((c) => c.id === clipIds[0]);

  if (targetClip) {
    const playhead = usePlaybackStore.getState().playhead;
    const clipEnd = targetClip.timelineStart + targetClip.timelineDuration;
    if (playhead < targetClip.timelineStart || playhead >= clipEnd) {
      usePlaybackStore.getState().setPlayhead(targetClip.timelineStart);
    }
  }
}

interface EditorUIState {
  activeTool: EditorTool;
  activeInspectorTab: string;
  inspectorMode: 'clip' | 'canvas';
  selectedClipIds: string[];
  activeTrackId: string | null;
  zoom: number; // Pixels per second
  scrollLeft: number;
  previewScale: number;
  snappingEnabled: boolean;
  leftPanelWidth: number;
  timelineHeight: number;
  trackHeaderWidth: number;
  stageScale: number;
  zoomMode: 'fit' | number;
  resetViewCount: number;
  isFullscreen: boolean;

  setActiveTool: (tool: EditorTool) => void;
  setActiveInspectorTab: (tab: string) => void;
  setInspectorMode: (mode: 'clip' | 'canvas') => void;
  setSelectedClipIds: (ids: string[]) => void;
  toggleClipSelection: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setActiveTrackId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setPreviewScale: (scale: number) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setLeftPanelWidth: (width: number) => void;
  setTimelineHeight: (height: number) => void;
  setTrackHeaderWidth: (width: number) => void;
  setStageScale: (scale: number) => void;
  setZoomMode: (mode: 'fit' | number) => void;
  triggerResetView: () => void;
  setIsFullscreen: (full: boolean) => void;
  toggleFullscreen: () => void;
}

export const useEditorUIStore = create<EditorUIState>()(
  immer((set) => ({
    activeTool: 'media',
    activeInspectorTab: 'transform',
    inspectorMode: 'clip',
    selectedClipIds: [],
    activeTrackId: null,
    zoom: 50, // 50px per second default timeline zoom
    scrollLeft: 0,
    previewScale: 1,
    snappingEnabled: true,
    leftPanelWidth: 320,
    timelineHeight: 220,
    trackHeaderWidth: 180,
    stageScale: 0.5,
    zoomMode: 'fit',
    resetViewCount: 0,
    isFullscreen: false,

    setActiveTool: (tool) =>
      set((state) => {
        state.activeTool = tool;
      }),

    setActiveInspectorTab: (tab) =>
      set((state) => {
        state.activeInspectorTab = tab;
      }),

    setInspectorMode: (mode) =>
      set((state) => {
        state.inspectorMode = mode;
      }),

    setSelectedClipIds: (ids) =>
      set((state) => {
        state.selectedClipIds = ids;
        if (ids.length > 0) {
          state.activeTool = 'canvas';
          state.inspectorMode = 'clip';
          autoSeekToClipIfOutOfBounds(ids);
        }
      }),

    toggleClipSelection: (id, multiSelect = false) =>
      set((state) => {
        if (multiSelect) {
          if (state.selectedClipIds.includes(id)) {
            state.selectedClipIds = state.selectedClipIds.filter((clipId) => clipId !== id);
          } else {
            state.selectedClipIds.push(id);
          }
        } else {
          state.selectedClipIds = [id];
        }
        if (state.selectedClipIds.length > 0) {
          state.activeTool = 'canvas';
          state.inspectorMode = 'clip';
          autoSeekToClipIfOutOfBounds(state.selectedClipIds);
        }
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedClipIds = [];
      }),

    setActiveTrackId: (id) =>
      set((state) => {
        state.activeTrackId = id;
      }),

    setZoom: (zoom) =>
      set((state) => {
        state.zoom = Math.min(200, Math.max(10, zoom));
      }),

    setScrollLeft: (scrollLeft) =>
      set((state) => {
        state.scrollLeft = Math.max(0, scrollLeft);
      }),

    setPreviewScale: (scale) =>
      set((state) => {
        state.previewScale = Math.min(3, Math.max(0.1, scale));
      }),

    setSnappingEnabled: (enabled) =>
      set((state) => {
        state.snappingEnabled = enabled;
      }),

    setLeftPanelWidth: (width) =>
      set((state) => {
        state.leftPanelWidth = Math.min(600, Math.max(280, width));
      }),

    setTimelineHeight: (height) =>
      set((state) => {
        state.timelineHeight = Math.min(500, Math.max(120, height));
      }),

    setTrackHeaderWidth: (width) =>
      set((state) => {
        state.trackHeaderWidth = Math.min(400, Math.max(180, width));
      }),

    setStageScale: (scale) =>
      set((state) => {
        state.stageScale = scale;
      }),

    setZoomMode: (mode) =>
      set((state) => {
        state.zoomMode = mode;
      }),

    triggerResetView: () =>
      set((state) => {
        state.resetViewCount += 1;
      }),

    setIsFullscreen: (full) =>
      set((state) => {
        state.isFullscreen = full;
      }),

    toggleFullscreen: () =>
      set((state) => {
        state.isFullscreen = !state.isFullscreen;
      }),
  }))
);
