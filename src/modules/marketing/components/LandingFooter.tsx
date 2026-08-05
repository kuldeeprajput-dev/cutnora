import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#D9D5CC] bg-[#ECE9E2] py-12 text-[#6F716F]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        
        {/* Logo & Description */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#151619]">Cutframe</span>
          </Link>
          <p className="text-xs text-[#6F716F] max-w-sm">
            Local-first browser video editor. Built for fast, private multitrack video editing directly inside your web browser.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#151619]">
          <Link href="/studio/new" className="hover:underline">
            Open Studio
          </Link>
          <a href="#features" className="hover:underline">
            Features
          </a>
          <a href="#workflow" className="hover:underline">
            Workflow
          </a>
          <a href="#privacy" className="hover:underline">
            Privacy
          </a>
          <a href="#faq" className="hover:underline">
            FAQ
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[#6F716F]">
          © {currentYear} Cutframe. All media processed locally on device.
        </div>

      </div>
    </footer>
  );
}
