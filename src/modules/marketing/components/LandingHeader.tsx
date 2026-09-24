"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-[#0d0d0d]/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo Mark & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark variant="marketing" className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3" />
          <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
            Cutnora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#features" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Features
          </a>
          <a href="#workflow" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Workflow
          </a>
          <a href="#privacy" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Privacy
          </a>
          <a href="#faq" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className="h-9 w-9 rounded-full border border-zinc-300/80 bg-white/90 text-zinc-700 shadow-xs hover:border-zinc-400 hover:bg-zinc-100 dark:border-[#DEDEDE]/15 dark:bg-mkt-surface dark:text-[#DEDEDE] dark:hover:border-[#DEDEDE]/30" />
          <Link
            href="/studio"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300/80 bg-zinc-100/80 px-4 text-xs font-semibold text-zinc-800 transition-all hover:bg-zinc-200 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Open Studio
          </Link>
          <Link
            href="/studio/new"
            className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-zinc-950 px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:shadow-[0_0_20px_rgba(255,255,255,0.12)] dark:hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Start editing{" "}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-300 hover:bg-white/[0.06] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Collapsible Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200/80 bg-white/95 px-4 pt-3 pb-6 md:hidden dark:border-white/[0.08] dark:bg-[#0d0d0d]">
          <nav className="flex flex-col gap-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Workflow
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Privacy
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              FAQ
            </a>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Appearance</span>
              <ThemeToggle showLabel className="h-9 px-3 rounded-full border border-zinc-300/80 bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04]" />
            </div>
            <Link
              href="/studio"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 text-sm font-medium text-zinc-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
            >
              Open Studio
            </Link>
            <Link
              href="/studio/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
            >
              Start editing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
