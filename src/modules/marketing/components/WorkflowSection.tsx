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
    <section id="workflow" className="py-20 bg-[#ECE9E2] text-[#151619] border-t border-[#D9D5CC]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D5CC] bg-[#FFFFFF] px-3.5 py-1 text-xs font-medium text-[#151619] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#FF5A36]" />
            <span>Editing Workflow</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#151619]">
            Four steps from raw clips to final video.
          </h2>
          <p className="mt-4 text-base text-[#6F716F]">
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
                className="relative rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-[#FF5A36]">{step.number}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF5A36]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#151619] mb-2">{step.title}</h3>
                  <p className="text-xs text-[#6F716F] leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#D9D5CC]">
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
