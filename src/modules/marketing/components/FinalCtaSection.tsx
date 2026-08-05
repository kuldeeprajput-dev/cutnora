import React from 'react';
import Link from 'next/link';

export function FinalCtaSection() {
  return (
    <section className="py-24 bg-[#101216] text-[#F4F5F7] border-t border-[#2B2F38] text-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#F4F5F7 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-[#F4F5F7]">
          Turn raw clips into a finished video.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#9298A3]">
          Start editing immediately inside your browser. No registration required.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio/new"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-[#FF5A36] px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-[#E84928] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101216]"
          >
            Start editing
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-[#2B2F38] bg-[#171A20] px-6 text-base font-medium text-[#F4F5F7] transition-all hover:bg-[#242832] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36]"
          >
            Return to features
          </a>
        </div>
      </div>
    </section>
  );
}
