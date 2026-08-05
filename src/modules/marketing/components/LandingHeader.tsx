'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9D5CC] bg-[#F6F4EF]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Mark & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#FF5A36" />
            <path
              d="M10 8L22 8C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10C8 8.89543 8.89543 8 10 8Z"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M14 12L20 16L14 20V12Z" fill="white" />
            <line x1="8" y1="14" x2="24" y2="14" stroke="#FF5A36" strokeWidth="1.5" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#151619]">Cutframe</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6F716F]">
          <a href="#features" className="transition-colors hover:text-[#151619]">
            Features
          </a>
          <a href="#workflow" className="transition-colors hover:text-[#151619]">
            Workflow
          </a>
          <a href="#privacy" className="transition-colors hover:text-[#151619]">
            Privacy
          </a>
          <a href="#faq" className="transition-colors hover:text-[#151619]">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/studio/new"
            className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-[#151619] transition-colors hover:bg-[#ECE9E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36]"
          >
            Open Studio
          </Link>
          <Link
            href="/studio/new"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#FF5A36] px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#E84928] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2"
          >
            Start editing
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#151619] hover:bg-[#ECE9E2] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36]"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Collapsible Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-[#D9D5CC] bg-[#F6F4EF] px-4 pt-3 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#151619]">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-[#FF5A36]"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-[#FF5A36]"
            >
              Workflow
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-[#FF5A36]"
            >
              Privacy
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-[#FF5A36]"
            >
              FAQ
            </a>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/studio/new"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D9D5CC] bg-[#FFFFFF] text-sm font-medium text-[#151619]"
            >
              Open Studio
            </Link>
            <Link
              href="/studio/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#FF5A36] text-sm font-medium text-white"
            >
              Start editing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
