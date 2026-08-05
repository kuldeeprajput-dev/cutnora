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
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-studio-bg text-studio-fg">
      <Spinner size="lg" label="Setting up new video project..." />
      <p className="mt-4 text-sm text-studio-muted">Setting up workspace...</p>
    </div>
  );
}
