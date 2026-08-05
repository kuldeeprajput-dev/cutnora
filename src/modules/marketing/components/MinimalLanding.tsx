import { BrandMark } from "@/shared/components/BrandMark";
import { LandingHeaderNav, HeroIntroSection, PrimaryLink } from "./LandingHeroView";
import { MinimalFeaturesSection } from "./MinimalFeaturesSection";

const questions = [
  {
    question: "Does Cutframe upload my media?",
    answer:
      "No. Imported media and project data stay in your browser on this device.",
  },
  {
    question: "Do I need an account?",
    answer: "No account or sign-in is required to start a local project.",
  },
  {
    question: "What can I edit?",
    answer:
      "Cutframe supports multitrack video, audio, text, graphic layers, canvas transforms, and local export.",
  },
  {
    question: "Will the editor work on a phone?",
    answer:
      "The marketing page adapts to small screens, but the editing workspace is intentionally designed for desktop displays.",
  },
] as const;

export function MinimalLanding() {
  return (
    <div className="min-h-screen overflow-x-clip bg-mkt-bg text-mkt-fg">
      <LandingHeaderNav />

      <main>
        <HeroIntroSection />
        <MinimalFeaturesSection />

        <section id="faq" className="border-t border-mkt-border bg-mkt-surface-secondary/70 py-20 sm:py-28">
          <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-brand uppercase">
                Questions
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                The useful answers.
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-[1200px] space-y-4">
              {questions.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-mkt-border bg-mkt-surface p-5 shadow-[0_4px_16px_rgb(0_0_0_/_0.03)] transition-colors hover:border-brand/40 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-mkt-fg select-none">
                    <span className="text-sm sm:text-base">{item.question}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mkt-border bg-mkt-surface-secondary text-mkt-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-mkt-muted sm:text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="rounded-3xl border border-mkt-border bg-mkt-surface p-8 text-center shadow-[0_16px_50px_rgb(0_0_0_/_0.05)] sm:p-14">
            <p className="text-[11px] font-bold tracking-[0.18em] text-brand uppercase">
              Start Now
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
              Open the editor and start.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs text-mkt-muted sm:text-sm">
              Your media stays on your computer. Start editing immediately without cloud setup.
            </p>

            <div className="mt-8 flex justify-center">
              <PrimaryLink>Open editor workspace</PrimaryLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-mkt-border bg-mkt-surface py-10 text-xs text-mkt-muted">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="font-bold tracking-[0.16em] uppercase text-mkt-fg">
              Cutframe
            </span>
          </div>
          <p>© {new Date().getFullYear()} Cutframe. Browser-native video editing.</p>
        </div>
      </footer>
    </div>
  );
}
