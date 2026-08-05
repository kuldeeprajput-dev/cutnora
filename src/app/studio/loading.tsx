import React from 'react';
import { Spinner } from '@/shared/components/ui/Spinner';

export default function StudioLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#101216] text-[#F4F5F7]">
      <Spinner size="lg" label="Loading Studio..." />
      <p className="mt-4 text-xs font-medium text-[#9298A3]">Loading project workspace...</p>
    </div>
  );
}
