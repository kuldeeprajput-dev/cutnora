import React from 'react';
import { Upload, SlidersHorizontal, Sparkles, Download } from 'lucide-react';

export function WorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Import media',
      description: 'Drag & drop video clips, audio tracks, and images directly from your computer.',
    },
    {
      number: '02',
      icon: SlidersHorizontal,
      title: 'Arrange clips',
      description: 'Trim start/end points, split at playhead, and position clips across multitrack lanes.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Refine composition',
      description: 'Apply text overlays, adjust scale, rotation, volume levels, and visual filters.',
    },
    {
      number: '04',
      icon: Download,
      title: 'Export the result',
      description: 'Render high-resolution WebM or MP4 video files locally and download immediately.',
    },
  ];

  return (
    <section id="workflow" className="py-20 sm:py-24 lg:py-28 bg-mkt-surface-secondary text-mkt-fg border-t border-mkt-border">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3.5 py-1 text-xs font-medium text-mkt-fg mb-4">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span>Editing Workflow</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-mkt-fg">
            Four steps from raw clips to final video.
          </h2>
          <p className="mt-4 text-base text-mkt-muted">
            A streamlined editorial sequence designed to get your video rendered in minutes.
          </p>
        </div>

        {/* 4 Steps Horizontal (desktop) / Vertical (mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-mkt-border bg-mkt-surface p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-brand">{step.number}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-mkt-fg mb-2">{step.title}</h3>
                  <p className="text-xs text-mkt-muted leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-mkt-border">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
