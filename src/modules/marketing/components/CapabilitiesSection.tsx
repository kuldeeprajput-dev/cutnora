import React from 'react';
import {
  FileVideo,
  Layers,
  Scissors,
  Move,
  SunMedium,
  Volume2,
  Type,
  Video
} from 'lucide-react';

export function CapabilitiesSection() {
  const capabilities = [
    {
      icon: FileVideo,
      title: 'Video, Image & Audio Import',
      description: 'Support for MP4, WebM, PNG, JPEG, and MP3 files directly from local storage.',
    },
    {
      icon: Layers,
      title: 'Multi-Track Timeline',
      description: 'Unlimited layered video, text, image, and background audio tracks.',
    },
    {
      icon: Scissors,
      title: 'Split & Trim Controls',
      description: 'Precise frame-by-frame splitting at playhead and edge trimming handles.',
    },
    {
      icon: Move,
      title: 'Position, Scale & Rotate',
      description: 'Interactive canvas transform box with rotation handles and scale sliders.',
    },
    {
      icon: SunMedium,
      title: 'Visual Filters & Adjustments',
      description: 'Real-time brightness, contrast, saturation, and opacity adjustments.',
    },
    {
      icon: Volume2,
      title: 'Volume & Audio Fades',
      description: 'Per-clip volume controls, mute/solo track switches, and audio gain mixing.',
    },
    {
      icon: Type,
      title: 'Text & Basic Elements',
      description: 'Custom titles, subtitle overlays, background cards, and text styling.',
    },
    {
      icon: Video,
      title: '720p & 1080p Export',
      description: 'Client-side WebM and optional MP4 video generation with custom FPS choices.',
    },
  ];

  return (
    <section id="capabilities" className="py-20 sm:py-24 lg:py-28 bg-[#0d0d0d] text-white border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-zinc-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>Editor Capabilities</span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
            Built for everyday video editing tasks.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            A complete suite of editing tools operating natively in your browser.
          </p>
        </div>

        {/* 8 Capability Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="group rounded-2xl border border-white/[0.08] bg-[#141416] p-6 shadow-xs hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white mb-4 transition-colors group-hover:border-white/20 group-hover:bg-white/[0.08]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{cap.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
