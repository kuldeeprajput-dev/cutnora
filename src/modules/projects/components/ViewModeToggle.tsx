"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
  size?: "sm" | "md";
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
  size = "md",
}: ViewModeToggleProps) {
  const isSm = size === "sm";

  return (
    <div
      role="group"
      aria-label="View mode"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          onViewModeChange("grid");
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          onViewModeChange("list");
        }
      }}
      className={cn(
        "flex items-center rounded-md border border-border",
        isSm ? "p-0.5 h-8" : "p-1 px-1.5 h-10",
        className,
      )}
    >
      {/* Grid view button */}
      <button
        className={cn(
          "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-sm transition-colors",
          isSm ? "size-6" : "size-7",
          viewMode === "grid"
            ? "!bg-accent text-foreground"
            : "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
        )}
        type="button"
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </button>

      {/* List view button */}
      <button
        className={cn(
          "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-sm transition-colors",
          isSm ? "size-6" : "size-7",
          viewMode === "list"
            ? "!bg-accent text-foreground"
            : "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
        )}
        type="button"
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        onClick={() => onViewModeChange("list")}
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
