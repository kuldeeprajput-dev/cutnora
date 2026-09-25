"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Star, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { siteConfig } from "@/config/site";
import {
  LandingHeaderNav,
  HeroIntroSection,
  GithubIcon,
} from "./LandingHeroView";
import { MinimalFeaturesSection } from "./MinimalFeaturesSection";
import { StudioCtaSection } from "./StudioCtaSection";

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const questions = [
  {
    tag: "01 · Architecture",
    question: "Does Cutnora upload my media to any server?",
    answer:
      "No. All media decoding, timeline manipulation, and video rendering happen 100% locally in your browser using hardware-accelerated WebCodecs and IndexedDB. Your footage and audio never leave your device.",
  },
  {
    tag: "02 · Zero friction",
    question: "Do I need an account or subscription?",
    answer:
      "No account, sign-in, or payment is required. You can launch the studio directly and start editing right away with zero friction, no paywalls, and no watermarks on your exports.",
  },
  {
    tag: "03 · Capabilities",
    question: "What media formats and resolutions can I edit?",
    answer:
      "Cutnora supports multi-track video (MP4, WebM, MOV), multiple audio tracks (MP3, WAV, AAC), image formats, text overlays, and graphic layers up to 4K 60 FPS, depending on your device hardware.",
  },
  {
    tag: "04 · Persistence",
    question: "Will my projects be saved if I close or refresh the tab?",
    answer:
      "Yes. Cutnora automatically persists your project state, timeline track layout, and local media references in your browser's IndexedDB storage so you can safely resume your work anytime.",
  },
  {
    tag: "05 · Platform",
    question: "Can I use Cutnora on a mobile phone or tablet?",
    answer:
      "The marketing website is responsive, but the studio workspace and multitrack timeline are deliberately crafted for desktop and laptop displays with keyboard shortcuts and multi-track precision.",
  },
  {
    tag: "06 · Licensing",
    question: "Is Cutnora free and open-source?",
    answer:
      "Yes, Cutnora is fully open-source. You can inspect the source code, run it locally, contribute, or star the repository on GitHub. Everything is transparent and community-driven.",
  },
] as const;

export function MinimalLanding() {
  const [starCount, setStarCount] = useState<number | null>(6);

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
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-mkt-bg text-mkt-fg transition-colors duration-300">
      <LandingHeaderNav />

      {/* Main Page Scroll Container: starts strictly below the navbar with custom scrollbar */}
      <div
        id="landing-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-clip app-custom-scrollbar scroll-smooth"
      >
        <main>
          <HeroIntroSection />
          <MinimalFeaturesSection />

          {/* FAQ Section - Full Width max-w-[1720px] Matching Hero & Features */}
          <section
            id="faq"
            className="relative mx-auto w-full max-w-[1720px] scroll-mt-20 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-14 sm:pb-20"
          >
            {/* Header: Left-aligned title + Right-aligned description */}
            <div className="landing-reveal mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#808080]" />
                  Frequently asked
                </span>
                <h2 className="mt-3.5 max-w-xl text-balance text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] leading-[1.08]">
                  The useful answers.
                  <span className="block text-zinc-500 dark:text-[#808080]">
                    Clear and upfront.
                  </span>
                </h2>
              </div>
              <p className="max-w-md text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080] md:pb-1">
                Everything you need to know about browser-native editing, local privacy, format support, and offline persistence.
              </p>
            </div>

            {/* 2-Column Full-Width Accordion Grid (No harsh full-width divider lines) */}
            <div className="landing-reveal landing-reveal-delay-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {questions.map(({ tag, question, answer }) => (
                <details
                  key={question}
                  className="group rounded-2xl sm:rounded-[22px] border border-zinc-200/90 bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/95 dark:hover:bg-white/[0.04] open:border-zinc-300 dark:open:border-white/[0.18] open:bg-white/90 dark:open:bg-white/[0.04] open:shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:open:shadow-[0_12px_44px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:p-6 text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-[#808080] uppercase">
                        {tag}
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-100/80 dark:border-white/10 dark:bg-white/[0.05] text-zinc-500 dark:text-[#808080] transition-all duration-300 group-hover:border-zinc-300 group-hover:bg-zinc-200/80 group-hover:text-zinc-950 dark:group-hover:border-white/20 dark:group-hover:bg-white/[0.12] dark:group-hover:text-white group-open:rotate-45 group-open:bg-zinc-950 group-open:text-white group-open:border-zinc-950 dark:group-open:bg-[#DEDEDE] dark:group-open:text-zinc-950 dark:group-open:border-[#DEDEDE]">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-medium tracking-tight text-zinc-950 dark:text-[#DEDEDE] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      {question}
                    </span>
                  </summary>
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080] border-t border-zinc-100 dark:border-white/[0.05] pt-3.5">
                    {answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA Section - Cinematic Studio Timeline Stage & Launchpad */}
          <StudioCtaSection starCount={starCount} />
        </main>

        {/* Modern Elevated Footer */}
        <footer className="w-full border-t border-zinc-200 dark:border-white/[0.08] bg-mkt-bg pt-10 pb-8 text-xs text-zinc-500 dark:text-[#808080] transition-colors duration-300">
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8">
            {/* Top Primary Row */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-5">
              {/* Brand Logo & Tagline */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <BrandMark size={28} variant="marketing" className="transition-transform duration-300 group-hover:scale-105" />
                  <span className="text-[13px] font-bold tracking-[0.18em] text-zinc-950 dark:text-[#DEDEDE] uppercase">
                    Cutnora
                  </span>
                </Link>
                <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>
                <p className="text-zinc-600 dark:text-[#808080] text-xs">
                  The local-first browser video editor. 100% private to your device.
                </p>
              </div>

              {/* Social & Quick Links */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Twitter / X Profile */}
                <a
                  href={siteConfig.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kuldeep on X (Twitter)"
                  className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/10 bg-zinc-100/70 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-[#DEDEDE] transition-all hover:border-zinc-300 hover:bg-zinc-200/80 dark:hover:border-white/20 dark:hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <XTwitterIcon className="h-3.5 w-3.5 fill-current transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-mono text-[11px] font-semibold text-zinc-950 dark:text-white">@kuldeepdotcom</span>
                </a>

                {/* GitHub Repo */}
                <a
                  href={siteConfig.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Cutnora on GitHub"
                  className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/10 bg-zinc-100/70 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-[#DEDEDE] transition-all hover:border-zinc-300 hover:bg-zinc-200/80 dark:hover:border-white/20 dark:hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <GithubIcon className="h-3.5 w-3.5 fill-current transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-mono text-[11px]">GitHub</span>
                </a>

                {/* Open Studio Link */}
                <Link
                  href="/studio"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 dark:border-white/10 bg-zinc-100/70 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-[#DEDEDE] transition-all hover:border-zinc-300 hover:bg-zinc-200/80 dark:hover:border-white/20 dark:hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Studio</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>

            {/* Bottom Info Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-[11px] font-mono text-zinc-500 dark:text-[#808080]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span>Client-side WebCodecs & IndexedDB · No cloud upload</span>
              </div>
              <p>
                © {new Date().getFullYear()} Cutnora. Built by{" "}
                <a
                  href={siteConfig.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-900 dark:text-[#DEDEDE] hover:underline font-semibold"
                >
                  @kuldeepdotcom
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
