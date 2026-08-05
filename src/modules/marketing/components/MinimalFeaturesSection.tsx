import Image from "next/image";
import { Download, LockKeyhole, Scissors } from "lucide-react";
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
      <section
        id="showcase"
        className="mx-auto max-w-[1120px] px-5 pt-12 sm:px-8 sm:pt-16"
      >
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

      <section
        id="features"
        className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
      >
        <div className="landing-reveal mb-10 grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <span className="font-mono text-[10px] tracking-[0.18em] text-brand uppercase">
              Built for the edit
            </span>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-medium tracking-[-0.045em] sm:text-5xl">
              Everything important. Nothing in the way.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-mkt-muted md:justify-self-end">
            One deliberate workspace for the timeline, canvas, sound, and
            export—without sending your project somewhere else.
          </p>
        </div>

        <div className="grid border-y border-mkt-border md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className={cn(
                "landing-reveal group py-8 transition-transform duration-300 hover:-translate-y-1 md:px-8 md:py-10",
                index === 0 && "landing-reveal-delay-1",
                index === 1 && "landing-reveal-delay-2",
                index === 2 && "landing-reveal-delay-3",
                index > 0 &&
                  "border-t border-mkt-border md:border-t-0 md:border-l",
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
                <span className="font-mono text-[10px] text-mkt-muted">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-mkt-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
