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
    <section id="workflow" className="py-20 sm:py-24 lg:py-28 bg-[#0d0d0d] text-white border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-zinc-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>Editing Workflow</span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
            Four steps from raw clips to final video.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
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
                className="group relative rounded-2xl border border-white/[0.08] bg-[#141416] p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-mono text-zinc-500 group-hover:text-white transition-colors">{step.number}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-colors group-hover:border-white/20 group-hover:bg-white/[0.08]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-white/20">
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
