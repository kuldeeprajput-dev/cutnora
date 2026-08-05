import React from 'react';
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
} from '@/modules/marketing';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#151619]">
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
