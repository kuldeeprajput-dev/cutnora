'use client';

import React, { useEffect, useState } from 'react';
import { StudioTopBar } from '../header/StudioTopBar';
import { StudioToolRail } from '../rail/StudioToolRail';
import { ContextualPanel } from '../panels/ContextualPanel';
import { PreviewStage } from '../stage/PreviewStage';
import { TimelineShell } from '../timeline/TimelineShell';
import { ResizableDivider } from '@/shared/components/layout/ResizableDivider';
import { ExportModal } from '@/modules/editor/features/export';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';
import { ToastContainer } from '@/shared/components/ui/Toast/ToastContainer';
import { useKeyboardShortcuts } from '@/modules/editor/commands/useKeyboardShortcuts';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { Monitor } from 'lucide-react';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useExportStore } from '@/modules/editor/store/useExportStore';

export function StudioShell() {
  const { leftPanelWidth, setLeftPanelWidth, timelineHeight, setTimelineHeight } = useEditorUIStore();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useKeyboardShortcuts(() => setIsShortcutsOpen(true));

  useEffect(() => {
    const savedWidth = localStorage.getItem('cutframe_panel_width');
    const savedHeight = localStorage.getItem('cutframe_timeline_height');
    if (savedWidth) setLeftPanelWidth(parseInt(savedWidth, 10));
    if (savedHeight) setTimelineHeight(parseInt(savedHeight, 10));
  }, [setLeftPanelWidth, setTimelineHeight]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const exportPhase = useExportStore.getState().exportPhase;
      if (exportPhase === 'rendering' || exportPhase === 'converting') {
        e.preventDefault();
        e.returnValue = 'An export is currently in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleWidthResize = (delta: number) => {
    const newWidth = leftPanelWidth + delta;
    setLeftPanelWidth(newWidth);
    localStorage.setItem('cutframe_panel_width', String(newWidth));
  };

  const handleHeightResize = (delta: number) => {
    const newHeight = timelineHeight - delta;
    setTimelineHeight(newHeight);
    localStorage.setItem('cutframe_timeline_height', String(newHeight));
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#101216] text-[#F4F5F7] select-none">
      {/* Top 56px Bar */}
      <StudioTopBar onOpenHelp={() => setIsShortcutsOpen(true)} />

      {/* Screen Width < 1024px Warning Banner */}
      <div className="lg:hidden flex items-center justify-between bg-[#F2C94C] text-[#101216] px-4 py-2 text-xs font-semibold shrink-0 z-40">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 shrink-0" />
          <span>Desktop screen recommended: For optimal multitrack editing, please use a larger display (1024px+).</span>
        </div>
      </div>

      {/* Main Workspace Area (Fills Remaining Height) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left 64px Tool Rail */}
        <StudioToolRail />

        {/* Outer Split Container: Upper Stage + Bottom Timeline */}
        <div className="flex flex-1 flex-col overflow-hidden">
          
          {/* Upper Workspace: Contextual Panel + Preview Stage */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Contextual Panel */}
            <div style={{ width: `${leftPanelWidth}px` }} className="shrink-0 h-full overflow-hidden">
              <ErrorBoundary fallbackTitle="Panel Error" fallbackMessage="Contextual panel encountered an error.">
                <ContextualPanel />
              </ErrorBoundary>
            </div>

            {/* Panel Width Resizable Divider */}
            <ResizableDivider orientation="vertical" onResize={handleWidthResize} />

            {/* Center Preview Stage */}
            <div className="flex-1 h-full overflow-hidden">
              <ErrorBoundary fallbackTitle="Stage Preview Error" fallbackMessage="Stage failed to render preview frame.">
                <PreviewStage />
              </ErrorBoundary>
            </div>
          </div>

          {/* Timeline Height Resizable Divider */}
          <ResizableDivider orientation="horizontal" onResize={handleHeightResize} />

          {/* Bottom Timeline */}
          <div style={{ height: `${timelineHeight}px` }} className="shrink-0 w-full overflow-hidden">
            <ErrorBoundary fallbackTitle="Timeline Error" fallbackMessage="Multitrack timeline encountered an error.">
              <TimelineShell />
            </ErrorBoundary>
          </div>

        </div>
      </div>

      {/* Global Modals & Notifications */}
      <ErrorBoundary fallbackTitle="Export Error">
        <ExportModal />
      </ErrorBoundary>
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <ToastContainer />
    </div>
  );
}
