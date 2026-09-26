import { use } from 'react';
import { redirect } from 'next/navigation';

export default function ProjectsIdRedirectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  if (projectId === 'new') {
    redirect('/projects/new');
  }
  redirect(`/editor?project=${projectId}`);
}
