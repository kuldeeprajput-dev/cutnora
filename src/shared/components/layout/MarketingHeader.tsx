import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { Container } from './Container';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-mkt-border bg-mkt-bg/90 backdrop-blur-md">
      <Container size="lg" className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-transform group-hover:scale-105">
            <Film className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-mkt-fg">Cutframe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-mkt-muted">
          <Link href="#features" className="transition-colors hover:text-mkt-fg">
            Features
          </Link>
          <Link href="#workflow" className="transition-colors hover:text-mkt-fg">
            Workflow
          </Link>
          <Link href="#privacy" className="transition-colors hover:text-mkt-fg">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Open Studio
          </Link>
        </div>
      </Container>
    </header>
  );
}
