"use client";

import React, { useState, useEffect } from "react";
import type { Project } from "../types";

export interface DeleteProjectModalProps {
  isOpen: boolean;
  project?: Project | null;
  batchCount?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProjectModal({
  isOpen,
  project,
  batchCount = 0,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBatch = batchCount > 1 || (!project && batchCount > 0);
  const targetName = isBatch
    ? `${batchCount} projects`
    : project?.name || "project";

  const title = isBatch
    ? `Delete ${batchCount} projects`
    : `Delete project`;

  const isConfirmValid = confirmText.trim() === "DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmValid) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - matched to RenameModal */}
        <div className="pb-3">
          <h3 id="delete-modal-title" className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            This will permanently delete{" "}
            <span className="font-medium text-foreground">
              {isBatch ? `${batchCount} selected projects` : `"${targetName}"`}
            </span>{" "}
            and all associated files.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-2">
          <label className="block text-xs text-muted-foreground font-normal mb-2">
            Type &quot;DELETE&quot; to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive transition-colors"
          />

          {/* Footer Divider & Buttons - matched to RenameModal with red delete button */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmValid}
              className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white hover:bg-destructive-hover active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
