"use client";

import React from "react";
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
    <div className="sticky top-16 z-10 flex items-center justify-between px-2 sm:px-6 h-14 pt-2 bg-background max-w-full">
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
                d="M9 15V19C9 20.1046 9.89543 21 11 21H19C20.1046 21 21 20.1046 21 19V11C21 9.89543 20.1046 9 19 9H15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
              <path
                d="M5 15H13C14.1046 15 15 14.1046 15 13V5C15 3.89543 14.1046 3 13 3H5C3.89543 3 3 3.89543 3 5V13C3 14.1046 3.89543 15 5 15Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
            </svg>
          </button>

          {/* Delete Button */}
          <button
            className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-sm size-9 text-foreground transition-colors"
            type="button"
            aria-label="Delete selected projects"
            title="Delete selected"
            onClick={onBatchDelete}
          >
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
                d="M19 9L18.2547 18.6888C18.1561 19.9705 17.089 20.9632 15.8037 20.9632H8.19627C6.91104 20.9632 5.84386 19.9705 5.74531 18.6888L5 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
              <path
                d="M3 6H21"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
            </svg>
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
                d="M19 9L18.2547 18.6888C18.1561 19.9705 17.089 20.9632 15.8037 20.9632H8.19627C6.91104 20.9632 5.84386 19.9705 5.74531 18.6888L5 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
              <path
                d="M3 6H21"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
