"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StudioTopBar } from "../header/StudioTopBar";
import { StudioToolRail } from "../rail/StudioToolRail";
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

export function StudioShell() {
  const leftPanelWidth = useEditorUIStore((state) => state.leftPanelWidth);
  const setLeftPanelWidth = useEditorUIStore(
    (state) => state.setLeftPanelWidth,
  );
  const timelineHeight = useEditorUIStore((state) => state.timelineHeight);
  const setTimelineHeight = useEditorUIStore(
    (state) => state.setTimelineHeight,
  );
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const isExportModalOpen = useExportStore((state) => state.isExportModalOpen);

  useKeyboardShortcuts(() => setIsShortcutsOpen(true));

  useEffect(() => {
    const savedWidth = localStorage.getItem("cutnora_panel_width");
    const savedHeight = localStorage.getItem("cutnora_timeline_height");
    if (savedWidth) {
      const responsiveMaximum = Math.max(
        350,
        Math.min(560, Math.floor(window.innerWidth * 0.40)),
      );
      setLeftPanelWidth(
        Math.min(responsiveMaximum, Math.max(350, parseInt(savedWidth, 10))),
      );
    }
    if (savedHeight) setTimelineHeight(parseInt(savedHeight, 10));
  }, [setLeftPanelWidth, setTimelineHeight]);

  useEffect(() => {
    const clampPanelToViewport = () => {
      const maximumWidth = Math.max(
        350,
        Math.min(560, Math.floor(window.innerWidth * 0.40)),
      );
      const currentWidth = useEditorUIStore.getState().leftPanelWidth;
      if (currentWidth > maximumWidth) setLeftPanelWidth(maximumWidth);
    };

    clampPanelToViewport();
    window.addEventListener("resize", clampPanelToViewport, { passive: true });
    return () => window.removeEventListener("resize", clampPanelToViewport);
  }, [setLeftPanelWidth]);

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
    const responsiveMaximum = Math.max(
      350,
      Math.min(560, Math.floor(window.innerWidth * 0.40)),
    );
    const newWidth = Math.min(responsiveMaximum, Math.max(350, currentWidth + delta));
    setLeftPanelWidth(newWidth);
    localStorage.setItem("cutnora_panel_width", String(newWidth));
  };

  const handleHeightResize = (delta: number) => {
    const currentHeight = useEditorUIStore.getState().timelineHeight;
    const responsiveMaximum = Math.min(500, Math.floor(window.innerHeight * 0.45));
    const newHeight = Math.min(responsiveMaximum, Math.max(120, currentHeight - delta));
    setTimelineHeight(newHeight);
    localStorage.setItem("cutnora_timeline_height", String(newHeight));
  };

  const handleCornerResize = (deltaX: number, deltaY: number) => {
    const currentWidth = useEditorUIStore.getState().leftPanelWidth;
    const currentHeight = useEditorUIStore.getState().timelineHeight;

    const responsiveMaxWidth = Math.max(
      350,
      Math.min(560, Math.floor(window.innerWidth * 0.40)),
    );
    const newWidth = Math.min(responsiveMaxWidth, Math.max(350, currentWidth + deltaX));

    const responsiveMaxHeight = Math.min(500, Math.floor(window.innerHeight * 0.45));
    const newHeight = Math.min(responsiveMaxHeight, Math.max(120, currentHeight - deltaY));

    setLeftPanelWidth(newWidth);
    setTimelineHeight(newHeight);
    localStorage.setItem("cutnora_panel_width", String(newWidth));
    localStorage.setItem("cutnora_timeline_height", String(newHeight));
  };

  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-studio-bg text-studio-fg select-none">
      {/* Top 56px Bar */}
      <StudioTopBar onOpenHelp={() => setIsShortcutsOpen(true)} />

      {/* Main Workspace Area with outer margins and matching 8px gap */}
      <div className="flex flex-1 flex-col overflow-hidden relative px-2.5 pb-2.5 pt-1.5 bg-studio-bg">
        {/* Upper Workspace: Left Sidebar Card + Preview Stage Card */}
        <div className="flex flex-1 min-h-0 relative">
          {/* Left Sidebar Card: Tool Rail + Contextual Panel */}
          <div
            data-studio-sidebar
            className="flex h-full shrink-0 overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs"
          >
            {/* Left 64px Tool Rail */}
            <StudioToolRail />

            {/* Contextual Panel */}
            <div
              style={{
                width: `${leftPanelWidth}px`,
                minWidth: "350px",
                maxWidth: "40vw",
              }}
              className="h-full shrink-0 overflow-hidden"
            >
              <ErrorBoundary
                fallbackTitle="Panel Error"
                fallbackMessage="Contextual panel encountered an error."
              >
                <ContextualPanel />
              </ErrorBoundary>
            </div>
          </div>

          {/* Panel Width Resizable Divider with Corner Handle at T-Junction */}
          <ResizableDivider
            orientation="vertical"
            onResize={handleWidthResize}
            hasCornerHandle={true}
            onCornerResize={handleCornerResize}
          />

          {/* Center Preview Stage Card */}
          <div className="flex-1 h-full min-w-0 overflow-hidden rounded-md border border-studio-border bg-studio-panel shadow-xs">
            <ErrorBoundary
              fallbackTitle="Stage Preview Error"
              fallbackMessage="Stage failed to render preview frame."
            >
              <PreviewStage />
            </ErrorBoundary>
          </div>
        </div>

        {/* Timeline Height Resizable Divider (Horizontal Gap) */}
        <ResizableDivider
          orientation="horizontal"
          onResize={handleHeightResize}
        />

        {/* Bottom Timeline Card */}
        <div
          style={{
            height: `${timelineHeight}px`,
            maxHeight: "45dvh",
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
