"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Monitor } from "lucide-react";
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
import { BrandMark } from "@/shared/components/BrandMark";

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
  const {
    leftPanelWidth,
    setLeftPanelWidth,
    timelineHeight,
    setTimelineHeight,
  } = useEditorUIStore();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const isExportModalOpen = useExportStore((state) => state.isExportModalOpen);

  useKeyboardShortcuts(() => setIsShortcutsOpen(true));

  useEffect(() => {
    const savedWidth = localStorage.getItem("cutnora_panel_width");
    const savedHeight = localStorage.getItem("cutnora_timeline_height");
    if (savedWidth) setLeftPanelWidth(Math.max(310, parseInt(savedWidth, 10)));
    if (savedHeight) setTimelineHeight(parseInt(savedHeight, 10));
  }, [setLeftPanelWidth, setTimelineHeight]);

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
      <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-mkt-bg px-6 text-center text-mkt-fg lg:hidden">
        <BrandMark size={44} />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-mkt-border bg-mkt-surface">
          <Monitor className="h-6 w-6 text-brand" aria-hidden="true" />
        </div>
        <h1 className="mt-5 max-w-sm text-3xl font-black tracking-[-0.04em]">
          Cutnora needs a larger canvas.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-mkt-muted">
          The multitrack studio is designed for desktop screens at least 1024px
          wide. Your project is safe in this browser—open it again on a larger
          display.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-mkt-fg px-5 text-sm font-bold text-mkt-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      {/* Top 56px Bar */}
      <StudioTopBar onOpenHelp={() => setIsShortcutsOpen(true)} />

      {/* Main Workspace Area (Fills Remaining Height) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left 64px Tool Rail */}
        <StudioToolRail />

        {/* Outer Split Container: Upper Stage + Bottom Timeline */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Upper Workspace: Contextual Panel + Preview Stage */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Contextual Panel */}
            <div
              style={{ width: `${leftPanelWidth}px` }}
              className="shrink-0 h-full overflow-hidden"
            >
              <ErrorBoundary
                fallbackTitle="Panel Error"
                fallbackMessage="Contextual panel encountered an error."
              >
                <ContextualPanel />
              </ErrorBoundary>
            </div>

            {/* Panel Width Resizable Divider */}
            <ResizableDivider
              orientation="vertical"
              onResize={handleWidthResize}
            />

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
            style={{ height: `${timelineHeight}px` }}
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
