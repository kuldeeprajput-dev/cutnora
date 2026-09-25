import { Plus } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import {
  LandingHeaderNav,
  HeroIntroSection,
  PrimaryLink,
} from "./LandingHeroView";
import { MinimalFeaturesSection } from "./MinimalFeaturesSection";

const questions = [
  {
    question: "Does Cutnora upload my media?",
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
      "Cutnora supports multitrack video, audio, text, graphic layers, canvas transforms, and local export.",
  },
  {
    question: "Will the editor work on a phone?",
    answer:
      "The marketing page adapts to small screens, but the editing workspace is intentionally designed for desktop displays.",
  },
] as const;

export function MinimalLanding() {
  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-mkt-bg text-mkt-fg transition-colors duration-300">
      <LandingHeaderNav />

      {/* Main Page Scroll Container: starts strictly below the navbar with custom scrollbar */}
      <div
        id="landing-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-clip app-custom-scrollbar scroll-smooth"
      >
        <main>
        <HeroIntroSection />
        <MinimalFeaturesSection />

        {/* FAQ Section */}
        <section
          id="faq"
          className="mx-auto max-w-[800px] scroll-mt-20 px-5 pt-8 pb-24 sm:px-8 sm:pb-32"
        >
          <div className="landing-reveal text-center">
            <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
              <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-[#808080]" />
              Questions
            </span>
            <h2 className="mt-3.5 text-balance text-3xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] sm:text-4xl lg:text-5xl">
              The useful answers.
            </h2>
          </div>
          <div className="landing-reveal landing-reveal-delay-1 mt-12 sm:mt-16 border-t border-zinc-200 dark:border-white/[0.08]">
            {questions.map(({ question, answer }) => (
              <details
                key={question}
                className="group border-b border-zinc-200 dark:border-white/[0.08] transition-colors duration-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 sm:py-6 text-left text-[15px] sm:text-[17px] font-medium tracking-[-0.02em] text-zinc-950 dark:text-[#DEDEDE] transition-colors duration-200 hover:text-zinc-700 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current select-none">
                  <span>{question}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center text-zinc-400 dark:text-[#808080] transition-colors duration-300 group-hover:text-zinc-950 dark:group-hover:text-[#DEDEDE]">
                    <Plus className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
                  </span>
                </summary>
                <p className="pb-6 pr-10 text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-[#808080]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-white/[0.08] pt-20 sm:pt-28 pb-20 sm:pb-32 text-center overflow-hidden">
          {/* Subtle luminous ambient glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-full max-w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(222,222,222,0.06),transparent_70%)] blur-3xl opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />

          <div className="landing-reveal relative z-10 mx-auto max-w-2xl">
            <div className="inline-flex items-center justify-center">
              <BrandMark
                size={34}
                variant="marketing"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.2em] text-zinc-600 dark:text-[#808080] uppercase">
                <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-[#808080]" />
                Ready when you are
              </span>
            </div>

            <h2 className="mt-4 text-balance text-3xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-[#DEDEDE] sm:text-5xl lg:text-6xl leading-[1.08]">
              Your next cut starts here.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-[#808080]">
              Open a local project and start editing. Nothing to install and nothing to upload.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <PrimaryLink>Open Cutnora</PrimaryLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-mkt-border bg-mkt-bg py-10 text-xs text-zinc-500 dark:text-[#808080] transition-colors duration-300">
        <div className="mx-auto flex w-full max-w-[1720px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark size={24} variant="marketing" />
            <span className="text-[12px] font-bold tracking-[0.18em] text-zinc-950 dark:text-[#DEDEDE] uppercase">
              Cutnora
            </span>
          </div>
          <p className="text-zinc-500 dark:text-[#808080]">
            © {new Date().getFullYear()} Cutnora. Browser-native video editing.
          </p>
        </div>
        </footer>
      </div>
    </div>
  );
}
