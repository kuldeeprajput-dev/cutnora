import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#0d0d0d] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Ready when you are
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            Your next cut stays on your machine.
          </h2>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-sm text-sm leading-6 text-zinc-400 lg:text-right">
              Open your project and start with your own footage. No registration,
              cloud sync, or watermark.
            </p>
            <Link
              href="/projects/new"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_0_36px_rgba(255,255,255,0.28)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Start a local project{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
