import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="marketing-grid relative overflow-hidden border-b border-mkt-border">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] lg:items-end lg:gap-16 lg:px-10 lg:pb-20 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-muted shadow-[0_1px_0_rgba(23,24,21,0.08)]">
            <span className="h-2 w-2 rounded-full bg-mkt-success" />
            Local engine ready
          </div>

          <h1 className="text-balance max-w-5xl text-[clamp(3.2rem,7.4vw,7.25rem)] font-black leading-[0.92] tracking-[-0.065em] text-mkt-fg">
            A serious video editor.{" "}
            <span className="text-brand">In your browser.</span>
          </h1>

          <div className="mt-8 flex max-w-3xl flex-col gap-7 border-l-2 border-mkt-fg pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-7">
            <p className="max-w-xl text-base leading-7 text-mkt-muted sm:text-lg">
              Cutframe gives you a precise multitrack timeline, canvas controls,
              audio mixing, and local export—without sending your footage to a
              server.
            </p>
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <Link
                href="/studio/new"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mkt-fg px-6 text-sm font-bold text-mkt-surface transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Open the editor
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <span className="text-xs font-medium text-mkt-muted">
                Free · no sign-up · no upload
              </span>
            </div>
          </div>
        </div>

        <aside
          className="grid gap-px overflow-hidden rounded-2xl border border-mkt-border bg-mkt-border shadow-[0_18px_60px_rgba(23,24,21,0.08)]"
          aria-label="Product benefits"
        >
          <div className="bg-mkt-surface p-5 sm:p-6">
            <ShieldCheck
              className="mb-8 h-6 w-6 text-brand"
              aria-hidden="true"
            />
            <p className="text-sm font-bold text-mkt-fg">
              Your footage stays yours.
            </p>
            <p className="mt-1.5 text-sm leading-6 text-mkt-muted">
              Media and project data remain inside this browser on this device.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-mkt-border">
            {[
              "Multitrack timeline",
              "1080p export",
              "Autosave locally",
              "No watermark",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-mkt-surface px-4 py-3 text-xs font-semibold text-mkt-fg sm:px-5"
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-mkt-success"
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
