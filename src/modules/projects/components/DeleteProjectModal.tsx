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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-800/80 bg-[#111113] p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - matched to RenameModal */}
        <div className="pb-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-medium text-zinc-200">
              {isBatch ? `${batchCount} selected projects` : `"${targetName}"`}
            </span>{" "}
            and all associated files.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-2">
          <label className="block text-xs text-zinc-400 font-normal mb-2">
            Type &quot;DELETE&quot; to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="w-full rounded-xl border border-zinc-800 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          />

          {/* Footer Divider & Buttons - matched to RenameModal with red delete button */}
          <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-transparent px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmValid}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
