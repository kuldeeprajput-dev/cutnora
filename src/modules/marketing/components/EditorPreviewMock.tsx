import React from "react";
import {
  Play,
  Download,
  RotateCcw,
  RotateCw,
  FolderPlus,
  Type,
  Music,
  Shapes,
  Maximize2,
  Volume2,
  Lock,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";

export function EditorPreviewMock() {
  return (
    <section className="border-b border-studio-border bg-mkt-fg py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-3 text-studio-fg sm:flex-row sm:items-end sm:justify-between">
          <p className="text-2xl font-black tracking-[-0.035em] sm:text-3xl">
            One focused workspace.
          </p>
          <p className="max-w-md text-sm leading-6 text-studio-muted">
            Arrange clips, tune the canvas, mix audio, and export without
            switching tools or waiting on uploads.
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl pb-2 studio-scrollbar">
          {/* Outer Window Container with Subtle Drop Shadow & Borders */}
          <div className="min-w-[820px] overflow-hidden rounded-2xl border border-studio-border bg-studio-bg text-studio-fg shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
            {/* Top Studio Bar */}
            <div className="flex h-11 items-center justify-between border-b border-studio-border bg-studio-topbar px-4">
              {/* Window Controls & Project Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="h-3 w-3 rounded-full bg-selection" />
                  <span className="h-3 w-3 rounded-full bg-mkt-success" />
                </div>
                <div className="h-4 w-px bg-studio-border mx-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-studio-fg">
                    Summer Edit 2026.cut
                  </span>
                  <span className="rounded bg-studio-panel-raised px-1.5 py-0.5 text-[10px] font-mono text-studio-muted border border-studio-border">
                    1080p • 30fps
                  </span>
                </div>
              </div>

              {/* Undo/Redo & Quick Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-studio-muted">
                  <button
                    type="button"
                    aria-label="Undo"
                    className="p-1 hover:text-studio-fg rounded hover:bg-studio-panel-raised"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Redo"
                    className="p-1 hover:text-studio-fg rounded hover:bg-studio-panel-raised"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="h-4 w-px bg-studio-border mx-1" />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-brand-hover"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Main Editor Body Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
              {/* Left Vertical Navigation & Media Library Panel (4 Cols) */}
              <div className="lg:col-span-4 flex border-r border-studio-border bg-studio-panel">
                {/* Tool Icon Sidebar */}
                <div className="flex flex-col items-center gap-4 border-r border-studio-border bg-studio-topbar p-2 w-12 shrink-0 text-studio-muted">
                  <button
                    type="button"
                    aria-label="Media"
                    className="p-2 text-brand bg-brand/10 rounded-lg"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Text"
                    className="p-2 hover:text-studio-fg rounded-lg hover:bg-studio-panel-raised"
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Elements"
                    className="p-2 hover:text-studio-fg rounded-lg hover:bg-studio-panel-raised"
                  >
                    <Shapes className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Audio"
                    className="p-2 hover:text-studio-fg rounded-lg hover:bg-studio-panel-raised"
                  >
                    <Music className="h-4 w-4" />
                  </button>
                </div>

                {/* Media Assets List */}
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-studio-muted">
                      Media Library
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline font-medium"
                    >
                      <Plus className="h-3 w-3" /> Import
                    </button>
                  </div>

                  {/* Media Thumbnails Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Asset Card 1 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-brand">
                      <div className="h-20 w-full rounded bg-studio-bg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-brand/20 to-transparent" />
                        <span className="text-[10px] font-mono text-studio-fg bg-black/60 px-1 rounded absolute bottom-1 right-1">
                          00:08.4
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-studio-fg truncate">
                        beach_drone.mp4
                      </p>
                    </div>

                    {/* Asset Card 2 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-brand">
                      <div className="h-20 w-full rounded bg-studio-bg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-mkt-info/20 to-transparent" />
                        <span className="text-[10px] font-mono text-studio-fg bg-black/60 px-1 rounded absolute bottom-1 right-1">
                          00:04.2
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-studio-fg truncate">
                        sunset_b-roll.mov
                      </p>
                    </div>

                    {/* Asset Card 3 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-brand">
                      <div className="h-20 w-full rounded bg-studio-bg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-selection/20 to-transparent" />
                        <span className="text-[10px] font-mono text-studio-fg bg-black/60 px-1 rounded absolute bottom-1 right-1">
                          00:15.0
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-studio-fg truncate">
                        lofi_track.mp3
                      </p>
                    </div>

                    {/* Asset Card 4 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-brand">
                      <div className="h-20 w-full rounded bg-studio-bg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-mkt-success/20 to-transparent" />
                        <span className="text-[10px] font-mono text-studio-fg bg-black/60 px-1 rounded absolute bottom-1 right-1">
                          PNG
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-studio-fg truncate">
                        brand_logo.png
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Preview Stage (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col bg-canvas-bg border-r border-studio-border">
                {/* 16:9 Canvas Stage */}
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="relative aspect-video w-full max-w-md rounded-xl border border-studio-border bg-studio-bg shadow-lg flex items-center justify-center overflow-hidden group">
                    {/* Simulated Frame Background Graphics */}
                    <div className="absolute inset-0 bg-linear-to-br from-brand/15 via-studio-bg to-mkt-info/15" />

                    {/* Text Overlay Element with Selection Handle */}
                    <div className="absolute border-2 border-selection p-2 rounded bg-black/40 text-center select-none shadow-md">
                      <span className="text-sm font-bold tracking-wider text-white">
                        CUTFRAME EDIT
                      </span>
                      <div className="absolute -top-1.5 -left-1.5 h-3 w-3 bg-selection rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-selection rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-selection rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-selection rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Playback Controls & Scrubber */}
                <div className="h-10 border-t border-studio-border bg-studio-topbar px-4 flex items-center justify-between text-xs text-studio-muted">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Play"
                      className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-hover"
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </button>
                    <span className="font-mono text-studio-fg">
                      00:04.12 / 00:12.00
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Fullscreen"
                    className="hover:text-studio-fg"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right Inspector Panel (3 Cols) */}
              <div className="lg:col-span-3 flex flex-col bg-studio-panel">
                <div className="flex h-9 border-b border-studio-border bg-studio-topbar px-2 items-center gap-1 text-xs">
                  <span className="px-2.5 py-1 font-semibold text-studio-fg border-b-2 border-brand">
                    Transform
                  </span>
                  <span className="px-2.5 py-1 text-studio-muted hover:text-studio-fg cursor-pointer">
                    Filter
                  </span>
                  <span className="px-2.5 py-1 text-studio-muted hover:text-studio-fg cursor-pointer">
                    Audio
                  </span>
                </div>

                <div className="p-3 flex flex-col gap-3 text-xs">
                  {/* Position & Scale Inputs */}
                  <div>
                    <label className="text-[11px] font-medium text-studio-muted mb-1 block">
                      Scale (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        readOnly
                        value="100"
                        className="w-full accent-brand"
                      />
                      <span className="font-mono text-studio-fg w-8">100</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-studio-muted mb-1 block">
                      Opacity
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        readOnly
                        value="90"
                        className="w-full accent-brand"
                      />
                      <span className="font-mono text-studio-fg w-8">90%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-studio-muted mb-1 block">
                      Volume
                    </label>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-studio-muted" />
                      <input
                        type="range"
                        readOnly
                        value="80"
                        className="w-full accent-brand"
                      />
                      <span className="font-mono text-studio-fg w-8">80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Multitrack Timeline Component */}
            <div className="border-t border-studio-border bg-timeline-bg p-3">
              {/* Ruler Bar */}
              <div className="flex items-center justify-between text-[10px] font-mono text-studio-muted border-b border-studio-border pb-1 mb-2 px-16">
                <span>00:00</span>
                <span>00:02</span>
                <span className="text-brand font-bold">00:04</span>
                <span>00:06</span>
                <span>00:08</span>
                <span>00:10</span>
                <span>00:12</span>
              </div>

              {/* Multitrack Lanes */}
              <div className="space-y-1.5 relative">
                {/* Playhead Red Line Overlay */}
                <div className="absolute left-[38%] top-0 bottom-0 w-0.5 bg-brand z-20 pointer-events-none">
                  <div className="h-2 w-2 bg-brand rotate-45 -translate-x-0.75 -translate-y-1" />
                </div>

                {/* Track 1: Text Track */}
                <div className="flex items-center gap-2">
                  <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-studio-muted">
                    <span>TEXT</span>
                    <Eye className="h-3 w-3 hover:text-studio-fg" />
                  </div>
                  <div className="flex-1 h-7 rounded bg-studio-topbar relative flex items-center overflow-hidden border border-studio-border">
                    <div className="absolute left-[20%] w-[35%] h-full rounded bg-selection border border-selection-hover px-2 flex items-center text-[10px] font-semibold text-studio-bg truncate">
                      CUTFRAME EDIT
                    </div>
                  </div>
                </div>

                {/* Track 2: Video Track */}
                <div className="flex items-center gap-2">
                  <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-studio-muted">
                    <span>VIDEO</span>
                    <Lock className="h-3 w-3 hover:text-studio-fg" />
                  </div>
                  <div className="flex-1 h-8 rounded bg-studio-topbar relative flex items-center overflow-hidden border border-studio-border">
                    <div className="absolute left-0 w-[45%] h-full rounded bg-brand/80 border border-brand px-2 flex items-center text-[10px] font-medium text-white truncate">
                      beach_drone.mp4
                    </div>
                    <div className="absolute left-[47%] w-[40%] h-full rounded bg-mkt-info/80 border border-mkt-info px-2 flex items-center text-[10px] font-medium text-white truncate">
                      sunset_b-roll.mov
                    </div>
                  </div>
                </div>

                {/* Track 3: Audio Track */}
                <div className="flex items-center gap-2">
                  <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-studio-muted">
                    <span>AUDIO</span>
                    <Trash2 className="h-3 w-3 hover:text-destructive" />
                  </div>
                  <div className="flex-1 h-7 rounded bg-studio-topbar relative flex items-center overflow-hidden border border-studio-border">
                    <div className="absolute left-0 w-[80%] h-full rounded bg-mkt-success/70 border border-mkt-success px-2 flex items-center text-[10px] font-medium text-white truncate">
                      lofi_background_music.mp3
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
