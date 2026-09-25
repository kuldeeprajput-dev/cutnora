"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { GithubIcon } from "./LandingHeroView";
import {
  ShowcaseBackgroundGrid,
  ShowcaseLeftWing,
  ShowcaseRightWing,
} from "./ShowcaseStudioArtwork";

interface StudioCtaSectionProps {
  starCount: number | null;
}

export function StudioCtaSection({ starCount }: StudioCtaSectionProps) {
  return (
    <section className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-24 sm:pb-36 overflow-hidden">
      {/* Ambient Background Grid Pattern matching Hero & Showcase */}
      <ShowcaseBackgroundGrid />

      {/* Center Radial Gradient Fade Mask to keep text 100% crisp & readable */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_65%_65%_at_50%_50%,var(--mkt-bg)_40%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Subtle Ambient Light Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-full max-w-[900px] rounded-full bg-gradient-to-r from-amber-500/[0.04] via-transparent to-cyan-500/[0.04] dark:from-white/[0.03] dark:via-transparent dark:to-white/[0.02] blur-[120px] -z-10"
      />

      {/* Full-Width Composition: Left Wing + Center Content + Right Wing */}
      <div className="relative z-10 flex items-center justify-between gap-6 xl:gap-10">
        {/* Left Technical HUD Wing (same as above) */}
        <ShowcaseLeftWing />

        {/* Center Primary CTA */}
        <div className="landing-reveal flex-1 mx-auto max-w-3xl text-center py-6">
          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/10 bg-zinc-100/90 dark:bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-zinc-700 dark:text-[#808080] uppercase backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Interactive studio test drive
          </div>

          {/* Hero Title */}
          <h2 className="mt-6 text-balance text-4xl sm:text-6xl lg:text-7xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] leading-[1.06]">
            Your next cut starts right now.
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-[#808080]">
            Experience real-time timeline scrubbing, multitrack audio, and client-side color grading right here in your browser.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/studio/new"
              className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-8 text-sm sm:text-base font-semibold text-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:shadow-[0_0_28px_rgba(222,222,222,0.18)] dark:hover:bg-[#ECECEC] dark:hover:shadow-[0_0_36px_rgba(222,222,222,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <span>Launch Cutnora Studio</span>
              <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <a
              href={siteConfig.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/80 px-7 text-sm sm:text-base font-medium text-zinc-800 backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:hover:border-white/20 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <GithubIcon className="h-4.5 w-4.5 fill-current transition-transform duration-200 group-hover:scale-110" />
              <span>Star on GitHub</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-[#DEDEDE] leading-none">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span>{starCount !== null ? (starCount >= 1000 ? `${(starCount / 1000).toFixed(1)}k` : starCount) : "6"}</span>
              </span>
            </a>
          </div>
        </div>

        {/* Right Technical HUD Wing (same as above) */}
        <ShowcaseRightWing />
      </div>
    </section>
  );
}
