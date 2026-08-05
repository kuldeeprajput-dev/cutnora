import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { Container } from './Container';

export function MarketingFooter() {
  return (
    <footer className="border-t border-mkt-border bg-mkt-surface-secondary py-12 text-mkt-muted">
      <Container size="lg" className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Film className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-mkt-fg">Cutframe</span>
        </div>

        <p className="text-xs text-mkt-muted">
          © {new Date().getFullYear()} Cutframe. Local-first browser video editor. All media files remain strictly on your device.
        </p>

        <div className="flex items-center gap-6 text-xs font-medium text-mkt-fg">
          <Link href="/studio" className="hover:underline">
            Studio
          </Link>
          <Link href="#privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
