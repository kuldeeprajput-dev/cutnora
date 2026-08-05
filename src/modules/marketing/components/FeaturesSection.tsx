import React from 'react';
import { Layers, Crop, Type, Volume2, HardDrive } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 lg:py-28 bg-mkt-bg text-mkt-fg border-t border-mkt-border">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3.5 py-1 text-xs font-medium text-mkt-fg mb-4">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span>Core Features</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-mkt-fg">
            Everything you need for precise video creation.
          </h2>
          <p className="mt-4 text-base text-mkt-muted">
            Designed with essential editing primitives—no bloat, no complex timeline friction, and zero cloud delay.
          </p>
        </div>

        {/* Feature Grid: 1 Large Card + 4 Smaller Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Featured Large Card (Spans 2 columns on desktop) */}
          <div className="lg:col-span-2 rounded-2xl border border-mkt-border bg-mkt-surface p-8 shadow-xs flex flex-col justify-between group hover:border-brand/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-mkt-fg">Multitrack Timeline Editing</h3>
              </div>
              <p className="text-sm text-mkt-muted max-w-xl">
                Layer video clips, text titles, background music, and graphic overlays seamlessly. Trim handles, split points, and magnetic alignment give you full control over clip timing.
              </p>
            </div>

            {/* Custom HTML/CSS Mini Timeline UI Graphic */}
            <div className="mt-8 rounded-xl border border-studio-border bg-studio-bg p-4 text-studio-fg shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-studio-muted border-b border-studio-border pb-1 mb-2">
                <span>00:00</span>
                <span>00:02</span>
                <span className="text-brand">00:04</span>
                <span>00:06</span>
                <span>00:08</span>
              </div>
              <div className="space-y-2 relative">
                <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-brand z-10" />
                {/* Track 1 */}
                <div className="h-6 rounded bg-studio-panel relative overflow-hidden border border-studio-border">
                  <div className="absolute left-[10%] w-[50%] h-full rounded bg-brand px-2 flex items-center text-[10px] font-semibold text-white truncate">
                    Main_Shot_4K.mp4
                  </div>
                </div>
                {/* Track 2 */}
                <div className="h-6 rounded bg-studio-panel relative overflow-hidden border border-studio-border">
                  <div className="absolute left-[30%] w-[35%] h-full rounded bg-selection px-2 flex items-center text-[10px] font-semibold text-studio-bg truncate">
                    Intro Title
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Transform and Crop */}
          <div className="rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs flex flex-col justify-between group hover:border-brand/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Crop className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-mkt-fg">Transform & Crop</h3>
              </div>
              <p className="text-xs text-mkt-muted">
                Scale, reposition, and rotate video clips on a canvas preview stage. Adjust opacity, brightness, and contrast.
              </p>
            </div>

            {/* Custom HTML/CSS Transform Box Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-mkt-border bg-mkt-bg flex items-center justify-center p-3">
              <div className="relative h-16 w-24 rounded border-2 border-dashed border-brand bg-mkt-surface shadow-2xs flex items-center justify-center">
                <span className="text-[10px] font-mono text-brand">Scale: 100%</span>
                <div className="absolute -top-1 -left-1 h-2 w-2 bg-brand rounded-full" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-brand rounded-full" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-brand rounded-full" />
                <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-brand rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 3: Text and Graphic Layers */}
          <div className="rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs flex flex-col justify-between group hover:border-brand/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Type className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-mkt-fg">Text & Lower Thirds</h3>
              </div>
              <p className="text-xs text-mkt-muted">
                Add custom text overlays, subtitles, and headings. Style fonts, alignment, background cards, and text colors.
              </p>
            </div>

            {/* Custom HTML/CSS Text Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-mkt-border bg-mkt-bg flex items-center justify-center p-3">
              <div className="rounded-lg bg-studio-bg px-4 py-2 text-center text-white shadow-xs">
                <span className="text-xs font-bold tracking-wider text-selection">EDITORIAL TEXT</span>
              </div>
            </div>
          </div>

          {/* Card 4: Audio Controls */}
          <div className="rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs flex flex-col justify-between group hover:border-brand/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Volume2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-mkt-fg">Audio Controls & Mixing</h3>
              </div>
              <p className="text-xs text-mkt-muted">
                Mix multiple background audio tracks, adjust per-track gain, mute/solo channels, and synchronize audio with video frames.
              </p>
            </div>

            {/* Custom HTML/CSS Audio Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-mkt-border bg-mkt-bg flex items-center justify-center px-4">
              <div className="flex items-end gap-1 h-12 w-full justify-center">
                <div className="w-1.5 bg-brand h-4 rounded-full" />
                <div className="w-1.5 bg-brand h-8 rounded-full" />
                <div className="w-1.5 bg-brand h-11 rounded-full" />
                <div className="w-1.5 bg-brand h-6 rounded-full" />
                <div className="w-1.5 bg-brand h-10 rounded-full" />
                <div className="w-1.5 bg-brand h-5 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 5: Local Storage */}
          <div className="rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs flex flex-col justify-between group hover:border-brand/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <HardDrive className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-mkt-fg">IndexedDB Project Storage</h3>
              </div>
              <p className="text-xs text-mkt-muted">
                Projects and imported media assets persist locally in your browser via Dexie IndexedDB. Refresh without losing edits.
              </p>
            </div>

            {/* Custom HTML/CSS Storage Badge Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-mkt-border bg-mkt-bg flex items-center justify-center p-3">
              <div className="flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3 py-1.5 text-xs font-mono text-mkt-fg shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-mkt-success" />
                <span>IndexedDB: 100% Local</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
