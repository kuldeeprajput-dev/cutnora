import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { Container } from './Container';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#D9D5CC] bg-[#ECE9E2] py-12 text-[#6F716F]">
      <Container size="lg" className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5A36] text-white">
            <Film className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#151619]">Cutframe</span>
        </div>

        <p className="text-xs text-[#6F716F]">
          © {new Date().getFullYear()} Cutframe. Local-first browser video editor. All media files remain strictly on your device.
        </p>

        <div className="flex items-center gap-6 text-xs font-medium text-[#151619]">
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
