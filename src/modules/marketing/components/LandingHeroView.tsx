import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { HeroCameraArtwork } from "./HeroCameraArtwork";

export function PrimaryLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/studio/new"
      className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:shadow-[0_0_24px_rgba(222,222,222,0.15)] dark:hover:bg-[#ECECEC] dark:hover:shadow-[0_0_36px_rgba(222,222,222,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function LandingHeaderNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-mkt-border dark:bg-mkt-bg/85">
      <div className="relative mx-auto flex h-[72px] w-full max-w-[1720px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Cutnora home"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <BrandMark
            size={30}
            variant="marketing"
            className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
          />
          <span className="hidden text-[13px] font-bold tracking-[0.18em] text-zinc-900 dark:text-[#DEDEDE] uppercase min-[480px]:inline">
            Cutnora
          </span>
        </Link>

        {/* Center navigation links */}
        <nav
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 text-xs font-medium text-zinc-600 dark:text-[#808080]"
          aria-label="Primary navigation"
        >
          <a
            className="transition-colors duration-200 hover:text-zinc-950 dark:hover:text-[#DEDEDE]"
            href="#showcase"
          >
            Showcase
          </a>
          <a
            className="transition-colors duration-200 hover:text-zinc-950 dark:hover:text-[#DEDEDE]"
            href="#features"
          >
            Features
          </a>
          <a
            className="transition-colors duration-200 hover:text-zinc-950 dark:hover:text-[#DEDEDE]"
            href="#faq"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeToggle />
          <Link
            href="/studio"
            className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full border border-zinc-300/80 bg-white/90 px-3.5 sm:px-4 text-xs font-semibold text-zinc-800 shadow-xs transition-all duration-200 hover:bg-zinc-100 hover:border-zinc-400 dark:border-[#DEDEDE]/15 dark:bg-mkt-surface dark:text-[#DEDEDE] dark:shadow-none dark:hover:border-[#DEDEDE]/30 dark:hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Studio
          </Link>
          <Link
            href="/studio/new"
            className="group inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-full bg-zinc-950 px-3.5 sm:px-4 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:hover:bg-[#ECECEC] dark:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Start editor{" "}
            <ArrowUpRight className="hidden h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Cinematic Camera Viewfinder HUD Frame
 * Features precision corner brackets, live pulsing REC dot, center ticks, and 4K HUD metadata
 */
function ViewfinderCameraFrame({ children }: { children: ReactNode }) {
  return (
    <span className="hero-viewfinder-frame group relative inline-flex items-center justify-center mx-1 my-1 align-middle">
      {/* Viewfinder Main Frosted HUD Glass */}
      <span className="relative inline-flex items-center gap-2.5 sm:gap-4 rounded-xl border border-zinc-300/90 bg-white/85 px-3.5 py-1.5 sm:px-6 sm:py-2.5 text-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md dark:border-[#DEDEDE]/15 dark:bg-zinc-950/60 dark:text-[#DEDEDE] dark:shadow-[0_0_36px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(222,222,222,0.08)] transition-all duration-300 group-hover:border-amber-500/60 dark:group-hover:border-amber-400/40">
        {/* Top-Left Viewfinder Corner Bracket */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-1.5 -top-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 border-l-2 border-t-2 border-amber-500 dark:border-amber-400 rounded-tl-sm transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
        />
        {/* Top-Right Viewfinder Corner Bracket */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1.5 -top-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 border-r-2 border-t-2 border-amber-500 dark:border-amber-400 rounded-tr-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
        />
        {/* Bottom-Left Viewfinder Corner Bracket */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-1.5 -bottom-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 border-l-2 border-b-2 border-amber-500 dark:border-amber-400 rounded-bl-sm transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1"
        />
        {/* Bottom-Right Viewfinder Corner Bracket */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1.5 -bottom-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 border-r-2 border-b-2 border-amber-500 dark:border-amber-400 rounded-br-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"
        />

        {/* Center Crosshair Ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 h-1.5 w-0.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-1 -translate-x-1/2 h-1.5 w-0.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -left-1 -translate-y-1/2 h-0.5 w-1.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-1 -translate-y-1/2 h-0.5 w-1.5 bg-amber-500/70 dark:bg-amber-400/80"
        />

        {/* Live Camera REC Status Badge (Left) */}
        <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
          REC
        </span>

        {/* Core Keyword Text */}
        <span className="relative z-10 font-semibold tracking-[-0.035em] text-zinc-950 dark:text-[#DEDEDE] px-1 sm:px-2">
          {children}
        </span>

        {/* 4K HDR Format Badge (Right) */}
        <span className="relative z-10 hidden min-[480px]:inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-amber-700 dark:text-amber-400 uppercase select-none">
          4K HDR
        </span>
      </span>
    </span>
  );
}

export function HeroIntroSection() {
  return (
    <section className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-12 pb-14 text-center sm:pt-20 lg:pt-24 overflow-hidden">
      {/* Bespoke Cinema & Camera Gear Wireframe Background Artwork */}
      <HeroCameraArtwork />

      <div className="relative z-10">
        <div className="landing-reveal group relative mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/80 px-4 py-1.5 text-[10.5px] font-semibold tracking-[0.18em] uppercase text-zinc-700 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-zinc-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:shadow-[0_2px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] dark:hover:border-white/20 dark:hover:bg-white/[0.07]">
          {/* Specular glass highlight line at the top */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 dark:via-[#DEDEDE]/30 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          <Sparkles className="h-3 w-3 text-amber-500 dark:text-[#DEDEDE]/70 transition-colors group-hover:text-amber-600 dark:group-hover:text-[#DEDEDE]" />
          <span>Browser-native video editing</span>
        </div>

        <h1 className="landing-reveal landing-reveal-delay-1 relative mx-auto mt-7 max-w-4xl text-balance text-[clamp(2.4rem,6.5vw,5.5rem)] font-medium leading-[1.12] tracking-[-0.04em]">
          <span className="block text-zinc-950 dark:text-[#DEDEDE]">The local-first</span>
          <span className="mt-3 block">
            <ViewfinderCameraFrame>Video editor</ViewfinderCameraFrame>
          </span>
        </h1>

        <p className="landing-reveal landing-reveal-delay-2 mx-auto mt-6 max-w-3xl text-center text-base sm:text-lg leading-relaxed sm:leading-8 tracking-[-0.01em] text-zinc-600 dark:text-[#808080]">
          <span className="sm:block">
            A simple but powerful{" "}
            <span className="font-semibold text-zinc-900 dark:text-[#DEDEDE]">
              multitrack video editor
            </span>{" "}
            that runs entirely in your browser.
          </span>
          <span className="sm:block mt-1 sm:mt-1.5 font-medium text-zinc-800 dark:text-[#DEDEDE]">
            No cloud uploads, no account required,
          </span>
          <span className="sm:block mt-0.5 sm:mt-1 font-semibold text-zinc-950 dark:text-[#DEDEDE]">
            100% private to your device.
          </span>
        </p>

        <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <PrimaryLink>Start a local edit</PrimaryLink>
          <a
            href="#showcase"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300/90 bg-white/90 px-5 text-sm font-semibold text-zinc-800 shadow-xs transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98] dark:border-[#DEDEDE]/15 dark:bg-mkt-surface/90 dark:text-[#DEDEDE] dark:shadow-none dark:hover:border-[#DEDEDE]/30 dark:hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            See the workspace
          </a>
        </div>

        {/* Technical Specs Bar */}
        <div className="landing-reveal landing-reveal-delay-4 mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-500 dark:text-[#808080]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            WebCodecs 60 FPS
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            Dexie IndexedDB
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            Zero cloud uploads
          </span>
        </div>
      </div>
    </section>
  );
}
