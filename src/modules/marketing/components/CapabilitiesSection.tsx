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
    <section id="capabilities" className="py-20 sm:py-24 lg:py-28 bg-mkt-bg text-mkt-fg border-t border-mkt-border">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3.5 py-1 text-xs font-medium text-mkt-fg mb-4">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span>Editor Capabilities</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-mkt-fg">
            Built for everyday video editing tasks.
          </h2>
          <p className="mt-4 text-base text-mkt-muted">
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
                className="rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs hover:border-brand/50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand mb-4">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-mkt-fg mb-1.5">{cap.title}</h3>
                <p className="text-xs text-mkt-muted leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
