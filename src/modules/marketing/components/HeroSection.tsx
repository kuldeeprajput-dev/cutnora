import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16 text-center">
      {/* Subtle Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#151619 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D5CC] bg-[#FFFFFF] px-3.5 py-1 text-xs font-medium text-[#151619] shadow-2xs mb-6">
          <span className="h-2 w-2 rounded-full bg-[#FF5A36] animate-pulse motion-reduce:animate-none" />
          <span>A local-first browser video editor</span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-[#151619] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
          Edit videos without leaving your browser.
        </h1>

        {/* Supporting Text */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#6F716F] leading-relaxed">
          Import, trim, arrange, style and export your videos from one focused workspace. Your media stays on your device.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio/new"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-[#FF5A36] px-6 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#E84928] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Start editing
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-[#D9D5CC] bg-[#FFFFFF] px-6 text-base font-medium text-[#151619] shadow-2xs transition-all hover:bg-[#ECE9E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36]"
          >
            Explore features
          </a>
        </div>

        {/* Disclaimer Subtext */}
        <p className="mt-4 text-xs font-medium text-[#6F716F]">
          No account required for the local editor.
        </p>
      </div>
    </section>
  );
}
