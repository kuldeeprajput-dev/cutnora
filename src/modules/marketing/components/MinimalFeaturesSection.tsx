import Image from "next/image";
import { Download, LockKeyhole, Scissors } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ShowcaseBackgroundGrid } from "./ShowcaseStudioArtwork";

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
      <section
        id="showcase"
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 overflow-hidden"
      >
        {/* Ambient Background Grid Pattern matching Hero */}
        <ShowcaseBackgroundGrid />

        {/* Ambient Subtle Glow behind showcase */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-full max-w-[1000px] rounded-full bg-gradient-to-tr from-zinc-200/50 via-transparent to-transparent dark:from-[#DEDEDE]/[0.06] dark:via-transparent dark:to-transparent blur-[120px] -z-10" />

        {/* Center Showcase Browser Frame */}
        <div className="landing-showcase-reveal relative mx-auto w-full max-w-7xl overflow-hidden rounded-[22px] sm:rounded-[26px] border border-zinc-200/90 dark:border-white/[0.12] bg-white/95 dark:bg-mkt-surface/85 p-2 sm:p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-all duration-300">
          {/* Top specular highlight line */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-[#DEDEDE]/25 to-transparent"
          />

          {/* Browser Header Bar */}
          <div className="flex h-9 items-center gap-2 border-b border-zinc-200/80 dark:border-mkt-border px-2 pb-2 sm:px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-[#DEDEDE]/30 transition-colors" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-[#DEDEDE]/30 transition-colors" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-[#DEDEDE]/30 transition-colors" />
            <div className="ml-2 flex min-w-0 items-center gap-2 rounded-full border border-zinc-200 dark:border-mkt-border bg-zinc-100/90 dark:bg-mkt-surface-secondary/80 px-3 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:text-[#808080]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />
              <span className="truncate">cutnora.app/studio/coastal-notes</span>
            </div>
            <span className="ml-auto hidden rounded-full border border-zinc-200 dark:border-mkt-border bg-zinc-100/90 dark:bg-mkt-surface-secondary/80 px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-zinc-600 dark:text-[#808080] uppercase sm:inline-flex">
              Local project
            </span>
          </div>

          {/* Showcase Image with refined inner border */}
          <div className="relative mt-2 sm:mt-2.5 aspect-[1672/941] w-full overflow-hidden rounded-xl sm:rounded-[18px] border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-100 dark:bg-mkt-surface-secondary">
            <Image
              src="/images/landing-page-showcase-light.webp"
              alt="Cutnora light editor showing the Coastal Notes project, coastal footage, and a multitrack timeline"
              fill
              priority
              draggable={false}
              className="landing-showcase-image--light object-cover object-top"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <Image
              src="/images/landing-page-showcase-dark.webp"
              alt="Cutnora dark editor showing the Coastal Notes project, coastal footage, and a multitrack timeline"
              fill
              priority
              draggable={false}
              className="landing-showcase-image--dark object-cover object-top"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20"
      >
        <div className="landing-reveal mb-14 sm:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
              <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-[#808080]" />
              Built for the edit
            </span>
            <h2 className="mt-3.5 max-w-xl text-balance text-3xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] sm:text-4xl lg:text-5xl leading-[1.08]">
              Everything important.
              <span className="block text-zinc-500 dark:text-[#808080]">
                Nothing in the way.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080] md:pb-1">
            One deliberate workspace for the timeline, canvas, sound, and
            export—without sending your project somewhere else.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {principles.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className={cn(
                "landing-reveal group relative border-t border-zinc-200 dark:border-white/[0.10] pt-6 sm:pt-8 transition-all duration-300",
                index === 0 && "landing-reveal-delay-1",
                index === 1 && "landing-reveal-delay-2",
                index === 2 && "landing-reveal-delay-3",
              )}
            >
              {/* Top subtle highlight line on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-900/40 dark:via-[#DEDEDE]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-[#808080]">
                  0{index + 1}
                </span>
                <Icon
                  className="h-4.5 w-4.5 text-zinc-500 dark:text-[#808080] transition-transform duration-300 group-hover:scale-110 group-hover:text-zinc-950 dark:group-hover:text-[#DEDEDE]"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-6 text-lg sm:text-xl font-medium tracking-tight text-zinc-950 dark:text-[#DEDEDE] transition-colors duration-200">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-[#808080]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
