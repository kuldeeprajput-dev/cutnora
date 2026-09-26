"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Film, Check, MoreHorizontal } from "lucide-react";
import { useProjectThumbnail } from "../hooks/useProjectThumbnail";
import type { Project } from "../types";
import { getProjectDuration, formatDuration, formatDate } from "../utils/project-utils";
import { ProjectActionMenu } from "./ProjectActionMenu";
import { cn } from "@/shared/utils/cn";

export interface ProjectListRowProps {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRename: (id: string, currentName: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onInfo: (project: Project, e: React.MouseEvent) => void;
}

export function ProjectListRow({
  project,
  isSelected,
  onToggleSelect,
  onDelete,
  onRename,
  onDuplicate,
  onInfo,
}: ProjectListRowProps) {
  const thumbUrl = useProjectThumbnail(project);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const durationSec = useMemo(() => getProjectDuration(project), [project]);
  const durationStr = useMemo(() => formatDuration(durationSec), [durationSec]);
  const dateStr = useMemo(
    () => formatDate(project.createdAt || project.updatedAt),
    [project.createdAt, project.updatedAt],
  );

  const updateMenuPlacement = () => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 200);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPlacement();
    const handleScrollOrResize = () => {
      updateMenuPlacement();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        e.target instanceof Node &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "group flex items-center gap-2 sm:gap-3.5 border-b border-border py-2.5 px-2 sm:px-4 transition-colors max-w-full",
        menuOpen ? "relative z-30" : "relative z-0",
        isSelected ? "bg-accent/40" : "hover:bg-accent/20",
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        value="on"
        onClick={(e) => onToggleSelect(project.id, e)}
        className={cn(
          "cursor-pointer bg-background peer focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary shrink-0 shadow-xs rounded-sm border border-border focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 size-5 flex items-center justify-center transition-colors",
        )}
      >
        {isSelected && (
          <span
            data-state="checked"
            className="flex items-center justify-center text-current"
            style={{ pointerEvents: "none" }}
          >
            <Check className="size-4" aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Mini square thumbnail */}
      <Link
        href={`/editor?project=${project.id}`}
        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Film className="h-4 w-4 text-muted-foreground" />
        )}
      </Link>

      {/* Project Title */}
      <Link
        href={`/editor?project=${project.id}`}
        className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground hover:text-foreground/70 transition-colors"
      >
        {project.name}
      </Link>

      {/* Duration */}
      <span className="shrink-0 text-right font-mono text-xs text-muted-foreground sm:w-16">
        {durationStr}
      </span>

      {/* Date */}
      <span className="shrink-0 text-right text-xs text-muted-foreground sm:w-28 whitespace-nowrap">
        {dateStr}
      </span>

      {/* More menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!menuOpen) {
              updateMenuPlacement();
            }
            setMenuOpen(!menuOpen);
          }}
          aria-label="More options"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-4" />
        </button>

        <ProjectActionMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSelect={(e) => onToggleSelect(project.id, e)}
          isSelected={isSelected}
          onRename={(e) => onRename(project.id, project.name, e)}
          onDuplicate={(e) => onDuplicate(project.id, e)}
          onInfo={(e) => onInfo(project, e)}
          onDelete={(e) => onDelete(project.id, e)}
          className={cn(
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5",
            "md:bottom-auto md:top-full md:mt-1.5",
          )}
        />
      </div>
    </div>
  );
}
