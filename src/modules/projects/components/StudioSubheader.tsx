"use client";

import React from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { SortOption, SortOrder } from "../hooks/useProjectSort";
export type { SortOption, SortOrder };
import { StudioSortControls } from "./StudioSortControls";
import { ViewModeToggle } from "./ViewModeToggle";

export interface StudioSubheaderProps {
  isAllSelected: boolean;
  selectedCount: number;
  onToggleSelectAll: () => void;
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (option: SortOption) => void;
  onToggleSortOrder: () => void;
  sortMenuOpen: boolean;
  onSortMenuOpenChange: (open: boolean) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onBatchDuplicate: () => void;
  onBatchDelete: () => void;
}

export function StudioSubheader({
  isAllSelected,
  selectedCount,
  onToggleSelectAll,
  sortBy,
  sortOrder,
  onSelectSort,
  onToggleSortOrder,
  sortMenuOpen,
  onSortMenuOpenChange,
  viewMode,
  onViewModeChange,
  onBatchDuplicate,
  onBatchDelete,
}: StudioSubheaderProps) {
  return (
    <div className="sticky top-16 z-10 flex items-center justify-between px-2 sm:px-6 h-14 pt-2 bg-background max-w-full shrink-0">
      <div className="flex items-center gap-2">
        {/* Select all label & checkbox */}
        <label
          className="text-xs text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3 cursor-pointer px-2"
          htmlFor="select-all-projects"
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={
              isAllSelected ? "true" : selectedCount > 0 ? "mixed" : "false"
            }
            data-state={
              isAllSelected
                ? "checked"
                : selectedCount > 0
                ? "indeterminate"
                : "unchecked"
            }
            value="on"
            onClick={onToggleSelectAll}
            className="cursor-pointer bg-background peer focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary shrink-0 shadow-xs rounded-sm border border-border focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 size-5 flex items-center justify-center"
            id="select-all-projects"
          >
            {(isAllSelected || selectedCount > 0) && (
              <span
                data-state={isAllSelected ? "checked" : "indeterminate"}
                className="flex items-center justify-center text-current"
                style={{ pointerEvents: "none" }}
              >
                <Check className="size-4" aria-hidden="true" />
              </span>
            )}
          </button>
          <span className="text-muted-foreground hidden md:block">
            {selectedCount > 0 ? `${selectedCount} Selected` : "Select all"}
          </span>
        </label>

        <div className="h-4 w-px bg-border/50"></div>

        {/* Sort Controls (Dropdown + Direction Arrow) */}
        <StudioSortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSelectSort={onSelectSort}
          onToggleSortOrder={onToggleSortOrder}
          sortMenuOpen={sortMenuOpen}
          onSortMenuOpenChange={onSortMenuOpenChange}
        />

        {/* Mobile View Toggle */}
        <div className="h-4 w-px bg-border/50 block md:hidden"></div>
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          className="flex md:hidden"
          size="sm"
        />
      </div>

      {/* Right: Actions when items are selected */}
      <div className="flex items-center gap-2.5 px-3">
        <div
          className={cn(
            "hidden sm:flex items-center gap-2.5 transition-opacity duration-150",
            selectedCount > 0
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          {/* Duplicate Button */}
          <button
            className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border bg-background hover:bg-accent rounded-sm size-9 text-foreground transition-colors"
            type="button"
            aria-label="Duplicate selected projects"
            title="Duplicate selected"
            onClick={onBatchDuplicate}
          >
            <Copy className="size-4" />
          </button>

          {/* Delete Button */}
          <button
            className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-sm size-9 text-foreground transition-colors"
            type="button"
            aria-label="Delete selected projects"
            title="Delete selected"
            onClick={onBatchDelete}
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {/* Mobile Batch Delete Button */}
        {selectedCount > 0 && (
          <button
            className="flex sm:hidden items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-sm size-8 text-foreground transition-colors"
            type="button"
            aria-label="Delete selected projects"
            title="Delete selected"
            onClick={onBatchDelete}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
