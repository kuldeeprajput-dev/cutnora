import React from 'react';
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
  Plus
} from 'lucide-react';

export function EditorPreviewMock() {
  return (
    <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pb-16">
      {/* Outer Window Container with Subtle Drop Shadow & Borders */}
      <div className="overflow-hidden rounded-2xl border border-[#2B2F38] bg-[#101216] text-[#F4F5F7] shadow-2xl transition-all duration-300 motion-reduce:transition-none">
        
        {/* Top Studio Bar */}
        <div className="flex h-11 items-center justify-between border-b border-[#2B2F38] bg-[#14161B] px-4">
          {/* Window Controls & Project Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#E45858]" />
              <span className="h-3 w-3 rounded-full bg-[#F2C94C]" />
              <span className="h-3 w-3 rounded-full bg-[#248A5A]" />
            </div>
            <div className="h-4 w-px bg-[#2B2F38] mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F4F5F7]">Summer Edit 2026.cut</span>
              <span className="rounded bg-[#1D2027] px-1.5 py-0.5 text-[10px] font-mono text-[#9298A3] border border-[#2B2F38]">
                1080p • 30fps
              </span>
            </div>
          </div>

          {/* Undo/Redo & Quick Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#9298A3]">
              <button type="button" aria-label="Undo" className="p-1 hover:text-[#F4F5F7] rounded hover:bg-[#1D2027]">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="Redo" className="p-1 hover:text-[#F4F5F7] rounded hover:bg-[#1D2027]">
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="h-4 w-px bg-[#2B2F38] mx-1" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5A36] px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-[#E84928]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Main Editor Body Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          
          {/* Left Vertical Navigation & Media Library Panel (4 Cols) */}
          <div className="lg:col-span-4 flex border-r border-[#2B2F38] bg-[#171A20]">
            {/* Tool Icon Sidebar */}
            <div className="flex flex-col items-center gap-4 border-r border-[#2B2F38] bg-[#14161B] p-2 w-12 shrink-0 text-[#9298A3]">
              <button type="button" aria-label="Media" className="p-2 text-[#FF5A36] bg-[#FF5A36]/10 rounded-lg">
                <FolderPlus className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Text" className="p-2 hover:text-[#F4F5F7] rounded-lg hover:bg-[#1D2027]">
                <Type className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Elements" className="p-2 hover:text-[#F4F5F7] rounded-lg hover:bg-[#1D2027]">
                <Shapes className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Audio" className="p-2 hover:text-[#F4F5F7] rounded-lg hover:bg-[#1D2027]">
                <Music className="h-4 w-4" />
              </button>
            </div>

            {/* Media Assets List */}
            <div className="flex-1 p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9298A3]">Media Library</span>
                <button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#FF5A36] hover:underline font-medium">
                  <Plus className="h-3 w-3" /> Import
                </button>
              </div>

              {/* Media Thumbnails Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Asset Card 1 */}
                <div className="relative group overflow-hidden rounded-lg border border-[#2B2F38] bg-[#1D2027] p-1.5 cursor-pointer hover:border-[#FF5A36]">
                  <div className="h-20 w-full rounded bg-[#101216] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-[#FF5A36]/20 to-transparent" />
                    <span className="text-[10px] font-mono text-[#F4F5F7] bg-black/60 px-1 rounded absolute bottom-1 right-1">00:08.4</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#F4F5F7] truncate">beach_drone.mp4</p>
                </div>

                {/* Asset Card 2 */}
                <div className="relative group overflow-hidden rounded-lg border border-[#2B2F38] bg-[#1D2027] p-1.5 cursor-pointer hover:border-[#FF5A36]">
                  <div className="h-20 w-full rounded bg-[#101216] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-[#3478D4]/20 to-transparent" />
                    <span className="text-[10px] font-mono text-[#F4F5F7] bg-black/60 px-1 rounded absolute bottom-1 right-1">00:04.2</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#F4F5F7] truncate">sunset_b-roll.mov</p>
                </div>

                {/* Asset Card 3 */}
                <div className="relative group overflow-hidden rounded-lg border border-[#2B2F38] bg-[#1D2027] p-1.5 cursor-pointer hover:border-[#FF5A36]">
                  <div className="h-20 w-full rounded bg-[#101216] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-[#F2C94C]/20 to-transparent" />
                    <span className="text-[10px] font-mono text-[#F4F5F7] bg-black/60 px-1 rounded absolute bottom-1 right-1">00:15.0</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#F4F5F7] truncate">lofi_track.mp3</p>
                </div>

                {/* Asset Card 4 */}
                <div className="relative group overflow-hidden rounded-lg border border-[#2B2F38] bg-[#1D2027] p-1.5 cursor-pointer hover:border-[#FF5A36]">
                  <div className="h-20 w-full rounded bg-[#101216] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-[#248A5A]/20 to-transparent" />
                    <span className="text-[10px] font-mono text-[#F4F5F7] bg-black/60 px-1 rounded absolute bottom-1 right-1">PNG</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#F4F5F7] truncate">brand_logo.png</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Preview Stage (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-[#121419] border-r border-[#2B2F38]">
            {/* 16:9 Canvas Stage */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="relative aspect-video w-full max-w-md rounded-xl border border-[#2B2F38] bg-[#101216] shadow-lg flex items-center justify-center overflow-hidden group">
                {/* Simulated Frame Background Graphics */}
                <div className="absolute inset-0 bg-linear-to-br from-[#FF5A36]/15 via-[#101216] to-[#3478D4]/15" />
                
                {/* Text Overlay Element with Selection Handle */}
                <div className="absolute border-2 border-[#F2C94C] p-2 rounded bg-black/40 text-center select-none shadow-md">
                  <span className="text-sm font-bold tracking-wider text-white">CUTFRAME EDIT</span>
                  <div className="absolute -top-1.5 -left-1.5 h-3 w-3 bg-[#F2C94C] rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-[#F2C94C] rounded-full" />
                  <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-[#F2C94C] rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-[#F2C94C] rounded-full" />
                </div>
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="h-10 border-t border-[#2B2F38] bg-[#14161B] px-4 flex items-center justify-between text-xs text-[#9298A3]">
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Play" className="h-7 w-7 rounded-full bg-[#FF5A36] text-white flex items-center justify-center hover:bg-[#E84928]">
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </button>
                <span className="font-mono text-[#F4F5F7]">00:04.12 / 00:12.00</span>
              </div>
              <button type="button" aria-label="Fullscreen" className="hover:text-[#F4F5F7]">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Inspector Panel (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col bg-[#171A20]">
            <div className="flex h-9 border-b border-[#2B2F38] bg-[#14161B] px-2 items-center gap-1 text-xs">
              <span className="px-2.5 py-1 font-semibold text-[#F4F5F7] border-b-2 border-[#FF5A36]">Transform</span>
              <span className="px-2.5 py-1 text-[#9298A3] hover:text-[#F4F5F7] cursor-pointer">Filter</span>
              <span className="px-2.5 py-1 text-[#9298A3] hover:text-[#F4F5F7] cursor-pointer">Audio</span>
            </div>

            <div className="p-3 flex flex-col gap-3 text-xs">
              {/* Position & Scale Inputs */}
              <div>
                <label className="text-[11px] font-medium text-[#9298A3] mb-1 block">Scale (%)</label>
                <div className="flex items-center gap-2">
                  <input type="range" readOnly value="100" className="w-full accent-[#FF5A36]" />
                  <span className="font-mono text-[#F4F5F7] w-8">100</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#9298A3] mb-1 block">Opacity</label>
                <div className="flex items-center gap-2">
                  <input type="range" readOnly value="90" className="w-full accent-[#FF5A36]" />
                  <span className="font-mono text-[#F4F5F7] w-8">90%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#9298A3] mb-1 block">Volume</label>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-[#9298A3]" />
                  <input type="range" readOnly value="80" className="w-full accent-[#FF5A36]" />
                  <span className="font-mono text-[#F4F5F7] w-8">80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Multitrack Timeline Component */}
        <div className="border-t border-[#2B2F38] bg-[#1C1F25] p-3">
          {/* Ruler Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#9298A3] border-b border-[#2B2F38] pb-1 mb-2 px-16">
            <span>00:00</span>
            <span>00:02</span>
            <span className="text-[#FF5A36] font-bold">00:04</span>
            <span>00:06</span>
            <span>00:08</span>
            <span>00:10</span>
            <span>00:12</span>
          </div>

          {/* Multitrack Lanes */}
          <div className="space-y-1.5 relative">
            {/* Playhead Red Line Overlay */}
            <div className="absolute left-[38%] top-0 bottom-0 w-0.5 bg-[#FF5A36] z-20 pointer-events-none">
              <div className="h-2 w-2 bg-[#FF5A36] rotate-45 -translate-x-0.75 -translate-y-1" />
            </div>

            {/* Track 1: Text Track */}
            <div className="flex items-center gap-2">
              <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-[#9298A3]">
                <span>TEXT</span>
                <Eye className="h-3 w-3 hover:text-[#F4F5F7]" />
              </div>
              <div className="flex-1 h-7 rounded bg-[#14161B] relative flex items-center overflow-hidden border border-[#2B2F38]">
                <div className="absolute left-[20%] w-[35%] h-full rounded bg-[#F2C94C] border border-[#e0b73b] px-2 flex items-center text-[10px] font-semibold text-[#101216] truncate">
                  CUTFRAME EDIT
                </div>
              </div>
            </div>

            {/* Track 2: Video Track */}
            <div className="flex items-center gap-2">
              <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-[#9298A3]">
                <span>VIDEO</span>
                <Lock className="h-3 w-3 hover:text-[#F4F5F7]" />
              </div>
              <div className="flex-1 h-8 rounded bg-[#14161B] relative flex items-center overflow-hidden border border-[#2B2F38]">
                <div className="absolute left-0 w-[45%] h-full rounded bg-[#FF5A36]/80 border border-[#FF5A36] px-2 flex items-center text-[10px] font-medium text-white truncate">
                  beach_drone.mp4
                </div>
                <div className="absolute left-[47%] w-[40%] h-full rounded bg-[#3478D4]/80 border border-[#3478D4] px-2 flex items-center text-[10px] font-medium text-white truncate">
                  sunset_b-roll.mov
                </div>
              </div>
            </div>

            {/* Track 3: Audio Track */}
            <div className="flex items-center gap-2">
              <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-[#9298A3]">
                <span>AUDIO</span>
                <Trash2 className="h-3 w-3 hover:text-[#E45858]" />
              </div>
              <div className="flex-1 h-7 rounded bg-[#14161B] relative flex items-center overflow-hidden border border-[#2B2F38]">
                <div className="absolute left-0 w-[80%] h-full rounded bg-[#248A5A]/70 border border-[#248A5A] px-2 flex items-center text-[10px] font-medium text-white truncate">
                  lofi_background_music.mp3
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
