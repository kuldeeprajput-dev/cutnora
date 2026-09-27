"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, X } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { ViewModeToggle } from "./ViewModeToggle";
import { useProjectStore } from "../store/useProjectStore";

export interface ProjectsHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateProject?: () => void;
}

export function ProjectsHeader({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onCreateProject,
}: ProjectsHeaderProps) {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);
  const [isCreating, setIsCreating] = useState(false);

  const handleNewProject = async () => {
    if (isCreating) return;
    if (onCreateProject) {
      onCreateProject();
      return;
    }
    setIsCreating(true);
    try {
      const project = await createProject("Untitled video");
      router.push(`/editor?project=${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setIsCreating(false);
    }
  };
  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 md:px-8 bg-background flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between h-16 pt-2">
        {/* Left: Breadcrumbs & View Switcher */}
        <div className="flex items-center gap-5">
          <nav aria-label="breadcrumb" data-slot="breadcrumb">
            <ol
              data-slot="breadcrumb-list"
              className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5"
            >
              <li
                data-slot="breadcrumb-item"
                className="inline-flex items-center gap-1.5"
              >
                <Link
                  className="hover:text-foreground transition-colors text-sm sm:text-base"
                  data-slot="breadcrumb-link"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li
                data-slot="breadcrumb-separator"
                role="presentation"
                aria-hidden="true"
                className="[&>svg]:size-3.5"
              >
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </li>
              <li
                data-slot="breadcrumb-item"
                className="inline-flex items-center gap-1.5"
              >
                <span
                  data-slot="breadcrumb-page"
                  aria-current="page"
                  className="text-foreground text-sm sm:text-base font-medium"
                >
                  All projects
                </span>
              </li>
            </ol>
          </nav>

          {/* Grid / List View Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            className="hidden md:flex"
            size="md"
          />
        </div>

        {/* Right: Search, Theme Toggle & New Project Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
          <ThemeToggle shape="square" className="shrink-0" />
          <div className="relative hidden md:block">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <div className="relative">
              <input
                className="text-foreground file:text-foreground placeholder:text-muted-foreground border-border bg-input flex w-full min-w-0 rounded-md border shadow-xs outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive selection:bg-primary selection:text-primary-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 h-10 px-4 text-base file:h-8 file:text-sm md:text-sm pl-9 pr-9"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors cursor-pointer"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleNewProject}
            disabled={isCreating}
            className="items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-foreground text-background hover:bg-foreground/90 h-10 p-5 flex px-5 md:px-6 shrink-0"
            type="button"
          >
            <span className="text-sm font-medium hidden md:block">
              {isCreating ? "Creating..." : "New project"}
            </span>
            <span className="text-sm font-medium block md:hidden">
              {isCreating ? "..." : "New"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="relative block md:hidden mb-4">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <div className="relative">
          <input
            className="text-foreground file:text-foreground placeholder:text-muted-foreground border-border bg-input flex w-full min-w-0 rounded-md border shadow-xs outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive selection:bg-primary selection:text-primary-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 h-10 px-4 text-base file:h-8 file:text-sm md:text-sm pl-9 pr-9"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search projects on mobile"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear mobile search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors cursor-pointer"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export const StudioHeader = ProjectsHeader;
export type StudioHeaderProps = ProjectsHeaderProps;
