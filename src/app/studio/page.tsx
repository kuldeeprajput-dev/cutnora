'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/modules/core/db/database';
import type { Project } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Container } from '@/shared/components/layout/Container';
import { Plus, Film, Trash2 } from 'lucide-react';

export default function StudioDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const list = await db.projects.orderBy('updatedAt').reverse().toArray();
        setProjects(list);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this local project?')) {
      await db.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#101216] text-[#F4F5F7] py-12">
      <Container size="lg">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between border-b border-[#2B2F38] pb-6 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect width="32" height="32" rx="8" fill="#FF5A36" />
                <path
                  d="M10 8L22 8C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10C8 8.89543 8.89543 8 10 8Z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path d="M14 12L20 16L14 20V12Z" fill="white" />
              </svg>
              <span className="text-sm font-bold tracking-tight text-[#9298A3]">Cutframe Studio</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4F5F7]">Local Projects</h1>
            <p className="mt-1 text-xs text-[#9298A3]">
              Projects stored on your local browser IndexedDB storage.
            </p>
          </div>

          <Link href="/studio/new">
            <Button size="md" variant="primary">
              <Plus className="h-4 w-4" /> Create New Project
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-[#9298A3]">Loading local projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2B2F38] bg-[#171A20] p-12 text-center">
            <Film className="mx-auto h-12 w-12 text-[#9298A3] mb-4" />
            <h3 className="text-base font-bold text-[#F4F5F7]">No local projects found</h3>
            <p className="mt-1 text-xs text-[#9298A3]">Create a new video project to start editing in your browser.</p>
            <div className="mt-6">
              <Link href="/studio/new">
                <Button size="sm" variant="primary">
                  <Plus className="h-4 w-4" /> Create Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/studio/${project.id}`}
                className="group relative rounded-xl border border-[#2B2F38] bg-[#171A20] p-4 transition-all hover:border-[#FF5A36]"
              >
                <div className="aspect-video w-full rounded-lg bg-[#101216] border border-[#2B2F38] flex items-center justify-center mb-3">
                  <Film className="h-8 w-8 text-[#9298A3] group-hover:text-[#FF5A36] transition-colors" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F5F7] group-hover:text-[#FF5A36] transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#9298A3] mt-0.5">
                      {project.settings.width}×{project.settings.height} ({project.settings.aspectRatio})
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Delete project"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-1 text-[#9298A3] hover:text-[#E45858] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
