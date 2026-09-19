"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Film, MoreVertical } from "lucide-react";
import type { Project } from "../types";
import {
  getProjectDuration,
  formatDuration,
  formatDate,
} from "../utils/project-utils";
import { useProjectThumbnail } from "../hooks/useProjectThumbnail";
import { ProjectActionMenu } from "./ProjectActionMenu";
import { cn } from "@/shared/utils/cn";

export interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRename: (id: string, currentName: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onInfo: (project: Project, e: React.MouseEvent) => void;
}

export function ProjectCard({
  project,
  isSelected,
  onToggleSelect,
  onDelete,
  onRename,
  onDuplicate,
  onInfo,
}: ProjectCardProps) {
  const thumbUrl = useProjectThumbnail(project);
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const durationSec = useMemo(() => getProjectDuration(project), [project]);
  const durationStr = useMemo(() => formatDuration(durationSec), [durationSec]);
  const dateStr = useMemo(
    () => formatDate(project.createdAt || project.updatedAt),
    [project.createdAt, project.updatedAt],
  );

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      const isInsideDesktop = desktopMenuRef.current?.contains(target);
      const isInsideMobile = mobileMenuRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
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
      className={cn("group relative", menuOpen ? "z-30" : "z-0")}
      data-state={menuOpen ? "open" : "closed"}
    >
      <div className="text-card-foreground rounded-2xl border bg-background border-none p-0">
        <Link className="block" href={`/studio/${project.id}`}>
          <div className="bg-muted relative aspect-video overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              {thumbUrl ? (
                <img
                  alt="Project thumbnail"
                  decoding="async"
                  data-nimg="fill"
                  className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  src={thumbUrl}
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    inset: "0px",
                    color: "transparent",
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-zinc-900/60">
                  <Film className="h-9 w-9 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-sm">
              {durationStr}
            </div>
          </div>
        </Link>

        <div className="p-6 flex flex-col gap-2 px-0 pt-4">
          <div className="flex items-start justify-between gap-2">
            <Link className="block min-w-0 flex-1" href={`/studio/${project.id}`}>
              <h3 className="group-hover:text-foreground/90 line-clamp-2 text-sm leading-snug font-medium">
                {project.name}
              </h3>
            </Link>

            {/* Mobile 3-Dot Project Menu Button (Right side of project name) */}
            <div className="sm:hidden relative shrink-0" ref={mobileMenuRef}>
              <button
                type="button"
                aria-label="Project menu"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </button>

              <ProjectActionMenu
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onRename={(e) => onRename(project.id, project.name, e)}
                onDuplicate={(e) => onDuplicate(project.id, e)}
                onInfo={(e) => onInfo(project, e)}
                onDelete={(e) => onDelete(project.id, e)}
              />
            </div>
          </div>

          <Link className="block" href={`/studio/${project.id}`}>
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                color="currentColor"
                className="size-4"
              >
                <path
                  d="M16 2V6M8 2V6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
              </svg>
              <span>Created {dateStr}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Select Checkbox (Top Left) */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        value="on"
        onClick={(e) => onToggleSelect(project.id, e)}
        className={cn(
          "cursor-pointer bg-background peer focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary shrink-0 shadow-xs rounded-sm border border-border focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 absolute z-10 size-5 top-3 left-3 flex items-center justify-center transition-opacity",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {isSelected && (
          <span
            data-state="checked"
            className="flex items-center justify-center text-current"
            style={{ pointerEvents: "none" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check size-4"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
          </span>
        )}
      </button>

      {/* Desktop 3-Dot Project Menu Button (Top Right) */}
      <div className="hidden sm:block absolute z-10 top-3 right-3" ref={desktopMenuRef}>
        <button
          className={cn(
            "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-background text-foreground hover:bg-background/90 size-7 rounded-sm transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          type="button"
          aria-label="Project menu"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            className="text-foreground"
            aria-hidden="true"
          >
            <path
              d="M12.0045 11.5C12.5568 11.5 13.0045 11.9477 13.0045 12.5C13.0045 13.0523 12.5568 13.5 12.0045 13.5C11.4522 13.5 11.0045 13.0523 11.0045 12.5C11.0045 11.9477 11.4522 11.5 12.0045 11.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            ></path>
            <path
              d="M18.0045 11.5C18.5568 11.5 19.0045 11.9477 19.0045 12.5C19.0045 13.0523 18.5568 13.5 18.0045 13.5C17.4522 13.5 17.0045 13.0523 17.0045 12.5C17.0045 11.9477 17.4522 11.5 18.0045 11.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            ></path>
            <path
              d="M6.00449 11.5C6.55677 11.5 7.00449 11.9477 7.00449 12.5C7.00449 13.0523 6.55677 13.5 6.00449 13.5C5.4522 13.5 5.00449 13.0523 5.00449 12.5C5.00449 11.9477 5.4522 11.5 6.00449 11.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            ></path>
          </svg>
        </button>

        <ProjectActionMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onRename={(e) => onRename(project.id, project.name, e)}
          onDuplicate={(e) => onDuplicate(project.id, e)}
          onInfo={(e) => onInfo(project, e)}
          onDelete={(e) => onDelete(project.id, e)}
        />
      </div>
    </div>
  );
}
