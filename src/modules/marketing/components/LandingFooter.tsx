import React from "react";
import Link from "next/link";
import { BrandMark } from "@/shared/components/BrandMark";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-mkt-border bg-mkt-surface py-12 text-mkt-muted">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        {/* Logo & Description */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-lg font-black tracking-[-0.03em] text-mkt-fg">
              Cutframe
            </span>
          </Link>
          <p className="text-xs text-mkt-muted max-w-sm">
            Local-first browser video editor. Built for fast, private multitrack
            video editing directly inside your web browser.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-mkt-fg">
          <Link href="/studio" className="hover:underline">
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
        <div className="text-xs text-mkt-muted">
          © {currentYear} Cutframe. All media processed locally on device.
        </div>
      </div>
    </footer>
  );
}
