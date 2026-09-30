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
import { ProjectCtaSection } from "./ProjectCtaSection";

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
    question: "Does Cutnora upload my media?",
    answer:
      "No. Imported media and project data stay in your browser on this device.",
  },
  {
    question: "Do I need an account?",
    answer: "No account or sign-in is required to start a local project.",
  },
  {
    question: "What can I edit?",
    answer:
      "Cutnora supports multitrack video, audio, text, graphic layers, canvas transforms, and local export.",
  },
  {
    question: "Will the editor work on a phone?",
    answer:
      "The marketing page adapts to small screens, but the editing workspace is intentionally designed for desktop displays.",
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

          {/* FAQ Section - Styled to match Features section above */}
          <section
            id="faq"
            className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-14"
          >
            {/* Header: Left-aligned title + Right-aligned description matching Features */}
            <div className="landing-reveal mb-8 sm:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
              <div>
                <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
                  <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-[#808080]" />
                  Questions
                </span>
                <h2 className="mt-3.5 max-w-xl text-balance text-3xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] sm:text-4xl lg:text-5xl leading-[1.08]">
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

            {/* Vertical Accordion matching section width and style */}
            <div className="landing-reveal landing-reveal-delay-1 border-t border-zinc-200 dark:border-white/[0.10]">
              {questions.map(({ question, answer }, index) => (
                <details
                  key={question}
                  className="group border-b border-zinc-200 dark:border-white/[0.10] transition-colors duration-200"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 sm:gap-6 py-5 sm:py-7 text-left text-base sm:text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-[#DEDEDE] transition-colors duration-200 hover:text-zinc-700 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current select-none">
                    <span className="flex items-center gap-3 sm:gap-6">
                      <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-[#808080]">
                        0{index + 1}
                      </span>
                      <span>{question}</span>
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100/60 dark:border-white/10 dark:bg-white/[0.04] text-zinc-400 dark:text-[#808080] transition-all duration-300 group-hover:border-zinc-300 group-hover:text-zinc-950 dark:group-hover:border-white/20 dark:group-hover:text-[#DEDEDE] group-open:rotate-45">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </summary>
                  <div className="pb-6 sm:pb-7 pl-6 sm:pl-11 pr-2 sm:pr-16 max-w-3xl text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080]">
                    {answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA Section - max-w-7xl */}
          <ProjectCtaSection starCount={starCount} />
        </main>

        {/* Modern Elevated Footer */}
        <footer className="w-full border-t border-zinc-200 dark:border-white/[0.08] bg-mkt-bg pt-10 pb-8 text-xs text-zinc-500 dark:text-[#808080] transition-colors duration-300">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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

                {/* Open Projects Link */}
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 dark:border-white/10 bg-zinc-100/70 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-[#DEDEDE] transition-all hover:border-zinc-300 hover:bg-zinc-200/80 dark:hover:border-white/20 dark:hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Projects</span>
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
