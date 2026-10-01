import { Play } from "lucide-react";
import { LandingContainer, OpenEditorButton } from "./LandingPrimitives";

export function LandingHero() {
  return (
    <LandingContainer
      as="section"
      className="compact:pt-11 phone:pt-10 phone:pb-8 narrow:pt-8 motion-safe:animate-landing-hero pt-[clamp(40px,4vw,56px)] pb-9 text-center"
      aria-labelledby="landing-heading"
    >
      <h1
        id="landing-heading"
        className="compact:text-[54px] phone:text-[clamp(32px,9vw,46px)] phone:leading-[1.08] phone:tracking-[-0.055em] mx-auto max-w-225 text-[clamp(42px,5.4vw,76px)] leading-[1.04] font-[650] tracking-[-0.06em] text-balance"
      >
        Edit videos directly
        <br />
        <span className="text-[color-mix(in_srgb,var(--studio-fg)_76%,var(--studio-muted))]">
          in your browser.
        </span>
      </h1>
      <p className="text-studio-fg phone:mt-4.5 phone:max-w-85 phone:text-[15px] phone:leading-[1.65] mx-auto mt-5.5 max-w-120 text-[17px] leading-[1.6] tracking-[-0.25px] text-balance">
        Cut, layer, and export videos on your device.
        <span className="text-studio-muted phone:mt-2 phone:text-[13px] mt-1 block text-[14px] tracking-normal">
          No uploads, no account, no installation.
        </span>
      </p>
      <div className="phone:mx-auto phone:mt-6 phone:w-full phone:max-w-85 phone:flex-col phone:gap-2.5 mt-6.5 flex items-center justify-center gap-3">
        <OpenEditorButton className="phone:w-full phone:px-5 min-h-12 px-6" />
        <a
          href="#workflow"
          className="border-studio-border-strong text-studio-fg hover:border-studio-muted hover:bg-studio-panel phone:w-full phone:text-[13px] inline-flex min-h-12 items-center justify-center gap-2.25 rounded-lg border px-5 py-0 text-[12px] transition-[background,border-color,transform] duration-200 ease-[ease] hover:[transform:translateY(-2px)]"
        >
          <Play size={17} className="phone:size-3.5" aria-hidden="true" />
          See how it works
        </a>
      </div>
    </LandingContainer>
  );
}
