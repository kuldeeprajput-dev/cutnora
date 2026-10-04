import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { EditorTool } from "../types";
import { useProjectStore } from "@/modules/projects";
import { usePlaybackStore } from "./usePlaybackStore";
import { clampTimelineZoom } from "../features/timeline/utils/timeline-zoom-utils";

export const MIN_TRACK_HEIGHT = 48;
export const MAX_TRACK_HEIGHT = 144;

function clampTrackHeight(height: unknown): number {
  return typeof height === "number" && Number.isFinite(height)
    ? Math.min(MAX_TRACK_HEIGHT, Math.max(MIN_TRACK_HEIGHT, Math.round(height)))
    : MIN_TRACK_HEIGHT;
}

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
  inspectorMode: "clip" | "canvas";
  clipInspectorSide: "left" | "right";
  isLeftSidebarCollapsed: boolean;
  selectedClipIds: string[];
  activeTrackId: string | null;
  zoom: number; // Pixels per second
  scrollLeft: number;
  previewScale: number;
  snappingEnabled: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  timelineHeight: number;
  trackHeight: number;
  trackHeaderWidth: number;
  showTrackHeaders: boolean;
  stageScale: number;
  zoomMode: "fit" | number;
  resetViewCount: number;
  isFullscreen: boolean;

  setActiveTool: (tool: EditorTool) => void;
  setActiveInspectorTab: (tab: string) => void;
  setInspectorMode: (mode: "clip" | "canvas") => void;
  setClipInspectorSide: (side: "left" | "right") => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedClipIds: (ids: string[]) => void;
  toggleClipSelection: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setActiveTrackId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setPreviewScale: (scale: number) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setTimelineHeight: (height: number) => void;
  setTrackHeight: (height: number) => void;
  setTrackHeaderWidth: (width: number) => void;
  setShowTrackHeaders: (show: boolean) => void;
  toggleTrackHeaders: () => void;
  setStageScale: (scale: number) => void;
  setZoomMode: (mode: "fit" | number) => void;
  triggerResetView: () => void;
  setIsFullscreen: (full: boolean) => void;
  toggleFullscreen: () => void;
}

export const useEditorUIStore = create<EditorUIState>()(
  persist(
    immer((set) => ({
      activeTool: "media",
      activeInspectorTab: "transform",
      inspectorMode: "clip",
      clipInspectorSide: "left",
      isLeftSidebarCollapsed: false,
      selectedClipIds: [],
      activeTrackId: null,
      zoom: 50, // 50px per second default timeline zoom
      scrollLeft: 0,
      previewScale: 1,
      snappingEnabled: true,
      leftPanelWidth: 350,
      rightPanelWidth: 350,
      timelineHeight: 220,
      trackHeight: MIN_TRACK_HEIGHT,
      trackHeaderWidth: 180,
      showTrackHeaders: true,
      stageScale: 0.5,
      zoomMode: "fit",
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

      setClipInspectorSide: (side) =>
        set((state) => {
          state.clipInspectorSide = side;
          if (side === "left") state.activeTool = "canvas";
          state.inspectorMode = "clip";
        }),

      setLeftSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.isLeftSidebarCollapsed = collapsed;
        }),

      setSelectedClipIds: (ids) =>
        set((state) => {
          state.selectedClipIds = ids;
          if (ids.length > 0) {
            if (state.clipInspectorSide === "left") state.activeTool = "canvas";
            state.inspectorMode = "clip";
            autoSeekToClipIfOutOfBounds(ids);
          }
        }),

      toggleClipSelection: (id, multiSelect = false) =>
        set((state) => {
          if (multiSelect) {
            if (state.selectedClipIds.includes(id)) {
              state.selectedClipIds = state.selectedClipIds.filter(
                (clipId) => clipId !== id,
              );
            } else {
              state.selectedClipIds.push(id);
            }
          } else {
            state.selectedClipIds = [id];
          }
          if (state.selectedClipIds.length > 0) {
            if (state.clipInspectorSide === "left") state.activeTool = "canvas";
            state.inspectorMode = "clip";
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
          state.zoom = clampTimelineZoom(zoom);
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
          state.leftPanelWidth = Math.min(600, Math.max(350, width));
        }),

      setRightPanelWidth: (width) =>
        set((state) => {
          state.rightPanelWidth = Math.min(480, Math.max(320, width));
        }),

      setTimelineHeight: (height) =>
        set((state) => {
          state.timelineHeight = Math.min(500, Math.max(120, height));
        }),

      setTrackHeaderWidth: (width) =>
        set((state) => {
          state.trackHeaderWidth = Math.min(400, Math.max(170, width));
        }),

      setTrackHeight: (height) =>
        set((state) => {
          state.trackHeight = clampTrackHeight(height);
        }),

      setShowTrackHeaders: (show) =>
        set((state) => {
          state.showTrackHeaders = show;
        }),

      toggleTrackHeaders: () =>
        set((state) => {
          state.showTrackHeaders = !state.showTrackHeaders;
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
    })),
    {
      name: "cutnora-editor-ui-store",
      merge: (persistedState, currentState) => {
        const saved = persistedState as Partial<EditorUIState> | undefined;
        return {
          ...currentState,
          ...saved,
          zoom: clampTimelineZoom(saved?.zoom ?? currentState.zoom),
          trackHeight: clampTrackHeight(saved?.trackHeight),
        };
      },
      partialize: (state) => ({
        activeTool: state.activeTool,
        zoom: state.zoom,
        zoomMode: state.zoomMode,
        scrollLeft: state.scrollLeft,
        snappingEnabled: state.snappingEnabled,
        leftPanelWidth: state.leftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
        timelineHeight: state.timelineHeight,
        trackHeight: state.trackHeight,
        trackHeaderWidth: state.trackHeaderWidth,
        showTrackHeaders: state.showTrackHeaders,
        previewScale: state.previewScale,
        activeInspectorTab: state.activeInspectorTab,
        inspectorMode: state.inspectorMode,
        selectedClipIds: state.selectedClipIds,
        clipInspectorSide: state.clipInspectorSide,
        isLeftSidebarCollapsed: state.isLeftSidebarCollapsed,
      }),
    },
  ),
);
