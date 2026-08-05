'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/modules/projects';
import { Spinner } from '@/shared/components/ui/Spinner';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (hasCreatedRef.current) return;
    hasCreatedRef.current = true;

    async function initializeNewProject() {
      try {
        const project = await createProject('Untitled video', {
          width: 1920,
          height: 1080,
          aspectRatio: '16:9',
          fps: 30,
          backgroundColor: '#000000',
        });
        router.replace(`/studio/${project.id}`);
      } catch (err) {
        console.error('Failed to create project:', err);
      }
    }

    initializeNewProject();
  }, [createProject, router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#101216] text-[#F4F5F7]">
      <Spinner size="lg" label="Setting up new video project..." />
      <p className="mt-4 text-sm text-[#9298A3]">Setting up workspace...</p>
    </div>
  );
}
