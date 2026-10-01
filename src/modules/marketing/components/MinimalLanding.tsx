import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";
import { EditorPreview } from "./EditorPreview";
import {
  LandingHero,
  FeatureShowcase,
  LocalPrivacy,
  EditingWorkflow,
  ShortcutShowcase,
  FinalEditorCta,
} from "./LandingSections";

export function MinimalLanding() {
  return (
    <div className="cutnora-landing">
      <a className="lp-skip-link" href="#main-content">
        Skip to content
      </a>
      <LandingHeader />
      <main id="main-content">
        <LandingHero />
        <div className="lp-container lp-product">
          <EditorPreview />
          <p className="lp-preview-caption">
            A little footage. A lot of possibility.{" "}
            <span>Illustrative workspace · Sample media</span>
          </p>
        </div>
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
