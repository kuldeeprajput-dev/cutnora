"use client";

import { useState, useEffect } from "react";
import { db } from "@/modules/core/db/database";
import { deleteStoredMediaAsset } from "@/modules/core/storage/media-asset-service";
import type { Project } from "../types";
import { useProjectSort } from "./useProjectSort";

export interface DeleteTarget {
  type: "single" | "batch";
  project?: Project;
  batchCount?: number;
}

export function useStudioProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [infoProject, setInfoProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    sortMenuOpen,
    setSortMenuOpen,
    handleSelectSort,
    handleToggleSortOrder,
    filteredAndSortedProjects,
  } = useProjectSort(projects, searchQuery);

  const isAllSelected =
    filteredAndSortedProjects.length > 0 &&
    filteredAndSortedProjects.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedProjects.map((p) => p.id));
    }
  };

  const toggleSelectProject = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetProject = projects.find((p) => p.id === id);
    if (targetProject) {
      setDeleteTarget({ type: "single", project: targetProject });
    }
  };

  const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceProject = projects.find((p) => p.id === id);
    if (!sourceProject) return;

    const newId = crypto.randomUUID();
    const newName = `${sourceProject.name} (Copy)`;
    const now = Date.now();

    const duplicatedProject: Project = {
      ...sourceProject,
      id: newId,
      name: newName,
      createdAt: now,
      updatedAt: now,
    };

    await db.projects.add(duplicatedProject);

    try {
      const sourceAssets = await db.assets
        .where("projectId")
        .equals(id)
        .toArray();
      for (const asset of sourceAssets) {
        await db.assets.add({
          ...asset,
          id: crypto.randomUUID(),
          projectId: newId,
          createdAt: now,
        });
      }
    } catch (err) {
      console.error("Failed duplicating project assets:", err);
    }

    setProjects((prev) => [duplicatedProject, ...prev]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: "batch", batchCount: selectedIds.length });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "single" && deleteTarget.project) {
      const id = deleteTarget.project.id;
      const assets = await db.assets.where("projectId").equals(id).toArray();
      for (const asset of assets) {
        await deleteStoredMediaAsset(asset);
      }
      await db.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else if (deleteTarget.type === "batch") {
      for (const id of selectedIds) {
        const assets = await db.assets.where("projectId").equals(id).toArray();
        for (const asset of assets) {
          await deleteStoredMediaAsset(asset);
        }
        await db.projects.delete(id);
      }
      setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }

    setDeleteTarget(null);
  };

  const handleBatchDuplicate = async () => {
    if (selectedIds.length === 0) return;
    const now = Date.now();
    const duplicatedList: Project[] = [];

    for (const id of selectedIds) {
      const sourceProject = projects.find((p) => p.id === id);
      if (!sourceProject) continue;

      const newId = crypto.randomUUID();
      const newName = `${sourceProject.name} (Copy)`;

      const duplicatedProject: Project = {
        ...sourceProject,
        id: newId,
        name: newName,
        createdAt: now,
        updatedAt: now,
      };

      await db.projects.add(duplicatedProject);

      try {
        const sourceAssets = await db.assets
          .where("projectId")
          .equals(id)
          .toArray();
        for (const asset of sourceAssets) {
          await db.assets.add({
            ...asset,
            id: crypto.randomUUID(),
            projectId: newId,
            createdAt: now,
          });
        }
      } catch (err) {
        console.error("Failed duplicating project assets:", err);
      }

      duplicatedList.push(duplicatedProject);
    }

    setProjects((prev) => [...duplicatedList, ...prev]);
    setSelectedIds([]);
  };

  const handleOpenRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameTarget({ id, name: currentName });
  };

  const handleSaveRename = async (newName: string) => {
    if (!renameTarget) return;
    if (newName && newName !== renameTarget.name) {
      await db.projects.update(renameTarget.id, {
        name: newName,
        updatedAt: Date.now(),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, name: newName } : p)),
      );
    }
    setRenameTarget(null);
  };

  const handleOpenInfo = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInfoProject(project);
  };

  return {
    projects,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    setSortOrder,
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
  };
}
