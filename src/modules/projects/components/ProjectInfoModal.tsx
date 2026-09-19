"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Project } from "../types";
import {
  getProjectDuration,
  formatDuration,
  formatDate,
} from "../utils/project-utils";

export interface ProjectInfoModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectInfoModal({ project, onClose }: ProjectInfoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const handleCopyId = () => {
    if (!project.id) return;
    navigator.clipboard.writeText(project.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {/* Header with Project Name - No cross icon in the top right */}
        <div className="pb-3 border-b border-zinc-800/60">
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight break-words">
            {project.name || "Untitled project"}
          </h3>
        </div>

        {/* Inner Content Rows */}
        <div className="mt-4 space-y-0.5 divide-y divide-zinc-800/40 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Duration</span>
            <span className="font-mono text-white font-medium">
              {formatDuration(getProjectDuration(project))}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Resolution</span>
            <span className="font-mono text-white font-medium">
              {project.settings?.width || 1920} × {project.settings?.height || 1080}{" "}
              <span className="text-zinc-400 font-sans text-xs">
                ({project.settings?.aspectRatio || "16:9"})
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Frame Rate</span>
            <span className="font-mono text-white font-medium">
              {project.settings?.fps || 30} FPS
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Created</span>
            <span className="text-zinc-200 font-medium">
              {formatDate(project.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Modified</span>
            <span className="text-zinc-200 font-medium">
              {formatDate(project.updatedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-zinc-400">Project ID</span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy ID"
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 hover:text-white px-2.5 py-1 rounded-md border border-zinc-700/40 transition-colors cursor-pointer"
            >
              <span>
                {project.id
                  ? project.id.length <= 12
                    ? project.id
                    : `${project.id.slice(0, 8)}...`
                  : "—"}
              </span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-[#141416] px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-black hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
