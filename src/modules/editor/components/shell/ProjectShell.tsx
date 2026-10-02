"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ProjectTopBar } from "../header/ProjectTopBar";
import { ProjectToolRail } from "../rail/ProjectToolRail";
import { InspectorDockButton } from "../panels/InspectorDockButton";
import { SidebarToggleButton } from "../panels/SidebarToggleButton";
import { InspectorPanel } from "@/modules/editor/features/inspector/components/InspectorPanel";
import { useProjectStore } from "@/modules/projects";
import { ContextualPanel } from "../panels/ContextualPanel";
import { PreviewStage } from "../stage/PreviewStage";
import { TimelineShell } from "../timeline/TimelineShell";
import { ResizableDivider } from "@/shared/components/layout/ResizableDivider";
import { KeyboardShortcutsModal } from "../modals/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/modules/editor/commands/useKeyboardShortcuts";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";

import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { useExportStore } from "@/modules/editor/store/useExportStore";

const ExportModal = dynamic(
  () =>
    import("@/modules/editor/features/export/components/ExportModal").then(
      (mod) => mod.ExportModal,
    ),
  { ssr: false },
);

function maximumLeftPanelWidth(
  viewportWidth: number,
  hasRightInspector: boolean,
  rightPanelWidth: number,
) {
  // Reserve the rail, outer spacing, dividers, and space for the live preview.
  const availableWidth = hasRightInspector
    ? viewportWidth - rightPanelWidth - 64 - 32 - 240
    : Infinity;
  return Math.max(
    350,
    Math.min(560, Math.floor(viewportWidth * 0.4), availableWidth),
  );
}

function maximumRightPanelWidth(viewportWidth: number, leftPanelWidth: number) {
  const availableWidth = viewportWidth - leftPanelWidth - 64 - 32 - 240;
  return Math.max(320, Math.min(480, Math.floor(availableWidth)));
}

