"use client";

import { useState, useMemo } from "react";
import type { Project } from "../types";
import { getProjectDuration } from "../utils/project-utils";

export type SortOption = "created" | "modified" | "name" | "duration";
export type SortOrder = "asc" | "desc";

export const sortLabels: Record<SortOption, string> = {
  duration: "Duration",
  modified: "Modified",
  created: "Created",
  name: "Name",
};

export function compareProjects(
  a: Project,
  b: Project,
  sortBy: SortOption,
  sortOrder: SortOrder,
): number {
  let diff = 0;

  if (sortBy === "name") {
    // Natural alphabetical order: A -> Z when arrow points down (desc)
    diff = a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (diff === 0) {
      diff = (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    }
    if (diff === 0) {
      diff = a.id.localeCompare(b.id);
    }
  } else if (sortBy === "created") {
    // Newest to oldest when arrow points down (desc)
    diff = (b.createdAt || 0) - (a.createdAt || 0);
    if (diff === 0) {
      diff = a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (diff === 0) {
      diff = a.id.localeCompare(b.id);
    }
  } else if (sortBy === "modified") {
    // Most recently modified to oldest when arrow points down (desc)
    diff = (b.updatedAt || 0) - (a.updatedAt || 0);
    if (diff === 0) {
      diff = a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (diff === 0) {
      diff = a.id.localeCompare(b.id);
    }
  } else if (sortBy === "duration") {
    // Longest duration to shortest when arrow points down (desc)
    diff = getProjectDuration(b) - getProjectDuration(a);
    if (diff === 0) {
      diff = (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    }
    if (diff === 0) {
      diff = a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (diff === 0) {
      diff = a.id.localeCompare(b.id);
    }
  }

  return sortOrder === "desc" ? diff : -diff;
}

export function useProjectSort(projects: Project[], searchQuery: string) {
  const [sortBy, setSortBy] = useState<SortOption>("duration");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => compareProjects(a, b, sortBy, sortOrder));
    return result;
  }, [projects, searchQuery, sortBy, sortOrder]);

  const handleSelectSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(option);
      setSortOrder("desc");
    }
    setSortMenuOpen(false);
  };

  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    sortMenuOpen,
    setSortMenuOpen,
    handleSelectSort,
    handleToggleSortOrder,
    filteredAndSortedProjects,
  };
}
