'use client';

import React, { useEffect } from 'react';
import { StudioTopBar } from '../header/StudioTopBar';
import { StudioToolRail } from '../rail/StudioToolRail';
import { ContextualPanel } from '../panels/ContextualPanel';
import { PreviewStage } from '../stage/PreviewStage';
import { TimelineShell } from '../timeline/TimelineShell';
import { ResizableDivider } from '@/shared/components/layout/ResizableDivider';
import { ExportModal } from '@/modules/editor/features/export';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { Monitor } from 'lucide-react';

export function StudioShell() {
  const { leftPanelWidth, setLeftPanelWidth, timelineHeight, setTimelineHeight } = useEditorUIStore();

  useEffect(() => {
    const savedWidth = localStorage.getItem('cutframe_panel_width');
    const savedHeight = localStorage.getItem('cutframe_timeline_height');
    if (savedWidth) setLeftPanelWidth(parseInt(savedWidth, 10));
    if (savedHeight) setTimelineHeight(parseInt(savedHeight, 10));
  }, [setLeftPanelWidth, setTimelineHeight]);

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
      <StudioTopBar />

      {/* Screen Width < 1024px Warning Banner */}
      <div className="lg:hidden flex items-center justify-between bg-[#F2C94C] text-[#101216] px-4 py-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
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
              <ContextualPanel />
            </div>

            {/* Panel Width Resizable Divider */}
            <ResizableDivider orientation="vertical" onResize={handleWidthResize} />

            {/* Center Preview Stage */}
            <div className="flex-1 h-full overflow-hidden">
              <PreviewStage />
            </div>
          </div>

          {/* Timeline Height Resizable Divider */}
          <ResizableDivider orientation="horizontal" onResize={handleHeightResize} />

          {/* Bottom Timeline */}
          <div style={{ height: `${timelineHeight}px` }} className="shrink-0 w-full overflow-hidden">
            <TimelineShell />
          </div>

        </div>
      </div>

      {/* Global Export Modal */}
      <ExportModal />
    </div>
  );
}
