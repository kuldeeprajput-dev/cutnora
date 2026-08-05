import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { EditorPreviewMock } from '../components/EditorPreviewMock';

export function LandingHeroSection() {
  return (
    <div className="relative">
      <HeroSection />
      <EditorPreviewMock />
    </div>
  );
}
