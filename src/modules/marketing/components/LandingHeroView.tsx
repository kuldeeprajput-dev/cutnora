"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, Sparkles, Star, X } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { siteConfig } from "@/config/site";
import { cn } from "@/shared/utils/cn";
import { HeroCameraArtwork } from "./HeroCameraArtwork";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(6);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/stars")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (typeof data?.stars === "number") {
          setStarCount(data.stars);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        // Full width edge-to-edge frosted glass (no shrunk container)
        "bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-2xl backdrop-saturate-150",
        // Shadow effect only appears when scrolled down:
        scrolled
          ? "shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_4px_16px_rgba(0,0,0,0.9)]"
          : "shadow-none"
      )}
    >
      {/* Top specular glass rim reflection */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-900/10 dark:via-white/15 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Atmospheric ambient soft falloff gradient beneath header (only on scroll) */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-b from-black/[0.03] dark:from-black/[0.3] to-transparent transition-opacity duration-300",
          scrolled ? "opacity-80" : "opacity-0"
        )}
      />

      <div className="relative mx-auto flex h-[72px] w-full max-w-[1720px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          aria-label="Cutnora home"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <BrandMark
            size={32}
            variant="marketing"
            className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
          />
          <span className="text-[13px] font-bold tracking-[0.18em] text-zinc-900 dark:text-[#DEDEDE] uppercase">
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

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* GitHub Star Button - Clean, aligned badge */}
          <a
            href={siteConfig.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cutnora on GitHub"
            className="group relative inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-100/60 px-3.5 text-xs font-medium text-zinc-700 backdrop-blur-md transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-200/70 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:hover:border-white/20 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            <GithubIcon className="h-4 w-4 fill-current transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline font-semibold text-zinc-900 dark:text-[#DEDEDE]">Stars</span>
            <span className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-[#DEDEDE] leading-none">
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
              <span>{starCount !== null ? (starCount >= 1000 ? `${(starCount / 1000).toFixed(1)}k` : starCount) : "6"}</span>
            </span>
          </a>

          {/* Studio Link */}
          <Link
            href="/studio"
            className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100/60 px-3.5 sm:px-4 text-xs font-semibold text-zinc-800 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-200/70 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Studio
          </Link>

          {/* Start Editor CTA */}
          <Link
            href="/studio/new"
            className="group relative inline-flex h-9 sm:h-10 items-center gap-1.5 overflow-hidden rounded-full bg-zinc-950 px-3.5 sm:px-4 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-zinc-850 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:shadow-[0_0_24px_rgba(222,222,222,0.18)] dark:hover:bg-[#ECECEC] dark:hover:shadow-[0_0_32px_rgba(222,222,222,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Start editor{" "}
            <ArrowUpRight className="hidden h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
          </Link>

          {/* Dark and Light Mode Toggle - Placed at the far right corner */}
          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100/60 text-zinc-700 hover:bg-zinc-200/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (No harsh line, clean frosted glass) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-2xl px-5 py-4 space-y-2 shadow-2xl transition-all">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
            >
              Showcase
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
            >
              FAQ
            </a>
            <a
              href={siteConfig.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
            >
              <span className="flex items-center gap-2">
                <GithubIcon className="h-4 w-4 fill-current" />
                <span>Stars on GitHub</span>
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-[#DEDEDE] leading-none">
                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                <span>{starCount ?? 6}</span>
              </span>
            </a>
          </div>
        </div>
      )}
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
