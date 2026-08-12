"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  FolderPlus,
  Image as ImageIcon,
  Layout,
  Maximize,
  Music,
  Pause,
  Play,
  Redo2,
  Repeat2,
  Scissors,
  Settings2,
  Shapes,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
  Video,
  X,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { ContextualPanel } from "../panels/ContextualPanel";
import { PreviewStage } from "../stage/PreviewStage";
import { MobileTimeline } from "./MobileTimeline";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useExportStore } from "@/modules/editor/store/useExportStore";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import type { EditorTool, TimelineClip } from "@/modules/editor/types";
import { useProjectStore, autosaveService } from "@/modules/projects";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ToastContainer } from "@/shared/components/ui/Toast/ToastContainer";
import { cn } from "@/shared/utils/cn";

type MobileSheet = "library" | "inspector" | null;

type ToolItem = {
  id: EditorTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primaryTools: ToolItem[] = [
  { id: "media", label: "Media", icon: FolderPlus },
  { id: "canvas", label: "Canvas", icon: Layout },
  { id: "text", label: "Text", icon: Type },
  { id: "audio", label: "Audio", icon: Music },
];

const moreTools: ToolItem[] = [
  { id: "videos", label: "Videos", icon: Video },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "elements", label: "Elements", icon: Shapes },
];

