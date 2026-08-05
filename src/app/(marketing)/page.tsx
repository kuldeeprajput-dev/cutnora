import React from 'react';
import { LandingHeader, LandingHeroSection } from '@/modules/marketing';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#151619]">
      <LandingHeader />
      <main>
        <LandingHeroSection />
      </main>
    </div>
  );
}
