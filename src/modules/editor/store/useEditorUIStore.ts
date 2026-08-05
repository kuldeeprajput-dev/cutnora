import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EditorTool } from '../types';

interface EditorUIState {
  activeTool: EditorTool;
  selectedClipIds: string[];
  activeTrackId: string | null;
  zoom: number; // Pixels per second
  scrollLeft: number;
  previewScale: number;
  snappingEnabled: boolean;
  leftPanelWidth: number;
  timelineHeight: number;

  setActiveTool: (tool: EditorTool) => void;
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
}

export const useEditorUIStore = create<EditorUIState>()(
  immer((set) => ({
    activeTool: 'select',
    selectedClipIds: [],
    activeTrackId: null,
    zoom: 50, // 50px per second default timeline zoom
    scrollLeft: 0,
    previewScale: 1,
    snappingEnabled: true,
    leftPanelWidth: 320,
    timelineHeight: 220,

    setActiveTool: (tool) =>
      set((state) => {
        state.activeTool = tool;
      }),

    setSelectedClipIds: (ids) =>
      set((state) => {
        state.selectedClipIds = ids;
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
        state.leftPanelWidth = Math.min(600, Math.max(240, width));
      }),

    setTimelineHeight: (height) =>
      set((state) => {
        state.timelineHeight = Math.min(500, Math.max(120, height));
      }),
  }))
);
