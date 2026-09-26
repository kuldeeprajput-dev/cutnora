import React from "react";
import Link from "next/link";
import { BrandMark } from "@/shared/components/BrandMark";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#0d0d0d] py-12 text-zinc-500">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        {/* Logo & Description */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="group flex items-center gap-2.5">
            <BrandMark size={28} className="transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold tracking-tight text-white">
              Cutnora
            </span>
          </Link>
          <p className="text-xs text-zinc-400 max-w-sm">
            Local-first browser video editor. Built for fast, private multitrack
            video editing directly inside your web browser.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-zinc-400">
          <Link href="/projects" className="transition-colors hover:text-white">
            Projects
          </Link>
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#workflow" className="transition-colors hover:text-white">
            Workflow
          </a>
          <a href="#privacy" className="transition-colors hover:text-white">
            Privacy
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-zinc-500">
          © {currentYear} Cutnora. All media processed locally on device.
        </div>
      </div>
    </footer>
  );
}
