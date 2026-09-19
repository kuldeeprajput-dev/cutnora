"use client";

import React from "react";
import Link from "next/link";
import {
  ProjectCard,
  useStudioProjects,
} from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Container } from "@/shared/components/layout/Container";
import { Plus, Film } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

export default function StudioDashboardPage() {
  const {
    isLoading,
    filteredAndSortedProjects: projects,
    selectedIds,
    toggleSelectProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleOpenRename,
    handleOpenInfo,
  } = useStudioProjects();

  return (
    <div className="min-h-dvh bg-studio-bg py-6 text-studio-fg sm:min-h-screen sm:py-12">
      <Container size="lg">
        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col items-stretch gap-5 border-b border-studio-border pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <Link href="/" className="mb-2 flex w-fit items-center gap-2">
              <BrandMark size={24} />
              <span className="text-sm font-bold tracking-tight text-studio-muted">
                Cutnora Studio
              </span>
            </Link>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-studio-fg sm:text-3xl sm:leading-9">
              Local Projects
            </h1>
            <p className="mt-1 max-w-sm text-xs leading-5 text-studio-muted sm:max-w-none sm:leading-4">
              Projects stored on your local browser storage.
            </p>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
            <ThemeToggle className="h-11 min-w-11 shrink-0 touch-manipulation border-studio-border bg-studio-bg px-0 text-studio-fg hover:bg-studio-hover sm:h-10 sm:min-w-10 sm:px-3" />
            <Link href="/studio/new" className="min-w-0 flex-1 sm:flex-none">
              <Button
                size="md"
                variant="primary"
                className="h-11 w-full touch-manipulation whitespace-nowrap px-4 sm:h-9 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">New Project</span>
                <span className="hidden sm:inline">Create New Project</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-studio-muted">
            Loading local projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel p-6 text-center sm:p-12">
            <Film className="mx-auto h-12 w-12 text-studio-muted mb-4" />
            <h3 className="text-base font-bold text-studio-fg">
              No local projects found
            </h3>
            <p className="mt-1 text-xs text-studio-muted">
              Create a new video project to start editing in your browser.
            </p>
            <div className="mt-6">
              <Link href="/studio/new">
                <Button size="sm" variant="primary">
                  <Plus className="h-4 w-4" /> Create Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedIds.includes(project.id)}
                onToggleSelect={toggleSelectProject}
                onDelete={handleDeleteProject}
                onRename={handleOpenRename}
                onDuplicate={handleDuplicateProject}
                onInfo={handleOpenInfo}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
