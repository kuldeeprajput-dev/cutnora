import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@/shared/components/BrandMark';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Container } from './Container';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0d0d0d]/80 transition-colors duration-300">
      <Container size="lg" className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark variant="marketing" className="transition-transform group-hover:scale-105 group-hover:-rotate-3" />
          <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Cutnora</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="#features" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Features
          </Link>
          <Link href="#workflow" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Workflow
          </Link>
          <Link href="#privacy" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="h-9 w-9 sm:h-9 sm:w-9" />
          <Link
            href="/projects"
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Projects
          </Link>
        </div>
      </Container>
    </header>
  );
}
