"use client";

import React, { useEffect, useRef } from "react";
import { CheckSquare, Pencil, Copy, Info, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface ProjectActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  onRename: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onInfo: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  className?: string;
}

export function ProjectActionMenu({
  isOpen,
  onClose,
  onSelect,
  isSelected,
  onRename,
  onDuplicate,
  onInfo,
  onDelete,
  className,
}: ProjectActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Project actions"
      className={cn(
        "absolute right-0 z-50 w-44 rounded-2xl border border-border bg-card text-card-foreground p-1.5 shadow-2xl animate-in fade-in-50",
        className || "top-full mt-1.5",
      )}
    >
      {/* Select option */}
      {onSelect && (
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            onClose();
            onSelect(e);
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <CheckSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{isSelected ? "Deselect" : "Select"}</span>
        </button>
      )}

      {/* Rename */}
      <button
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClose();
          onRename(e);
        }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span>Rename</span>
      </button>

      {/* Duplicate */}
      <button
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClose();
          onDuplicate(e);
        }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span>Duplicate</span>
      </button>

      {/* Info */}
      <button
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClose();
          onInfo(e);
        }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <Info className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span>Info</span>
      </button>

      {/* Delete */}
      <button
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClose();
          onDelete(e);
        }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        <span>Delete</span>
      </button>
    </div>
  );
}