export function ProjectShell() {
  const clipInspectorSide = useEditorUIStore(
    (state) => state.clipInspectorSide,
  );
  const selectedClipIds = useEditorUIStore((state) => state.selectedClipIds);
  const setSelectedClipIds = useEditorUIStore(
    (state) => state.setSelectedClipIds,
  );
  const currentProjectId = useProjectStore(
    (state) => state.currentProject?.id,
  );
  const showRightInspector = clipInspectorSide === "right";
  const isLeftSidebarCollapsed = useEditorUIStore(
    (state) => state.isLeftSidebarCollapsed,
  );
  const leftPanelWidth = useEditorUIStore((state) => state.leftPanelWidth);
  const rightPanelWidth = useEditorUIStore((state) => state.rightPanelWidth);
  const setLeftPanelWidth = useEditorUIStore(
    (state) => state.setLeftPanelWidth,
  );
  const setRightPanelWidth = useEditorUIStore(
    (state) => state.setRightPanelWidth,
  );
  const timelineHeight = useEditorUIStore((state) => state.timelineHeight);
  const setTimelineHeight = useEditorUIStore(
    (state) => state.setTimelineHeight,
  );
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const isExportModalOpen = useExportStore((state) => state.isExportModalOpen);

  useKeyboardShortcuts(() => setIsShortcutsOpen(true));

  useEffect(() => {
    const project = useProjectStore.getState().currentProject;
    if (!project) return;

    const clipIds = new Set(
      project.tracks.flatMap((track) => track.clips.map((clip) => clip.id)),
    );
    const currentSelection = useEditorUIStore.getState().selectedClipIds;
    const validSelection = currentSelection.filter((id) => clipIds.has(id));
    if (validSelection.length !== currentSelection.length) {
      setSelectedClipIds(validSelection);
    }
  }, [currentProjectId, setSelectedClipIds]);

  useEffect(() => {
    const savedWidth = localStorage.getItem("cutnora_panel_width");
    const savedRightWidth = localStorage.getItem("cutnora_right_panel_width");
    const savedHeight = localStorage.getItem("cutnora_timeline_height");
    const uiState = useEditorUIStore.getState();
    const currentLeftWidth = uiState.leftPanelWidth;
    const parsedRightWidth = Number(savedRightWidth);
    const initialRightWidth =
      Number.isFinite(parsedRightWidth) && parsedRightWidth > 0
        ? parsedRightWidth
        : uiState.rightPanelWidth;
    const project = useProjectStore.getState().currentProject;
    const hasSelectedClip =
      project?.tracks.some((track) =>
        track.clips.some((clip) => uiState.selectedClipIds.includes(clip.id)),
      ) ?? false;
    setRightPanelWidth(
      Math.min(
        maximumRightPanelWidth(window.innerWidth, currentLeftWidth),
        Math.max(320, initialRightWidth),
      ),
    );
    if (savedWidth && Number.isFinite(Number(savedWidth))) {
      const responsiveMaximum = maximumLeftPanelWidth(
        window.innerWidth,
        uiState.clipInspectorSide === "right" && hasSelectedClip,
        initialRightWidth,
      );
      setLeftPanelWidth(
        Math.min(responsiveMaximum, Math.max(350, Number(savedWidth))),
      );
    }
    if (savedHeight && Number.isFinite(Number(savedHeight))) {
      setTimelineHeight(Number(savedHeight));
    }
  }, [setLeftPanelWidth, setRightPanelWidth, setTimelineHeight]);

  useEffect(() => {
    const clampPanelToViewport = () => {
      const maximumWidth = maximumLeftPanelWidth(
        window.innerWidth,
        showRightInspector,
        rightPanelWidth,
      );
      const currentWidth = useEditorUIStore.getState().leftPanelWidth;
      if (currentWidth > maximumWidth) {
        setLeftPanelWidth(maximumWidth);
      }
      const maximumRightWidth = maximumRightPanelWidth(
        window.innerWidth,
        useEditorUIStore.getState().leftPanelWidth,
      );
      if (rightPanelWidth > maximumRightWidth) {
        setRightPanelWidth(maximumRightWidth);
      }
    };

    clampPanelToViewport();
    window.addEventListener("resize", clampPanelToViewport, { passive: true });
    return () => window.removeEventListener("resize", clampPanelToViewport);
  }, [
    leftPanelWidth,
    rightPanelWidth,
    setLeftPanelWidth,
    setRightPanelWidth,
    showRightInspector,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const exportPhase = useExportStore.getState().exportPhase;
      if (exportPhase === "rendering" || exportPhase === "converting") {
        e.preventDefault();
        e.returnValue =
          "An export is currently in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleWidthResize = (delta: number) => {
    const currentWidth = useEditorUIStore.getState().leftPanelWidth;
    const responsiveMaximum = maximumLeftPanelWidth(
      window.innerWidth,
      showRightInspector,
      useEditorUIStore.getState().rightPanelWidth,
    );
    const newWidth = Math.min(
      responsiveMaximum,
      Math.max(350, currentWidth + delta),
    );
    setLeftPanelWidth(newWidth);
  };

  const handleRightWidthResize = (delta: number) => {
    const currentWidth = useEditorUIStore.getState().rightPanelWidth;
    const maximumWidth = maximumRightPanelWidth(
      window.innerWidth,
      useEditorUIStore.getState().leftPanelWidth,
    );
    setRightPanelWidth(
      Math.min(maximumWidth, Math.max(320, currentWidth - delta)),
    );
  };

  const handleRightWidthResizeEnd = () => {
    try {
      localStorage.setItem(
        "cutnora_right_panel_width",
        String(useEditorUIStore.getState().rightPanelWidth),
      );
      localStorage.setItem(
        "cutnora_timeline_height",
        String(useEditorUIStore.getState().timelineHeight),
      );
    } catch {}
  };

  const handleHeightResize = (delta: number) => {
    const currentHeight = useEditorUIStore.getState().timelineHeight;
    const responsiveMaximum = Math.min(
      500,
      Math.floor(window.innerHeight * 0.45),
    );
    const newHeight = Math.min(
      responsiveMaximum,
      Math.max(120, currentHeight - delta),
    );
    setTimelineHeight(newHeight);
  };

  const handleHeightResizeEnd = () => {
    const currentHeight = useEditorUIStore.getState().timelineHeight;
    try {
      localStorage.setItem("cutnora_timeline_height", String(currentHeight));
    } catch {}
  };

  const handleCornerResize = (deltaX: number, deltaY: number) => {
    const currentWidth = useEditorUIStore.getState().leftPanelWidth;
    const currentHeight = useEditorUIStore.getState().timelineHeight;

    const responsiveMaximumWidth = maximumLeftPanelWidth(
      window.innerWidth,
      showRightInspector,
      useEditorUIStore.getState().rightPanelWidth,
    );
    const newWidth = Math.min(
      responsiveMaximumWidth,
      Math.max(350, currentWidth + deltaX),
    );

    const responsiveMaximumHeight = Math.min(
      500,
      Math.floor(window.innerHeight * 0.45),
    );
    const newHeight = Math.min(
      responsiveMaximumHeight,
      Math.max(120, currentHeight - deltaY),
    );

    setLeftPanelWidth(newWidth);
    setTimelineHeight(newHeight);
  };

  const handleCornerResizeEnd = () => {
    const currentWidth = useEditorUIStore.getState().leftPanelWidth;
    const currentHeight = useEditorUIStore.getState().timelineHeight;
    try {
      localStorage.setItem("cutnora_panel_width", String(currentWidth));
      localStorage.setItem("cutnora_timeline_height", String(currentHeight));
    } catch {}
  };

  const handleRightCornerResize = (deltaX: number, deltaY: number) => {
    const currentWidth = useEditorUIStore.getState().rightPanelWidth;
    const currentHeight = useEditorUIStore.getState().timelineHeight;
    const maximumWidth = maximumRightPanelWidth(
      window.innerWidth,
      useEditorUIStore.getState().leftPanelWidth,
    );
    const maximumHeight = Math.min(500, Math.floor(window.innerHeight * 0.45));

    setRightPanelWidth(
      Math.min(maximumWidth, Math.max(320, currentWidth - deltaX)),
    );
    setTimelineHeight(
      Math.min(maximumHeight, Math.max(120, currentHeight - deltaY)),
    );
  };

  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-studio-bg text-studio-fg select-none">
      {/* Top 56px Bar */}
      <ProjectTopBar onOpenHelp={() => setIsShortcutsOpen(true)} />

      {/* Main Workspace Area with outer margins and matching 8px gap */}
      <div className="flex flex-1 flex-col overflow-hidden relative px-2.5 pb-2.5 pt-1.5 bg-studio-bg">
        {/* Upper Workspace: Left Sidebar Card + Preview Stage Card */}
        <div className="flex flex-1 min-h-0 relative z-30">
          {/* Left Sidebar Card: Tool Rail + Contextual Panel */}
          <div
            data-studio-sidebar
            className={`flex h-full shrink-0 overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs ${isLeftSidebarCollapsed ? "hidden" : ""}`}
          >
            {/* Left 64px Tool Rail */}
            <ProjectToolRail />

            {/* Contextual Panel */}
            <div
              style={{
                width: `${leftPanelWidth}px`,
                minWidth: "350px",
              }}
              className="h-full shrink-0 overflow-hidden"
            >
              <ErrorBoundary
                fallbackTitle="Panel Error"
                fallbackMessage="Contextual panel encountered an error."
              >
                <ContextualPanel
                  canvasOnly={showRightInspector}
                  sidebarAction={<SidebarToggleButton />}
                  inspectorDockAction={
                    showRightInspector ? undefined : <InspectorDockButton />
                  }
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Panel Width Resizable Divider with Corner Handle at T-Junction */}
          {!isLeftSidebarCollapsed && (
            <ResizableDivider
              orientation="vertical"
              onResize={handleWidthResize}
              onResizeEnd={handleCornerResizeEnd}
              hasCornerHandle={true}
              onCornerResize={handleCornerResize}
            />
          )}

          {isLeftSidebarCollapsed && (
            <div className="absolute left-2 top-2 z-40">
              <SidebarToggleButton floating />
            </div>
          )}

          {/* Center Preview Stage Card */}
          <div className="flex-1 h-full min-w-0 overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs">
            <ErrorBoundary
              fallbackTitle="Stage Preview Error"
              fallbackMessage="Stage failed to render preview frame."
            >
              <PreviewStage />
            </ErrorBoundary>
          </div>
          {showRightInspector && (
            <>
              <ResizableDivider
                orientation="vertical"
                aria-label="Resize Clip Properties panel"
                aria-valuemin={320}
                aria-valuemax={maximumRightPanelWidth(
                  typeof window === "undefined" ? 1440 : window.innerWidth,
                  leftPanelWidth,
                )}
                aria-valuenow={rightPanelWidth}
                onResize={handleRightWidthResize}
                onResizeEnd={handleRightWidthResizeEnd}
                hasCornerHandle
                onCornerResize={handleRightCornerResize}
              />
              <aside
                aria-label="Clip Properties"
                style={{ width: `${rightPanelWidth}px` }}
                className="h-full min-w-[320px] max-w-[480px] shrink-0 overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs"
              >
                <ErrorBoundary fallbackTitle="Clip Properties Error">
                  <InspectorPanel
                    view="clip"
                    dockAction={<InspectorDockButton />}
                  />
                </ErrorBoundary>
              </aside>
            </>
          )}
        </div>

        {/* Timeline Height Resizable Divider (Horizontal Gap) */}
        <ResizableDivider
          orientation="horizontal"
          onResize={handleHeightResize}
          onResizeEnd={handleHeightResizeEnd}
        />

        {/* Bottom Timeline Card */}
        <div
          style={{
            height: `${timelineHeight}px`,
          }}
          className="shrink-0 w-full overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs"
        >
          <ErrorBoundary
            fallbackTitle="Timeline Error"
            fallbackMessage="Multitrack timeline encountered an error."
          >
            <TimelineShell />
          </ErrorBoundary>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      {isExportModalOpen && (
        <ErrorBoundary fallbackTitle="Export Error">
          <ExportModal />
        </ErrorBoundary>
      )}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export const StudioShell = ProjectShell;
