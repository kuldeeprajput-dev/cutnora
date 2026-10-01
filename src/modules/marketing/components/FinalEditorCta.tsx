import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { LandingContainer, OpenEditorButton } from "./LandingPrimitives";

export function FinalEditorCta() {
  return (
    <LandingContainer
      as="section"
      className="[&>p]:text-studio-muted phone:[&_h2]:text-[clamp(28px,_8.3vw,_36px)] phone:[&_h2]:leading-[1.15] phone:pt-16 phone:pb-14 phone:[&_h2]:max-w-75 phone:[&_h2]:mx-auto phone:[&>p]:max-w-75 phone:[&>p]:mx-auto phone:[&>p]:text-[14px] pt-22.5 pb-20 text-center [&_h2]:text-[clamp(32px,_3.4vw,_46px)] [&_h2]:leading-[1.1] [&_h2]:font-semibold [&_h2]:tracking-[-0.045em] [&_h2]:text-balance [&>p]:mt-4 [&>p]:text-[13px] [&>p]:leading-[1.7]"
      aria-labelledby="cta-heading"
    >
      <span
        className="border-studio-border bg-studio-panel mt-0 mr-auto mb-6 ml-auto flex h-12.5 w-12.5 items-center justify-center rounded-xl border"
        aria-hidden="true"
      >
        <Play size={25} fill="currentColor" />
      </span>
      <h2 id="cta-heading">Your next edit starts here.</h2>
      <p>Open a tab. Bring your footage. Make something yours.</p>
      <OpenEditorButton className="phone:w-full phone:max-w-85 mt-6" />
      <Link
        href="/projects"
        className="text-studio-muted phone:min-h-11 phone:mt-3 phone:text-[13px] mt-4.5 mr-auto mb-0 ml-auto flex w-[fit-content] items-center gap-1.75 text-[10px]"
      >
        Or pick up an existing project
        <ArrowRight size={14} />
      </Link>
    </LandingContainer>
  );
}
