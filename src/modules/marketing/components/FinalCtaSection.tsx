import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="border-t border-brand-hover bg-brand py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
          Ready when you are
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 className="text-balance max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Your next cut stays on your machine.
          </h2>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-sm text-sm leading-6 text-white/80 lg:text-right">
              Open the studio and start with your own footage. No registration,
              cloud sync, or watermark.
            </p>
            <Link
              href="/studio/new"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mkt-fg px-6 text-sm font-bold text-mkt-surface transition-colors hover:bg-studio-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start a local project{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
