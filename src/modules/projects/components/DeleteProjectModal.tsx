"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
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
    ? `Delete ${batchCount} projects?`
    : `Delete '${targetName}'?`;

  const warningMessage = isBatch
    ? `This will permanently delete ${batchCount} selected projects and all associated files.`
    : `This will permanently delete "${targetName}" and all associated files.`;

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
        className="w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-[#111113] p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - No cross icon in the top right */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white break-words">
            {title}
          </h3>
        </div>

        {/* Warning Section in Red */}
        <div className="mt-5 rounded-xl border border-red-600/70 bg-[#180d0d] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-red-500">Warning</h4>
              <p className="mt-1 text-xs sm:text-sm text-red-500 leading-relaxed break-words">
                {warningMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Form with Input */}
        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block text-xs sm:text-sm font-medium text-zinc-400">
            Type &quot;DELETE&quot; to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="mt-2 w-full rounded-xl border border-red-600 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          />

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-[#161618] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmValid}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isBatch ? "Delete projects" : "Delete project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