const ExportModal = dynamic(
  () =>
    import("@/modules/editor/features/export/components/ExportModal").then(
      (mod) => mod.ExportModal,
    ),
  { ssr: false },
);

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = Math.floor(safe % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function MobileStudioShell() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const splitClip = useProjectStore((state) => state.splitClip);
  const duplicateClips = useProjectStore((state) => state.duplicateClips);
  const deleteClips = useProjectStore((state) => state.deleteClips);
  const {
    activeTool,
    selectedClipIds,
    setActiveTool,
    setActiveInspectorTab,
    setInspectorMode,
    zoomMode,
    clearSelection,
    isFullscreen,
    setIsFullscreen,
    setZoomMode,
    triggerResetView,
  } = useEditorUIStore();
  const {
    isPlaying,
    isLooping,
    togglePlay,
    stepBackward,
    stepForward,
    setDuration,
    toggleLooping,
  } = usePlaybackStore();
  const setExportModalOpen = useExportStore(
    (state) => state.setExportModalOpen,
  );
  const isExportModalOpen = useExportStore((state) => state.isExportModalOpen);
  const [sheet, setSheet] = useState<MobileSheet>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

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

  const clips = useMemo(
    () => currentProject?.tracks.flatMap((track) => track.clips) ?? [],
    [currentProject],
  );
  const selectedClip = clips.find((clip) => selectedClipIds.includes(clip.id));
  const projectDuration = Math.max(
    currentProject?.settings.duration ?? 0,
    ...clips.map((clip) => clip.timelineStart + clip.timelineDuration),
  );
  const canUndo = historyManager.canUndo();
  const canRedo = historyManager.canRedo();

  useEffect(() => {
    setDuration(projectDuration);
  }, [projectDuration, setDuration]);

  useEffect(() => {
    setZoomMode("fit");
    triggerResetView();
  }, [setZoomMode, triggerResetView]);

  useEffect(() => {
    if (
      selectedClipIds.length > 0 &&
      !clips.some((clip) => selectedClipIds.includes(clip.id))
    ) {
      clearSelection();
    }
  }, [clearSelection, clips, selectedClipIds]);

  useEffect(() => {
    if (selectedClip && sheet === "library") setSheet(null);
  }, [selectedClip, sheet]);

  const openTool = (tool: EditorTool) => {
    setActiveTool(tool);
    clearSelection();
    if (tool === "canvas") {
      setInspectorMode("canvas");
      setSheet("inspector");
      return;
    }
    setSheet("library");
  };

  const openInspector = (tab: string) => {
    if (!selectedClip) return;
    setActiveTool("canvas");
    setInspectorMode("clip");
    setActiveInspectorTab(tab);
    setSheet("inspector");
  };

  const handleSplit = () => {
    if (!selectedClip) return;
    const currentPlayhead = usePlaybackStore.getState().playhead;
    const clipEnd = selectedClip.timelineStart + selectedClip.timelineDuration;
    if (currentPlayhead <= selectedClip.timelineStart || currentPlayhead >= clipEnd) return;
    splitClip(selectedClip.id, currentPlayhead);
  };

  const handleDelete = () => {
    if (!selectedClip) return;
    deleteClips([selectedClip.id]);
    clearSelection();
  };

  const fitCanvas = () => {
    setZoomMode("fit");
    triggerResetView();
  };

  const handleStageZoomChange = (value: string) => {
    if (value === "fit") {
      fitCanvas();
      return;
    }
    setZoomMode(Number(value));
  };

  const handleMobilePlayback = () => {
    const stageVideos = document.querySelectorAll<HTMLVideoElement>(
      "#stage-canvas-box video",
    );
    stageVideos.forEach((video) => {
      if (isPlaying) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    });
    togglePlay();
  };

  const firstInspectorAction =
    selectedClip?.type === "audio"
      ? { label: "Volume", tab: "audio", icon: Music }
      : { label: "Adjust", tab: "adjust", icon: SlidersHorizontal };

  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-studio-bg text-studio-fg select-none">
      <header className="flex h-[calc(54px+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar px-3 pt-[env(safe-area-inset-top)]">
        <Link
          href="/"
          aria-label="Back to projects"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-7 w-full max-w-[150px] rounded border border-brand bg-studio-bg px-2 text-center text-xs font-bold text-studio-fg focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              title="Click to rename project"
              className="truncate rounded-md px-2 py-1 text-xs font-bold text-studio-fg transition-colors hover:bg-studio-hover active:bg-studio-hover"
            >
              {currentProject?.name || "Untitled video"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-studio-muted hover:bg-studio-hover hover:text-studio-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <Undo2 className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-studio-muted hover:bg-studio-hover hover:text-studio-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <Redo2 className="h-4.5 w-4.5" />
          </button>
          <ThemeToggle className="flex h-9 w-9 min-w-0 items-center justify-center rounded-xl border-0 bg-transparent p-0 text-studio-muted hover:bg-studio-hover hover:text-studio-fg focus-visible:ring-0 focus-visible:ring-offset-0" />
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            disabled={clips.length === 0}
            aria-label="Export"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-studio-muted hover:bg-studio-hover hover:text-brand disabled:opacity-35"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-[190px] flex-[1.25] overflow-hidden bg-canvas-bg [@media(max-height:600px)]:min-h-[160px]">
          <ErrorBoundary
            fallbackTitle="Stage Preview Error"
            fallbackMessage="Stage failed to render preview frame."
          >
            <PreviewStage />
          </ErrorBoundary>
        </div>

        <div className="flex h-[58px] shrink-0 items-center justify-between gap-1 border-y border-studio-border bg-studio-topbar px-2">
          <div className="flex min-w-0 items-center justify-center gap-0.5">
            <label className="relative block h-9 w-[102px] shrink-0">
              <span className="sr-only">Stage zoom</span>
              <select
                value={zoomMode === "fit" ? "fit" : String(zoomMode)}
                onChange={(event) => handleStageZoomChange(event.target.value)}
                className="h-full w-full appearance-none rounded-lg border border-studio-border bg-studio-panel pl-2.5 pr-7 text-[10px] font-semibold text-studio-fg outline-none focus:border-brand"
              >
                <option value="fit">Fit Stage</option>
                <option value="25">25%</option>
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
                <option value="150">150%</option>
                <option value="200">200%</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-studio-muted" />
            </label>

            <span className="mx-1 h-6 w-px shrink-0 bg-studio-border" aria-hidden="true" />

            <button
              type="button"
              onClick={stepBackward}
              aria-label="Previous frame"
              className="flex h-9 w-8 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleMobilePlayback}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={stepForward}
              aria-label="Next frame"
              className="flex h-9 w-8 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleLooping}
              aria-label={isLooping ? "Disable loop playback" : "Enable loop playback"}
              aria-pressed={isLooping}
              className={cn(
                "flex h-9 w-8 shrink-0 touch-manipulation items-center justify-center rounded-lg active:bg-studio-hover",
                isLooping ? "text-brand" : "text-studio-muted active:text-studio-fg",
              )}
            >
              <Repeat2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex h-10 w-9 shrink-0 items-center justify-end rounded-xl text-studio-muted hover:text-studio-fg"
          >
            <Maximize className="h-5 w-5" />
            <span className="sr-only">Fullscreen preview</span>
          </button>
        </div>

        {!isFullscreen ? <MobileTimeline /> : null}
      </main>

      {selectedClip ? (
        <nav className="flex h-[calc(78px+env(safe-area-inset-bottom))] shrink-0 overflow-x-auto overflow-y-hidden border-t border-studio-border bg-studio-topbar px-1 pb-[env(safe-area-inset-bottom)] touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <MobileNavButton
            label="Split"
            icon={Scissors}
            onClick={handleSplit}
          />
          <MobileNavButton
            label={firstInspectorAction.label}
            icon={firstInspectorAction.icon}
            onClick={() => openInspector(firstInspectorAction.tab)}
          />
          <MobileNavButton
            label="Transform"
            icon={Settings2}
            onClick={() => openInspector("transform")}
          />
          <MobileNavButton
            label="Duplicate"
            icon={Copy}
            onClick={() => duplicateClips([selectedClip.id])}
          />
          <MobileNavButton
            label="Delete"
            icon={Trash2}
            onClick={handleDelete}
            destructive
          />
          <MobileNavButton
            label="Done"
            icon={ChevronDown}
            onClick={() => {
              clearSelection();
              setSheet(null);
            }}
          />
        </nav>
      ) : (
        <nav className="flex h-[calc(78px+env(safe-area-inset-bottom))] shrink-0 overflow-x-auto overflow-y-hidden border-t border-studio-border bg-studio-topbar px-1 pb-[env(safe-area-inset-bottom)] touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[...primaryTools, ...moreTools].map((tool) => (
            <MobileNavButton
              key={tool.id}
              label={tool.label}
              icon={tool.icon}
              prominent={tool.id === "media"}
              active={activeTool === tool.id && sheet !== null}
              onClick={() => openTool(tool.id)}
            />
          ))}
        </nav>
      )}

      {sheet ? (
        <div
          className="absolute inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
          onPointerDown={() => setSheet(null)}
        />
      ) : null}

      {sheet ? (
        <aside
          className="absolute inset-x-0 bottom-0 z-50 mx-auto flex h-[min(76dvh,680px)] max-h-[calc(100dvh-64px)] min-h-[360px] w-full flex-col overflow-hidden rounded-t-[24px] border border-b-0 border-studio-border bg-studio-panel shadow-2xl sm:max-w-[720px]"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-studio-border px-4">
            <span className="h-1 w-8 rounded-full bg-studio-border" />
            <h2 className="flex-1 text-xs font-bold uppercase tracking-wider text-studio-fg">
              {sheet === "inspector" ? "Clip settings" : "Add to project"}
            </h2>
            <button
              type="button"
              onClick={() => setSheet(null)}
              aria-label="Close panel"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-studio-panel-raised text-studio-muted hover:text-studio-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <ErrorBoundary fallbackTitle="Panel Error">
              <ContextualPanel />
            </ErrorBoundary>
          </div>
        </aside>
      ) : null}

      {isExportModalOpen ? (
        <ErrorBoundary fallbackTitle="Export Error">
          <ExportModal />
        </ErrorBoundary>
      ) : null}
    </div>
  );
}

function MobileNavButton({
  label,
  icon: Icon,
  onClick,
  active = false,
  prominent = false,
  destructive = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  prominent?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-[72px] min-w-[72px] shrink-0 flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors",
        active ? "text-brand" : "text-studio-muted",
        destructive && "text-destructive",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          active && "bg-brand/12",
          prominent &&
            "rounded-full bg-brand text-white shadow-lg shadow-brand/25",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
