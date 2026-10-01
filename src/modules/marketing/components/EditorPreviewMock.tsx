                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white font-medium"
                    >
                      <Plus className="h-3 w-3" /> Import
                    </button>
                  </div>

                  {/* Media Thumbnails Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Asset Card 1 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-white/30">
                      <div className="h-20 w-full rounded bg-studio-bg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                        <span className="text-[10px] font-mono text-studio-fg bg-black/60 px-1 rounded absolute bottom-1 right-1">
                          00:08.4
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-studio-fg truncate">
                        beach_drone.mp4
                      </p>
                    </div>

                    {/* Asset Card 2 */}
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-white/30">
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
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-white/30">
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
                    <div className="relative group overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised p-1.5 cursor-pointer hover:border-white/30">
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
                        CUTNORA EDIT
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
                      className="h-7 w-7 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200"
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
                  <span className="px-2.5 py-1 font-semibold text-white border-b-2 border-white">
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
                        className="w-full accent-white"
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
                        className="w-full accent-white"
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
                        className="w-full accent-white"
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
                <span className="text-white font-bold">00:04</span>
                <span>00:06</span>
                <span>00:08</span>
                <span>00:10</span>
                <span>00:12</span>
              </div>

              {/* Multitrack Lanes */}
              <div className="space-y-1.5 relative">
                {/* Playhead White Line Overlay */}
                <div className="absolute left-[38%] top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none">
                  <div className="h-2 w-2 bg-white rotate-45 -translate-x-0.75 -translate-y-1" />
                </div>

                {/* Track 1: Text Track */}
                <div className="flex items-center gap-2">
                  <div className="w-14 shrink-0 flex items-center justify-between text-[10px] font-medium text-studio-muted">
                    <span>TEXT</span>
                    <Eye className="h-3 w-3 hover:text-studio-fg" />
                  </div>
                  <div className="flex-1 h-7 rounded bg-studio-topbar relative flex items-center overflow-hidden border border-studio-border">
                    <div className="absolute left-[20%] w-[35%] h-full rounded bg-selection border border-selection-hover px-2 flex items-center text-[10px] font-semibold text-studio-bg truncate">
                      CUTNORA EDIT
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
                    <div className="absolute left-0 w-[45%] h-full rounded bg-white/20 border border-white/30 px-2 flex items-center text-[10px] font-medium text-white truncate">
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
