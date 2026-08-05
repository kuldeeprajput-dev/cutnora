"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mkt-border bg-mkt-bg/95 backdrop-blur-lg">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo Mark & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark className="transition-transform group-hover:-rotate-3" />
          <span className="text-lg font-black tracking-[-0.03em] text-mkt-fg">
            Cutframe
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-mkt-muted">
          <a href="#features" className="transition-colors hover:text-mkt-fg">
            Features
          </a>
          <a href="#workflow" className="transition-colors hover:text-mkt-fg">
            Workflow
          </a>
          <a href="#privacy" className="transition-colors hover:text-mkt-fg">
            Privacy
          </a>
          <a href="#faq" className="transition-colors hover:text-mkt-fg">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/studio/new"
            className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-mkt-fg transition-colors hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Open Studio
          </Link>
          <Link
            href="/studio/new"
            className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-mkt-fg px-5 text-sm font-bold text-mkt-surface transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded-lg p-2 text-mkt-fg hover:bg-mkt-surface-secondary md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
        <div className="border-b border-mkt-border bg-mkt-bg px-4 pt-3 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-mkt-fg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-brand"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-brand"
            >
              Workflow
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-brand"
            >
              Privacy
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-brand"
            >
              FAQ
            </a>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/studio/new"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-mkt-border bg-mkt-surface text-sm font-medium text-mkt-fg"
            >
              Open Studio
            </Link>
            <Link
              href="/studio/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand text-sm font-medium text-white"
            >
              Start editing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
