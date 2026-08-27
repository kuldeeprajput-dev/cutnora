"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PanelLeftClose } from "lucide-react";
import { StudioTopBar } from "../header/StudioTopBar";
import { StudioToolRail } from "../rail/StudioToolRail";
import { ContextualPanel } from "../panels/ContextualPanel";
import { PreviewStage } from "../stage/PreviewStage";
import { TimelineShell } from "../timeline/TimelineShell";
import { ResizableDivider } from "@/shared/components/layout/ResizableDivider";
import { KeyboardShortcutsModal } from "../modals/KeyboardShortcutsModal";
import { ToastContainer } from "@/shared/components/ui/Toast/ToastContainer";
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
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
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
    const newWidth = leftPanelWidth + delta;
    setLeftPanelWidth(newWidth);
    localStorage.setItem("cutnora_panel_width", String(newWidth));
  };

  const handleHeightResize = (delta: number) => {
    const newHeight = timelineHeight - delta;
    setTimelineHeight(newHeight);
    localStorage.setItem("cutnora_timeline_height", String(newHeight));
  };

  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-studio-bg text-studio-fg select-none">
      {/* Top 56px Bar */}
      <StudioTopBar onOpenHelp={() => setIsShortcutsOpen(true)} />

      {/* Main Workspace Area (Fills Remaining Height) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left 64px Tool Rail */}
        <StudioToolRail onToolSelect={() => setIsPanelCollapsed(false)} />

        {/* Outer Split Container: Upper Stage + Bottom Timeline */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Upper Workspace: Contextual Panel + Preview Stage */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Contextual Panel */}
            {!isPanelCollapsed ? (
              <>
                <div
                  data-studio-sidebar
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

                {/* Panel Width Resizable Divider */}
                <div className="relative shrink-0">
                  <ResizableDivider
                    orientation="vertical"
                    onResize={handleWidthResize}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPanelCollapsed(true)}
                    aria-label="Collapse side panel"
                    title="Collapse side panel"
                    className="absolute left-1/2 top-2 z-30 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md border border-studio-border bg-studio-topbar text-studio-muted shadow-sm transition-colors hover:border-brand/60 hover:bg-studio-panel-raised hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : null}

            {/* Center Preview Stage */}
            <div className="flex-1 h-full overflow-hidden">
              <ErrorBoundary
                fallbackTitle="Stage Preview Error"
                fallbackMessage="Stage failed to render preview frame."
              >
                <PreviewStage />
              </ErrorBoundary>
            </div>
          </div>

          {/* Timeline Height Resizable Divider */}
          <ResizableDivider
            orientation="horizontal"
            onResize={handleHeightResize}
          />

          {/* Bottom Timeline */}
          <div
            style={{
              height: `${timelineHeight}px`,
              maxHeight: "45dvh",
            }}
            className="shrink-0 w-full overflow-hidden"
          >
            <ErrorBoundary
              fallbackTitle="Timeline Error"
              fallbackMessage="Multitrack timeline encountered an error."
            >
              <TimelineShell />
            </ErrorBoundary>
          </div>
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
      <ToastContainer />
    </div>
  );
}
