import React from 'react';
import { Spinner } from '@/shared/components/ui/Spinner';

export default function ProjectsLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-studio-bg text-studio-fg">
      <Spinner size="lg" label="Loading Projects..." />
      <p className="mt-4 text-xs font-medium text-studio-muted">Loading projects workspace...</p>
    </div>
  );
}
