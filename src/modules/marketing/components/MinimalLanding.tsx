import { Layers3 } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import {
  LandingHeaderNav,
  HeroIntroSection,
  PrimaryLink,
} from "./LandingHeroView";
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

        <section
          id="faq"
          className="mx-auto max-w-[760px] scroll-mt-20 px-5 pb-24 sm:px-8 sm:pb-32"
        >
          <div className="landing-reveal text-center">
            <span className="font-mono text-[10px] tracking-[0.18em] text-brand uppercase">
              Questions
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
              The useful answers.
            </h2>
          </div>
          <div className="landing-reveal landing-reveal-delay-1 mt-10 space-y-2">
            {questions.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border border-mkt-border bg-mkt-surface px-5 transition-colors duration-300 hover:-translate-y-0.5 hover:bg-mkt-surface-secondary open:bg-mkt-surface-secondary"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-bg">
                  {question}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-mkt-border text-mkt-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-xl pb-5 pr-8 text-sm leading-6 text-mkt-muted">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 pb-8 sm:px-8">
          <div className="landing-reveal rounded-[24px] border border-mkt-border bg-mkt-surface p-7 shadow-[0_18px_70px_rgb(0_0_0_/_0.08)] sm:p-10">
            <div className="rounded-[18px] bg-mkt-surface-secondary px-6 py-12 text-center sm:px-10 sm:py-16">
              <Layers3
                className="mx-auto h-6 w-6 text-brand"
                aria-hidden="true"
              />
              <span className="mt-5 block font-mono text-[10px] tracking-[0.18em] text-brand uppercase">
                Ready when you are
              </span>
              <h2 className="mx-auto mt-3 max-w-xl text-balance text-3xl font-medium tracking-[-0.045em] sm:text-5xl">
                Your next cut starts here.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-mkt-muted">
                Open a local project and start editing. Nothing to install and
                nothing to upload.
              </p>
              <div className="mt-7">
                <PrimaryLink>Open Cutframe</PrimaryLink>
              </div>
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
          <p>
            © {new Date().getFullYear()} Cutframe. Browser-native video editing.
          </p>
        </div>
      </footer>
    </div>
  );
}
