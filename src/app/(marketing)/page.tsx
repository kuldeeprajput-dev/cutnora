import {
  LandingHeader,
  LandingHeroSection,
  FeaturesSection,
  WorkflowSection,
  PrivacySection,
  CapabilitiesSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
} from "@/modules/marketing";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-fg">
      <LandingHeader />
      <main>
        <LandingHeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <PrivacySection />
        <CapabilitiesSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
