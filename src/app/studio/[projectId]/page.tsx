import React from 'react';

interface StudioEditorPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function StudioEditorPage({ params }: StudioEditorPageProps) {
  const { projectId } = await params;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#121214] text-[#f4f4f5]">
      <header className="flex h-12 w-full items-center justify-between border-b border-[#27272a] bg-[#18181b] px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#facc15]">Cutframe Studio</span>
          <span className="text-xs text-[#a1a1aa]">• Project: {projectId}</span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center text-[#a1a1aa]">
          <p className="text-base">Studio Editor Workspace Placeholder</p>
          <p className="text-xs mt-1">Project ID: {projectId}</p>
        </div>
      </main>
    </div>
  );
}
