'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { CanvasStage } from '@/modules/editor/features/canvas';
import { usePlaybackEngine } from '@/modules/editor/features/playback';

export function PreviewStage() {
  usePlaybackEngine();

  const { wasTabHiddenPaused, setWasTabHiddenPaused } = usePlaybackStore();

  return (
    <div className="flex h-full w-full flex-col bg-canvas-bg text-studio-fg select-none">
      {/* Tab Hidden Paused Banner */}
      {wasTabHiddenPaused && (
        <div className="flex items-center justify-between bg-studio-panel-raised border-b border-studio-border px-4 py-1.5 text-xs text-selection">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Playback paused automatically because tab was hidden.
          </span>
          <button
            type="button"
            onClick={() => setWasTabHiddenPaused(false)}
            className="text-[11px] underline text-studio-muted hover:text-studio-fg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Canvas Stage with Unified Playbar */}
      <div className="flex-1 overflow-hidden relative">
        <CanvasStage />
      </div>
    </div>
  );
}
