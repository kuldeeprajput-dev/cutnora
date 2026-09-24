import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@/shared/components/BrandMark';
import { Container } from './Container';

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0d0d0d] py-12 text-zinc-500">
      <Container size="lg" className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-lg font-bold tracking-tight text-white">Cutnora</span>
        </div>

        <p className="text-xs text-zinc-400">
          © {new Date().getFullYear()} Cutnora. Local-first browser video editor. All media files remain strictly on your device.
        </p>

        <div className="flex items-center gap-6 text-xs font-medium text-zinc-300">
          <Link href="/studio" className="transition-colors hover:text-white">
            Studio
          </Link>
          <Link href="#privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
