'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/modules/projects';
import { ResponsiveStudioShell } from '@/modules/editor/components/shell/ResponsiveStudioShell';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Button } from '@/shared/components/ui/Button';
import { AlertCircle, Plus } from 'lucide-react';

interface StudioEditorPageProps {
  params: Promise<{ projectId: string }>;
}

export default function StudioEditorPage({ params }: StudioEditorPageProps) {
  const { projectId } = use(params);
  const { loadProject, currentProject, isLoading, error } = useProjectStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      await loadProject(projectId);
      if (isMounted) {
        setIsLoaded(true);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [projectId, loadProject]);

  if (isLoading || !isLoaded) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-studio-bg text-studio-fg">
        <Spinner size="lg" label="Loading project..." />
        <p className="mt-4 text-sm text-studio-muted">Opening Cutnora Studio...</p>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-studio-bg text-studio-fg px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-studio-fg">Project Not Found</h1>
        <p className="mt-2 text-sm text-studio-muted max-w-md">
          The requested project with ID <span className="font-mono text-selection">{projectId}</span> does not exist or was removed from your local browser database.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link href="/studio/new">
            <Button size="md" variant="primary">
              <Plus className="h-4 w-4" /> Create New Project
            </Button>
          </Link>
          <Link href="/studio">
            <Button size="md" variant="secondary">
              Go to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ResponsiveStudioShell />;
}
