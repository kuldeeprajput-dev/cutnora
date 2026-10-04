"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Undo2,
  Redo2,
  Download,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
  Wrench,
  Maximize2,
  Minimize2,
  FolderOpen,
  Plus,
  Pencil,
  Keyboard,
  LogOut,
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
import { DropdownMenu, DropdownMenuItem } from "@/shared/components/ui/DropdownMenu";

const EDITOR_MENU_ITEM_CLASS =
  "rounded-md px-2 py-2 text-studio-fg/75 hover:bg-studio-fg/5 hover:text-studio-fg";

export interface ProjectTopBarProps {
  onOpenHelp?: () => void;
}

export function ProjectTopBar({ onOpenHelp }: ProjectTopBarProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateFromEditor = async (href: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const project = useProjectStore.getState().currentProject;
      if (project) {
        autosaveService.scheduleSave(project, 0);
        await autosaveService.executeSave();
        if (autosaveService.getStatus() === "error") return;
      }
      router.push(href);
    } catch {
      useToastStore.getState().showToast("Could not leave the editor. Please try again.", "error");
    } finally {
      setIsNavigating(false);
    }
  };

  const projectName = useProjectStore(
    (state) => state.currentProject?.name ?? "Untitled video",
  );
  const hasClips = useProjectStore(
    (state) =>
      state.currentProject?.tracks.some((track) => track.clips.length > 0) ??
      false,
  );
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const repairProjectReferences = useProjectStore(
    (state) => state.repairProjectReferences,
  );

  const [repairState, setRepairState] = useState<"idle" | "loading" | "success">("idle");

  const handleRepair = async () => {
    if (repairState !== "idle") return;
    setRepairState("loading");
    try {
      const [fixed] = await Promise.all([
        repairProjectReferences(),
        new Promise<number>((resolve) => setTimeout(() => resolve(0), 800)),
      ]);
      setRepairState("success");
      useToastStore
        .getState()
        .showToast(
          fixed > 0
            ? `Repaired ${fixed} project reference(s)`
            : "All project references are healthy",
          "success",
        );
      setTimeout(() => {
        setRepairState("idle");
      }, 1500);
    } catch {
      setRepairState("idle");
      useToastStore
        .getState()
        .showToast("Failed to scan project references", "error");
    }
  };
  const { setExportModalOpen } = useExportStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    return autosaveService.subscribe((status) => {
      setSaveStatus(status);
    });
  }, []);

  useEffect(() => {
    setNameInput((currentName) =>
      currentName === projectName ? currentName : projectName,
    );
  }, [projectName]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    const currentProject = useProjectStore.getState().currentProject;
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
      const updatedProject = useProjectStore.getState().currentProject;
      if (updatedProject) autosaveService.scheduleSave(updatedProject);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setNameInput(projectName);
    }
  };

  const canUndo = historyManager.canUndo();
  const canRedo = historyManager.canRedo();

  return (
    <header className="relative flex h-[56px] w-full shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar pr-2.5 text-studio-fg select-none">
      {/* Left: Logo, Title & Autosave Status */}
      <div className="flex min-w-0 items-center">
        {/* Logo aligned with sidebar rail center axis (10px padding + 1px border + 32px center = 43px) */}
        <div className="ml-[11px] flex w-[64px] shrink-0 items-center justify-center">
          <DropdownMenu
            animated={false}
            className="w-44 border-studio-border-strong bg-studio-topbar shadow-lg shadow-black/15 backdrop-blur-none"
            trigger={(isOpen) => (
              <button
                type="button"
                aria-label="Open Cutnora menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                disabled={isNavigating}
                className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-studio-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg/40 disabled:cursor-wait"
              >
                <BrandMark size={28} />
              </button>
            )}
          >
            <DropdownMenuItem className={EDITOR_MENU_ITEM_CLASS} disabled={isNavigating} onClick={() => void navigateFromEditor("/projects")}>
              <FolderOpen className="h-4 w-4 text-studio-muted" />
              Projects
            </DropdownMenuItem>
            <DropdownMenuItem className={EDITOR_MENU_ITEM_CLASS} disabled={isNavigating} onClick={() => void navigateFromEditor("/projects/new")}>
              <Plus className="h-4 w-4 text-studio-muted" />
              New project
            </DropdownMenuItem>
            <DropdownMenuItem className={EDITOR_MENU_ITEM_CLASS} onClick={() => setIsEditingName(true)}>
              <Pencil className="h-4 w-4 text-studio-muted" />
              Rename project
            </DropdownMenuItem>
            <div role="separator" className="my-1 border-t border-studio-border" />
            {onOpenHelp && (
              <DropdownMenuItem className={EDITOR_MENU_ITEM_CLASS} onClick={onOpenHelp}>
                <Keyboard className="h-4 w-4 text-studio-muted" />
                Keyboard shortcuts
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className={EDITOR_MENU_ITEM_CLASS} disabled={isNavigating} onClick={() => void navigateFromEditor("/")}>
              <LogOut className="h-4 w-4 text-studio-muted" />
              Exit editor
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        {/* Editable Project Name */}
        <div className="flex min-w-0 items-center gap-2 pl-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-7 rounded-md border border-studio-border bg-studio-panel px-2 text-xs font-semibold text-studio-fg focus:outline-none focus:border-studio-border-strong focus:ring-1 focus:ring-studio-border transition-all"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              title="Click to rename project"
              className="max-w-52 truncate rounded-md px-2 py-1 text-xs font-semibold text-studio-fg transition-colors hover:bg-studio-panel-raised max-[1180px]:max-w-36"
            >
              {projectName}
            </button>
          )}

          {/* Autosave Status Indicator */}
          <div
            aria-live="polite"
            className="flex items-center gap-1 text-[11px] text-studio-muted max-[1180px]:hidden"
          >
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 text-studio-muted">
                <Loader2 className="h-3 w-3 animate-spin text-studio-muted" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span
                className="inline-flex items-center gap-1 text-studio-muted"
                title="All changes saved locally"
              >
                <Check className="h-3 w-3 text-studio-muted" /> Saved
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

      {/* Middle: Undo & Redo Controls (Always Centered) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex shrink-0 items-center gap-0.5">
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

      {/* Right: Theme, Fullscreen, Repair, Help & Export Action Button */}
      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle variant="ghost" />

        <IconButton
          label={isFullscreen ? "Exit Fullscreen (F11)" : "Full Screen (F11)"}
          size="sm"
          variant="ghost"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </IconButton>

        <IconButton
          label={
            repairState === "loading"
              ? "Scanning project..."
              : repairState === "success"
                ? "References healthy"
                : "Scan & repair references"
          }
          size="sm"
          variant="ghost"
          disabled={repairState !== "idle"}
          onClick={handleRepair}
        >
          {repairState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-studio-fg" />
          ) : repairState === "success" ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
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

export const StudioTopBar = ProjectTopBar;
export type StudioTopBarProps = ProjectTopBarProps;
