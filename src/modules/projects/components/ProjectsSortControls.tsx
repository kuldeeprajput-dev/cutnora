"use client";

import React, { useRef, useEffect } from "react";
import { Check, ArrowDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  SortOption,
  SortOrder,
  sortLabels,
} from "../hooks/useProjectSort";

export interface ProjectsSortControlsProps {
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (option: SortOption) => void;
  onToggleSortOrder: () => void;
  sortMenuOpen: boolean;
  onSortMenuOpenChange: (open: boolean) => void;
}

const sortOptions: SortOption[] = ["created", "modified", "name", "duration"];

export function ProjectsSortControls({
  sortBy,
  sortOrder,
  onSelectSort,
  onToggleSortOrder,
  sortMenuOpen,
  onSortMenuOpenChange,
}: ProjectsSortControlsProps) {
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      ) {
        onSortMenuOpenChange(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [sortMenuOpen, onSortMenuOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!sortMenuOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSortMenuOpenChange(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onSortMenuOpenChange(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = sortOptions.indexOf(sortBy);
      const nextIndex = (currentIndex + 1) % sortOptions.length;
      onSelectSort(sortOptions[nextIndex]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = sortOptions.indexOf(sortBy);
      const prevIndex = (currentIndex - 1 + sortOptions.length) % sortOptions.length;
      onSelectSort(sortOptions[prevIndex]);
    }
  };

  return (
    <div className="flex items-center gap-1.5" onKeyDown={handleKeyDown}>
      {/* Sort Dropdown Button */}
      <div className="relative" ref={sortMenuRef}>
        <button
          ref={triggerRef}
          className={cn(
            "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-transparent rounded-none p-0 pl-2 transition-colors duration-150",
            sortMenuOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          type="button"
          aria-haspopup="menu"
          aria-expanded={sortMenuOpen}
          aria-label={`Sort by ${sortLabels[sortBy]}`}
          data-state={sortMenuOpen ? "open" : "closed"}
          onClick={() => onSortMenuOpenChange(!sortMenuOpen)}
        >
          {sortLabels[sortBy]}
        </button>

        {sortMenuOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            aria-label="Sort options"
            className="absolute -left-1 top-full mt-2 z-40 w-[184px] rounded-xl border border-border bg-card text-card-foreground p-1 shadow-2xl animate-in fade-in-50"
          >
            {sortOptions.map((option) => {
              const isActive = sortBy === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => onSelectSort(option)}
                  className={cn(
                    "flex w-full h-8 items-center justify-between rounded-lg px-3 text-sm transition-colors cursor-pointer",
                    isActive
                      ? "text-foreground font-medium bg-accent"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span className="capitalize">{sortLabels[option]}</span>
                  {isActive && (
                    <Check className="h-4 w-4 text-foreground stroke-[2]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort Direction Toggle */}
      <button
        className="inline-flex items-center cursor-pointer justify-center whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-transparent rounded-none p-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
        type="button"
        aria-label={
          sortBy === "name"
            ? sortOrder === "desc"
              ? "Sort Name A to Z"
              : "Sort Name Z to A"
            : sortOrder === "desc"
            ? "Sort descending"
            : "Sort ascending"
        }
        title={
          sortBy === "name"
            ? sortOrder === "desc"
              ? "Name (A to Z)"
              : "Name (Z to A)"
            : sortOrder === "desc"
            ? "Descending"
            : "Ascending"
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggleSortOrder();
        }}
      >
        <ArrowDown
          className={cn(
            "transition-transform duration-200 origin-center size-4",
            sortOrder === "asc" ? "rotate-180" : "",
          )}
        />
      </button>
    </div>
  );
}

export const StudioSortControls = ProjectsSortControls;
export type StudioSortControlsProps = ProjectsSortControlsProps;
