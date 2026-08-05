import Image from "next/image";
import {
  Check,
  Download,
  Layers3,
  LockKeyhole,
  Scissors,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

const principles = [
  {
    icon: Scissors,
    title: "A timeline that stays precise",
    body: "Trim, split, layer, and arrange video, audio, text, and graphics in one focused workspace.",
  },
  {
    icon: LockKeyhole,
    title: "Your footage stays local",
    body: "Projects and media remain in this browser. There is no upload queue, account, or cloud detour.",
  },
  {
    icon: Download,
    title: "Finish and export here",
    body: "Preview the final cut, mix audio, and export without moving the project to another application.",
  },
] as const;

export function MinimalFeaturesSection() {
  return (
    <>
      <section id="showcase" className="mx-auto max-w-[1120px] px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="landing-showcase-reveal overflow-hidden rounded-3xl border border-mkt-border bg-mkt-surface p-3 shadow-[0_24px_70px_rgb(0_0_0_/_0.08)] sm:p-5">
          <div className="flex h-9 items-center gap-2 border-b border-mkt-border/70 px-3 pb-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 font-mono text-[11px] font-medium text-mkt-muted">
              cutframe.app/studio
            </span>
          </div>
          <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-mkt-border/80 bg-mkt-surface-secondary">
            <Image
              src="/images/cutframe-editor-showcase.png"
              alt="Cutframe video editor workspace preview"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1200px) 100vw, 1120px"
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-mkt-border pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-brand uppercase">
              Core Workspace
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Built for direct control.
            </h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-mkt-muted sm:text-sm">
            The essential editing primitives, kept accessible in one clean browser application.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={cn(
                  "landing-reveal rounded-3xl border border-mkt-border bg-mkt-surface p-7 shadow-[0_8px_30px_rgb(0_0_0_/_0.04)] transition-transform duration-300 hover:-translate-y-1",
                  index === 0 && "landing-reveal-delay-1",
                  index === 1 && "landing-reveal-delay-2",
                  index === 2 && "landing-reveal-delay-3"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-mkt-muted sm:text-sm">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-mkt-border bg-mkt-surface p-7 shadow-[0_8px_30px_rgb(0_0_0_/_0.04)] sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Layers3 className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold tracking-tight sm:text-lg">
              Included with local editing
            </h3>
          </div>
          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Multitrack canvas layers",
              "Text & title customization",
              "Volume level controls",
              "IndexedDB local persistence",
              "Canvas scale and position",
              "Split and trim controls",
              "Zero account requirements",
              "Fast browser rendering",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2.5 rounded-2xl border border-mkt-border/70 bg-mkt-surface-secondary px-4 py-3 text-xs font-semibold text-mkt-fg"
              >
                <Check className="h-4 w-4 shrink-0 text-brand" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
