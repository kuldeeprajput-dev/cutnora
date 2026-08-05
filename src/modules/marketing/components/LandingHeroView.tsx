import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

export function PrimaryLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/studio/new"
      className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgb(196_81_0_/_0.18)] transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-bg"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function LandingHeaderNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-mkt-border/80 bg-mkt-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Cutframe home"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <BrandMark size={30} />
          <span className="hidden text-[13px] font-bold tracking-[0.18em] uppercase min-[480px]:inline">
            Cutframe
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-xs font-medium text-mkt-muted md:flex"
          aria-label="Primary navigation"
        >
          <a className="transition-colors hover:text-mkt-fg" href="#showcase">
            Showcase
          </a>
          <a className="transition-colors hover:text-mkt-fg" href="#features">
            Features
          </a>
          <a className="transition-colors hover:text-mkt-fg" href="#faq">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/studio"
            className="inline-flex h-10 items-center justify-center rounded-full border border-mkt-border bg-mkt-surface px-3.5 text-xs font-semibold text-mkt-fg shadow-[0_3px_8px_rgb(0_0_0_/_0.08)] transition-colors hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-4"
          >
            Studio
          </Link>
          <Link
            href="/studio/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-bg sm:px-4"
          >
            Start editor{" "}
            <ArrowUpRight className="hidden h-3.5 w-3.5 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function HeroIntroSection() {
  return (
    <section className="mx-auto max-w-[1120px] px-5 pt-14 text-center sm:px-8 sm:pt-24 lg:pt-28">
      <div className="landing-reveal mx-auto inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-mkt-muted uppercase shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        Browser-native video editing
      </div>

      <h1 className="landing-reveal landing-reveal-delay-1 mx-auto mt-7 max-w-4xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.065em]">
        <span className="block">
          <span className="landing-kinetic-word">Edit</span>{" "}
          <span className="landing-kinetic-word">every</span>{" "}
          <span className="landing-kinetic-word">frame.</span>
        </span>
        <span className="block text-brand">
          <span className="landing-kinetic-word">Keep</span>{" "}
          <span className="landing-kinetic-word">every</span>{" "}
          <span className="landing-kinetic-word">file</span>{" "}
          <span className="landing-kinetic-word">yours.</span>
        </span>
      </h1>

      <p className="landing-reveal landing-reveal-delay-2 mx-auto mt-6 max-w-xl text-balance text-base leading-7 text-mkt-muted sm:text-lg">
        A focused multitrack editor that runs where your footage already is.
        No upload, no account, no waiting.
      </p>

      <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <PrimaryLink>Start a local edit</PrimaryLink>
        <a
          href="#showcase"
          className="inline-flex h-11 items-center justify-center rounded-full border border-mkt-border bg-mkt-surface px-5 text-sm font-semibold text-mkt-fg transition-colors hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          See the workspace
        </a>
      </div>
    </section>
  );
}
