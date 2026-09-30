"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, Plus, SearchX } from "lucide-react";
import {
  ProjectsHeader,
  ProjectsSubheader,
  ProjectCard,
  ProjectListRow,
  RenameModal,
  ProjectInfoModal,
  DeleteProjectModal,
  useProjects,
  useProjectStore,
} from "@/modules/projects";

function ProjectGridSkeleton() {
  return (
    <div className="xs:grid-cols-2 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4 px-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-video w-full rounded-2xl bg-muted/40" />
          <div className="flex flex-col gap-2 pt-1">
            <div className="h-4 w-3/4 rounded-md bg-muted/40" />
            <div className="h-3 w-1/3 rounded-md bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="flex flex-col border-t border-border w-full max-w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/40 animate-pulse">
          <div className="size-5 rounded-sm bg-muted/30 shrink-0" />
          <div className="h-10 w-16 rounded-md bg-muted/40 shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="h-3.5 w-1/3 rounded-md bg-muted/40" />
            <div className="h-2.5 w-1/5 rounded-md bg-muted/30" />
          </div>
          <div className="size-6 rounded-md bg-muted/20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function ProjectsDashboardPage() {
  const {
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    sortMenuOpen,
    setSortMenuOpen,
    selectedIds,
    filteredAndSortedProjects,
    isAllSelected,
    toggleSelectAll,
    toggleSelectProject,
    handleSelectSort,
    handleToggleSortOrder,
    handleDeleteProject,
    handleDuplicateProject,
    handleBatchDelete,
    handleBatchDuplicate,
    renameTarget,
    setRenameTarget,
    handleOpenRename,
    handleSaveRename,
    infoProject,
    setInfoProject,
    handleOpenInfo,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
  } = useProjects();

  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);

  const handleCreateProject = useCallback(async () => {
    try {
      const project = await createProject("Untitled video");
      router.push(`/editor?project=${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      router.push("/projects/new");
    }
  }, [createProject, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sortMenuOpen) setSortMenuOpen(false);
        else if (searchQuery) setSearchQuery("");
      }
    },
    [sortMenuOpen, searchQuery, setSortMenuOpen, setSearchQuery],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-background h-dvh text-foreground select-none max-w-full overflow-hidden flex flex-col">
      {/* Top Header */}
      <ProjectsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateProject={handleCreateProject}
      />

      {/* Sticky Subheader */}
      <ProjectsSubheader
        isAllSelected={isAllSelected}
        selectedCount={selectedIds.length}
        onToggleSelectAll={toggleSelectAll}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSelectSort={handleSelectSort}
        onToggleSortOrder={handleToggleSortOrder}
        sortMenuOpen={sortMenuOpen}
        onSortMenuOpenChange={setSortMenuOpen}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBatchDuplicate={handleBatchDuplicate}
        onBatchDelete={handleBatchDelete}
      />

      {/* Main Grid / List Content */}
      <main
        className="flex-1 overflow-y-auto app-custom-scrollbar mx-auto w-full max-w-full px-4 sm:px-6 md:px-8 pt-2 pb-4 sm:pb-6 flex flex-col"
        aria-busy={isLoading}
      >
        {isLoading ? (
          viewMode === "grid" ? <ProjectGridSkeleton /> : <ProjectListSkeleton />
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="flex-1 w-full p-8 text-center sm:p-14 flex flex-col items-center justify-center min-h-0">
            {searchQuery ? (
              <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            ) : (
              <Clapperboard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            )}
            <h3 className="text-base font-semibold text-foreground">
              {searchQuery ? "No matching projects found" : "No projects yet"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md">
              {searchQuery
                ? `No projects matching "${searchQuery}". Try a different search.`
                : "Create your first video project to get started."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-border px-4 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Clear search
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleCreateProject}
                className="rounded-xl bg-foreground px-5 py-2.5 text-xs sm:text-sm font-semibold text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" /> New project
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filteredAndSortedProjects.map((project) => (
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
        ) : (
          <div className="flex flex-col border-t border-border w-full max-w-full">
            {filteredAndSortedProjects.map((project) => (
              <ProjectListRow
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
      </main>

      {/* Modals */}
      <RenameModal
        isOpen={Boolean(renameTarget)}
        initialName={renameTarget?.name || ""}
        onClose={() => setRenameTarget(null)}
        onSave={handleSaveRename}
      />

      <ProjectInfoModal
        project={infoProject}
        onClose={() => setInfoProject(null)}
      />

      <DeleteProjectModal
        isOpen={Boolean(deleteTarget)}
        project={deleteTarget?.type === "single" ? deleteTarget.project : null}
        batchCount={deleteTarget?.type === "batch" ? deleteTarget.batchCount : 0}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
