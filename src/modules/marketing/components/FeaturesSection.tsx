import React from 'react';
import { Layers, Crop, Type, Volume2, HardDrive } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-[#F6F4EF] text-[#151619] border-t border-[#D9D5CC]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D5CC] bg-[#FFFFFF] px-3.5 py-1 text-xs font-medium text-[#151619] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#FF5A36]" />
            <span>Core Features</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#151619]">
            Everything you need for precise video creation.
          </h2>
          <p className="mt-4 text-base text-[#6F716F]">
            Designed with essential editing primitives—no bloat, no complex timeline friction, and zero cloud delay.
          </p>
        </div>

        {/* Feature Grid: 1 Large Card + 4 Smaller Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Featured Large Card (Spans 2 columns on desktop) */}
          <div className="lg:col-span-2 rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-8 shadow-xs flex flex-col justify-between group hover:border-[#FF5A36]/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#151619]">Multitrack Timeline Editing</h3>
              </div>
              <p className="text-sm text-[#6F716F] max-w-xl">
                Layer video clips, text titles, background music, and graphic overlays seamlessly. Trim handles, split points, and magnetic alignment give you full control over clip timing.
              </p>
            </div>

            {/* Custom HTML/CSS Mini Timeline UI Graphic */}
            <div className="mt-8 rounded-xl border border-[#2B2F38] bg-[#101216] p-4 text-[#F4F5F7] shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9298A3] border-b border-[#2B2F38] pb-1 mb-2">
                <span>00:00</span>
                <span>00:02</span>
                <span className="text-[#FF5A36]">00:04</span>
                <span>00:06</span>
                <span>00:08</span>
              </div>
              <div className="space-y-2 relative">
                <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-[#FF5A36] z-10" />
                {/* Track 1 */}
                <div className="h-6 rounded bg-[#171A20] relative overflow-hidden border border-[#2B2F38]">
                  <div className="absolute left-[10%] w-[50%] h-full rounded bg-[#FF5A36] px-2 flex items-center text-[10px] font-semibold text-white truncate">
                    Main_Shot_4K.mp4
                  </div>
                </div>
                {/* Track 2 */}
                <div className="h-6 rounded bg-[#171A20] relative overflow-hidden border border-[#2B2F38]">
                  <div className="absolute left-[30%] w-[35%] h-full rounded bg-[#F2C94C] px-2 flex items-center text-[10px] font-semibold text-[#101216] truncate">
                    Intro Title
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Transform and Crop */}
          <div className="rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between group hover:border-[#FF5A36]/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                  <Crop className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#151619]">Transform & Crop</h3>
              </div>
              <p className="text-xs text-[#6F716F]">
                Scale, reposition, and rotate video clips on a canvas preview stage. Adjust opacity, brightness, and contrast.
              </p>
            </div>

            {/* Custom HTML/CSS Transform Box Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-[#D9D5CC] bg-[#F6F4EF] flex items-center justify-center p-3">
              <div className="relative h-16 w-24 rounded border-2 border-dashed border-[#FF5A36] bg-[#FFFFFF] shadow-2xs flex items-center justify-center">
                <span className="text-[10px] font-mono text-[#FF5A36]">Scale: 100%</span>
                <div className="absolute -top-1 -left-1 h-2 w-2 bg-[#FF5A36] rounded-full" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#FF5A36] rounded-full" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-[#FF5A36] rounded-full" />
                <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#FF5A36] rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 3: Text and Graphic Layers */}
          <div className="rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between group hover:border-[#FF5A36]/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                  <Type className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#151619]">Text & Lower Thirds</h3>
              </div>
              <p className="text-xs text-[#6F716F]">
                Add custom text overlays, subtitles, and headings. Style fonts, alignment, background cards, and text colors.
              </p>
            </div>

            {/* Custom HTML/CSS Text Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-[#D9D5CC] bg-[#F6F4EF] flex items-center justify-center p-3">
              <div className="rounded-lg bg-[#101216] px-4 py-2 text-center text-white shadow-xs">
                <span className="text-xs font-bold tracking-wider text-[#F2C94C]">EDITORIAL TEXT</span>
              </div>
            </div>
          </div>

          {/* Card 4: Audio Controls */}
          <div className="rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between group hover:border-[#FF5A36]/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                  <Volume2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#151619]">Audio Controls & Mixing</h3>
              </div>
              <p className="text-xs text-[#6F716F]">
                Mix multiple background audio tracks, adjust per-track gain, mute/solo channels, and synchronize audio with video frames.
              </p>
            </div>

            {/* Custom HTML/CSS Audio Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-[#D9D5CC] bg-[#F6F4EF] flex items-center justify-center px-4">
              <div className="flex items-end gap-1 h-12 w-full justify-center">
                <div className="w-1.5 bg-[#FF5A36] h-4 rounded-full" />
                <div className="w-1.5 bg-[#FF5A36] h-8 rounded-full" />
                <div className="w-1.5 bg-[#FF5A36] h-11 rounded-full" />
                <div className="w-1.5 bg-[#FF5A36] h-6 rounded-full" />
                <div className="w-1.5 bg-[#FF5A36] h-10 rounded-full" />
                <div className="w-1.5 bg-[#FF5A36] h-5 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 5: Local Storage */}
          <div className="rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between group hover:border-[#FF5A36]/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                  <HardDrive className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#151619]">IndexedDB Project Storage</h3>
              </div>
              <p className="text-xs text-[#6F716F]">
                Projects and imported media assets persist locally in your browser via Dexie IndexedDB. Refresh without losing edits.
              </p>
            </div>

            {/* Custom HTML/CSS Storage Badge Graphic */}
            <div className="mt-6 h-28 rounded-xl border border-[#D9D5CC] bg-[#F6F4EF] flex items-center justify-center p-3">
              <div className="flex items-center gap-2 rounded-full border border-[#D9D5CC] bg-[#FFFFFF] px-3 py-1.5 text-xs font-mono text-[#151619] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#248A5A]" />
                <span>IndexedDB: 100% Local</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
