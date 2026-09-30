"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { GithubIcon } from "./LandingHeroView";

export interface ProjectCtaSectionProps {
  starCount: number | null;
}

export function ProjectCtaSection({ starCount }: ProjectCtaSectionProps) {
  return (
    <section className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20 overflow-hidden">
      <div className="landing-reveal flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
        {/* Left Column: Heading */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
            <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-[#808080]" />
            Ready when you are
          </span>
          <h2 className="mt-3.5 text-balance text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] leading-[1.08]">
            Your next cut
            <span className="block text-zinc-500 dark:text-[#808080]">
              starts right now.
            </span>
          </h2>
        </div>

        {/* Right Column: Subtitle + Action Buttons */}
        <div className="flex flex-col gap-6 max-w-xl lg:pb-1">
          <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080]">
            Experience real-time timeline scrubbing, multitrack audio, and client-side color grading right here in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
            <Link
              href="/projects/new"
              className="group inline-flex h-11 sm:h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-6 sm:px-7 text-sm sm:text-[15px] font-semibold text-white whitespace-nowrap shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:shadow-[0_0_28px_rgba(222,222,222,0.18)] dark:hover:bg-[#ECECEC] dark:hover:shadow-[0_0_36px_rgba(222,222,222,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <span className="whitespace-nowrap">Launch Cutnora Project</span>
              <ArrowUpRight className="h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <a
              href={siteConfig.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 sm:h-12 w-full sm:w-auto sm:ml-auto shrink-0 items-center justify-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/80 px-4.5 sm:px-5.5 text-sm sm:text-[15px] font-medium text-zinc-800 whitespace-nowrap backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:hover:border-white/20 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <GithubIcon className="h-4.5 w-4.5 shrink-0 fill-current transition-transform duration-200 group-hover:scale-110" />
              <span className="whitespace-nowrap">Star on GitHub</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-zinc-700 dark:text-[#DEDEDE] leading-none">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span>{starCount !== null ? (starCount >= 1000 ? `${(starCount / 1000).toFixed(1)}k` : starCount) : "6"}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export const StudioCtaSection = ProjectCtaSection;
export type StudioCtaSectionProps = ProjectCtaSectionProps;
