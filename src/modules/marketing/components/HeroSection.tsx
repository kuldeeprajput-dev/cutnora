import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="marketing-grid relative overflow-hidden border-b border-white/[0.08] bg-[#0d0d0d]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] lg:items-end lg:gap-16 lg:px-10 lg:pb-20 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Local engine ready
          </div>

          <h1 className="text-balance max-w-5xl text-[clamp(3.2rem,7.4vw,7.25rem)] font-medium leading-[0.92] tracking-[-0.065em] text-white">
            A serious video editor.{" "}
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-400 bg-clip-text text-transparent">
              In your browser.
            </span>
          </h1>

          <div className="mt-8 flex max-w-3xl flex-col gap-7 border-l-2 border-white/20 pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-7">
            <p className="max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Cutnora gives you a precise multitrack timeline, canvas controls,
              audio mixing, and local export—without sending your footage to a
              server.
            </p>
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <Link
                href="/projects/new"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_0_36px_rgba(255,255,255,0.28)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Open the editor
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <span className="text-xs font-medium text-zinc-500">
                Free · no sign-up · no upload
              </span>
            </div>
          </div>
        </div>

        <aside
          className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
          aria-label="Product benefits"
        >
          <div className="bg-[#141416] p-5 sm:p-6">
            <ShieldCheck
              className="mb-8 h-6 w-6 text-white"
              aria-hidden="true"
            />
            <p className="text-sm font-bold text-white">
              Your footage stays yours.
            </p>
            <p className="mt-1.5 text-sm leading-6 text-zinc-400">
              Media and project data remain inside this browser on this device.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/[0.08]">
            {[
              "Multitrack timeline",
              "1080p export",
              "Autosave locally",
              "No watermark",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-[#141416] px-4 py-3 text-xs font-semibold text-zinc-200 sm:px-5"
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
