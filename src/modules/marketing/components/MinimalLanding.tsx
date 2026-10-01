import { LandingContainer } from "./LandingPrimitives";
import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";
import { EditorPreview } from "./EditorPreview";
import { LandingHero } from "./LandingHero";
import { FeatureShowcase } from "./FeatureShowcase";
import { LocalPrivacy } from "./LocalPrivacy";
import { EditingWorkflow } from "./EditingWorkflow";
import { ShortcutShowcase } from "./ShortcutShowcase";
import { FinalEditorCta } from "./FinalEditorCta";

export function MinimalLanding() {
  return (
    <div className="cutnora-landing bg-mkt-bg text-studio-fg phone:pt-2.5 phone:[&_:is(section,main)[id]]:[scroll-margin-top:96px] min-h-[100vh] pt-4 font-sans motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! [&_:is(a,button)]:focus-visible:[outline:2px_solid_var(--studio-fg)] [&_:is(a,button)]:focus-visible:outline-offset-[5px] [&_:is(section,main)[id]]:[scroll-margin-top:112px] [&_:where(svg)]:stroke-[1.7] [&_a]:no-underline [&_button]:cursor-pointer [&_svg]:shrink-0">
      <a
        className="bg-brand text-brand-contrast fixed top-[-100px] left-6 z-100 rounded-lg px-5 py-3 [&:focus]:top-6"
        href="#main-content"
      >
        Skip to content
      </a>
      <LandingHeader />
      <main id="main-content">
        <LandingHero />
        <LandingContainer className="motion-safe:animate-landing-workspace">
          <EditorPreview />
          <p className="text-studio-muted phone:flex-col phone:gap-1.5 phone:text-[12px] phone:leading-[1.6] phone:text-center phone:pt-3.5 phone:[&_>_span]:text-[10px] flex items-center justify-between pt-4.25 pr-0.5 pb-0 pl-0.5 text-[11px] [&_>_span]:text-[9px]">
            A little footage. A lot of possibility.{" "}
            <span>Illustrative workspace · Sample media</span>
          </p>
        </LandingContainer>
        <FeatureShowcase />
        <LocalPrivacy />
        <EditingWorkflow />
        <ShortcutShowcase />
        <FinalEditorCta />
      </main>
      <LandingFooter />
    </div>
  );
}
