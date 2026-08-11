"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Undo2,
  Redo2,
  Download,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
  Wrench,
} from "lucide-react";
import {
  useProjectStore,
  autosaveService,
  type SaveStatus,
} from "@/modules/projects";
import { useExportStore } from "@/modules/editor/store/useExportStore";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import { IconButton } from "@/shared/components/ui/IconButton";
import { Button } from "@/shared/components/ui/Button";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";

export interface StudioTopBarProps {
  onOpenHelp?: () => void;
}

export function StudioTopBar({ onOpenHelp }: StudioTopBarProps) {
  const { currentProject, undo, redo, repairProjectReferences } =
    useProjectStore();

  const handleRepair = async () => {
    if (
      confirm(
        "Scan and repair project references? Invalid or missing asset links will be safely cleaned up.",
      )
    ) {
      const fixed = await repairProjectReferences();
      useToastStore
        .getState()
        .showToast(
          fixed > 0
            ? `Repaired ${fixed} reference(s)`
            : "Project references healthy",
          fixed > 0 ? "success" : "info",
        );
    }
  };
  const { setExportModalOpen } = useExportStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    return autosaveService.subscribe((status) => {
      setSaveStatus(status);
    });
  }, []);

  useEffect(() => {
    if (currentProject) {
      setNameInput(currentProject.name);
    }
  }, [currentProject]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (
      currentProject &&
      nameInput.trim() &&
      nameInput !== currentProject.name
    ) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.name = nameInput.trim();
        }
      });
      autosaveService.scheduleSave(currentProject);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      if (currentProject) setNameInput(currentProject.name);
    }
  };

  const hasClips =
    currentProject?.tracks.some((track) => track.clips.length > 0) ?? false;
  const canUndo = historyManager.canUndo();
  const canRedo = historyManager.canRedo();

  return (
    <header className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar px-4 text-studio-fg select-none">
      {/* Left: Cutnora Logo & Title & Autosave Status */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          title="Return to home"
        >
          <BrandMark
            size={28}
            className="transition-transform group-hover:-rotate-3"
          />
          <span className="text-base font-bold tracking-tight text-studio-fg">
            Cutnora
          </span>
        </Link>

        <div className="h-4 w-px bg-studio-border" />

        {/* Editable Project Name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-7 rounded border border-brand bg-studio-panel px-2 text-xs font-semibold text-studio-fg focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              title="Click to rename project"
              className="rounded px-1.5 py-0.5 text-xs font-semibold text-studio-fg hover:bg-studio-panel-raised transition-colors"
            >
              {currentProject?.name || "Untitled video"}
            </button>
          )}

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-studio-muted">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 text-selection">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span
                className="inline-flex items-center gap-1 text-mkt-success"
                title="All changes saved to IndexedDB"
              >
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span
                className="inline-flex items-center gap-1 text-destructive"
                title="Save error"
              >
                <AlertCircle className="h-3 w-3" /> Save Error
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Undo & Redo Controls */}
      <div className="flex items-center gap-1">
        <IconButton
          label="Undo (Ctrl+Z)"
          size="sm"
          variant="ghost"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Redo (Ctrl+Y)"
          size="sm"
          variant="ghost"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Right: Help & Export Action Button */}
      <div className="flex items-center gap-2">
        <ThemeToggle className="border-studio-border bg-studio-topbar text-studio-fg hover:bg-studio-hover" />

        <IconButton
          label="Repair project references"
          size="sm"
          variant="ghost"
          onClick={handleRepair}
        >
          <Wrench className="h-4 w-4" />
        </IconButton>

        <IconButton
          label="Keyboard Shortcuts (?)"
          size="sm"
          variant="ghost"
          onClick={onOpenHelp}
        >
          <HelpCircle className="h-4 w-4" />
        </IconButton>

        <Button
          size="sm"
          variant="primary"
          disabled={!hasClips}
          onClick={() => setExportModalOpen(true)}
          title={
            hasClips ? "Export video" : "Add clips to timeline before exporting"
          }
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>
      </div>
    </header>
  );
}
