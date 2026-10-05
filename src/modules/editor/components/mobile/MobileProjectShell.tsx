"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Volume2,
  VolumeX,
  X,
  SkipBack,
  SkipForward,
  MoreHorizontal,
  Pencil,
  Minimize,
  Wrench,
  Loader2,
} from "lucide-react";
import { ContextualPanel } from "../panels/ContextualPanel";
import { PreviewStage } from "../stage/PreviewStage";
import { MobileTimeline } from "./MobileTimeline";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { playbackClock } from "@/modules/editor/features/playback/services/playback-clock";
import { useExportStore } from "@/modules/editor/store/useExportStore";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import type { EditorTool, TimelineClip } from "@/modules/editor/types";
import { useProjectStore, autosaveService } from "@/modules/projects";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { cn } from "@/shared/utils/cn";
import { DropdownMenu, DropdownMenuItem } from "@/shared/components/ui/DropdownMenu";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";

const MOBILE_HEADER_MENU_ITEM_CLASS =
  "min-h-11 gap-3 px-3 text-[13px] disabled:cursor-not-allowed disabled:opacity-35";
const MOBILE_STAGE_ZOOM_OPTIONS = ["fit", 25, 50, 75, 100, 150] as const;
const MOBILE_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const MOBILE_PLAYBACK_MENU_CLASS =
  "max-h-[min(55dvh,320px)] max-w-[calc(100vw-24px)] overflow-y-auto overscroll-contain p-0.5";
const MOBILE_PLAYBACK_OPTION_CLASS =
  "h-8 min-h-8 justify-between rounded-md px-2 py-0 text-[11px] leading-4 tabular-nums touch-manipulation active:bg-studio-hover [@media(max-height:480px)]:h-7 [@media(max-height:480px)]:min-h-7";

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

export function MobileProjectShell() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const splitClip = useProjectStore((state) => state.splitClip);
  const duplicateClips = useProjectStore((state) => state.duplicateClips);
  const deleteClips = useProjectStore((state) => state.deleteClips);
  const activeTool = useEditorUIStore((state) => state.activeTool);
  const selectedClipIds = useEditorUIStore((state) => state.selectedClipIds);
  const setActiveTool = useEditorUIStore((state) => state.setActiveTool);
  const setActiveInspectorTab = useEditorUIStore(
    (state) => state.setActiveInspectorTab,
  );
  const setInspectorMode = useEditorUIStore((state) => state.setInspectorMode);
  const zoomMode = useEditorUIStore((state) => state.zoomMode);
  const clearSelection = useEditorUIStore((state) => state.clearSelection);
  const isFullscreen = useEditorUIStore((state) => state.isFullscreen);
  const setIsFullscreen = useEditorUIStore((state) => state.setIsFullscreen);
  const setZoomMode = useEditorUIStore((state) => state.setZoomMode);
  const triggerResetView = useEditorUIStore((state) => state.triggerResetView);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const playbackRate = usePlaybackStore((state) => state.playbackRate);
  const previewMuted = usePlaybackStore((state) => state.previewMuted);
  const setPreviewMuted = usePlaybackStore((state) => state.setPreviewMuted);
  const isLooping = usePlaybackStore((state) => state.isLooping);
  const togglePlay = usePlaybackStore((state) => state.togglePlay);
  const stepBackward = usePlaybackStore((state) => state.stepBackward);
  const stepForward = usePlaybackStore((state) => state.stepForward);
  const setDuration = usePlaybackStore((state) => state.setDuration);
  const toggleLooping = usePlaybackStore((state) => state.toggleLooping);
  const setExportModalOpen = useExportStore(
    (state) => state.setExportModalOpen,
  );
  const isExportModalOpen = useExportStore((state) => state.isExportModalOpen);
  const [sheet, setSheet] = useState<MobileSheet>(null);
  const [nameInput, setNameInput] = useState(currentProject?.name ?? "Untitled video");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsEditorFullscreen(Boolean(document.fullscreenElement));
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const handleEditorFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      useToastStore.getState().showToast("Fullscreen is unavailable in this browser", "error");
    }
  };

  const handleRepair = async () => {
    if (isRepairing) return;
    setIsRepairing(true);
    try {
      const fixed = await useProjectStore.getState().repairProjectReferences();
      useToastStore.getState().showToast(
        fixed > 0 ? `Repaired ${fixed} project reference(s)` : "All project references are healthy",
        "success",
      );
    } catch {
      useToastStore.getState().showToast("Failed to scan project references", "error");
    } finally {
      setIsRepairing(false);
    }
  };

  const projectName = currentProject?.name ?? "Untitled video";

  useEffect(() => {
    setNameInput((name) => name === projectName ? name : projectName);
  }, [projectName]);

  const handleRename = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameInput(projectName);
      return;
    }
    if (
      currentProject &&
      trimmedName !== currentProject.name
    ) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.name = trimmedName;
        }
      });
      const updatedProject = useProjectStore.getState().currentProject;
      if (updatedProject) autosaveService.scheduleSave(updatedProject);
    }
    setNameInput(trimmedName);
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
    if (
      currentPlayhead <= selectedClip.timelineStart ||
      currentPlayhead >= clipEnd
    )
      return;
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
    <div className="relative flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-studio-bg text-studio-fg select-none">
      <header className="flex h-[calc(60px+env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b border-studio-border bg-studio-topbar px-2.5 pt-[env(safe-area-inset-top)]">
        <Link
          href="/projects"
          aria-label="Back to projects"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg active:bg-studio-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <input
            ref={titleInputRef}
            type="text"
            aria-label="Project name"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            onBlur={(event) => handleRename(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                event.currentTarget.value = projectName;
                setNameInput(projectName);
                event.currentTarget.blur();
              }
            }}
            enterKeyHint="done"
            autoComplete="off"
            spellCheck={false}
            className="h-5 w-full min-w-0 appearance-none rounded-none border-0 bg-transparent p-0 text-base font-semibold leading-5 tracking-tight text-studio-fg shadow-none outline-none focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg active:bg-studio-hover disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg/30"
          >
            <Undo2 className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg active:bg-studio-hover disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg/30"
          >
            <Redo2 className="h-4.5 w-4.5" />
          </button>
          <DropdownMenu
            align="right"
            animated={false}
            className="w-52 bg-studio-topbar shadow-lg backdrop-blur-none"
            trigger={(isOpen) => (
              <button
                type="button"
                aria-label="More editor options"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={cn(
                  "flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg active:bg-studio-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-fg/30",
                  isOpen && "bg-studio-hover text-studio-fg",
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            )}
          >
            <DropdownMenuItem className={MOBILE_HEADER_MENU_ITEM_CLASS} onClick={() => setExportModalOpen(true)} disabled={clips.length === 0}>
              <Download className="h-4 w-4 text-studio-muted" />
              Export video
            </DropdownMenuItem>
            <DropdownMenuItem className={MOBILE_HEADER_MENU_ITEM_CLASS} onClick={() => void handleEditorFullscreen()}>
              {isEditorFullscreen ? <Minimize className="h-4 w-4 text-studio-muted" /> : <Maximize className="h-4 w-4 text-studio-muted" />}
              {isEditorFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </DropdownMenuItem>
            <DropdownMenuItem className={MOBILE_HEADER_MENU_ITEM_CLASS} onClick={() => void handleRepair()} disabled={isRepairing}>
              {isRepairing ? <Loader2 className="h-4 w-4 animate-spin text-studio-muted" /> : <Wrench className="h-4 w-4 text-studio-muted" />}
              {isRepairing ? "Repairing…" : "Repair project"}
            </DropdownMenuItem>
            <div role="separator" className="my-1 border-t border-studio-border" />
            <DropdownMenuItem className={MOBILE_HEADER_MENU_ITEM_CLASS} onClick={() => {
              titleInputRef.current?.focus();
              titleInputRef.current?.select();
            }}>
              <Pencil className="h-4 w-4 text-studio-muted" />
              Rename project
            </DropdownMenuItem>
            <ThemeToggle
              variant="outline"
              showLabel
              className="h-11 w-full justify-start gap-3 rounded-lg border-0 bg-transparent px-3 text-studio-fg shadow-none hover:bg-studio-hover [&_span]:text-[13px] [&_span]:font-medium"
            />
          </DropdownMenu>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-[160px] flex-[0.85] overflow-hidden bg-canvas-bg [@media(max-height:600px)]:min-h-[120px] [@media(max-height:480px)]:min-h-[96px]">
          <ErrorBoundary
            fallbackTitle="Stage Preview Error"
            fallbackMessage="Stage failed to render preview frame."
          >
            <PreviewStage />
          </ErrorBoundary>
        </div>

        <div className="grid h-11 min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center border-y border-studio-border bg-studio-topbar px-1.5">
          <div className="flex min-w-0 items-center justify-between pr-1">
            <DropdownMenu
              animated={false}
              triggerClassName="w-16 shrink-0"
              className={cn(MOBILE_PLAYBACK_MENU_CLASS, "w-32")}
              trigger={(isOpen) => (
                <button
                  type="button"
                  aria-label="Stage zoom"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  className={cn(
                    "flex h-10 w-full min-w-0 touch-manipulation items-center gap-0.5 rounded-lg px-1 text-[10px] font-medium text-studio-fg active:bg-studio-hover focus-visible:outline-brand",
                    isOpen && "bg-studio-hover",
                  )}
                >
                  <span className="w-[42px] shrink-0 truncate">{zoomMode === "fit" ? "Fit Stage" : `${zoomMode}%`}</span>
                  <ChevronDown className={cn("h-2.5 w-2.5 shrink-0 text-studio-muted", isOpen && "rotate-180")} />
                </button>
              )}
            >
                {MOBILE_STAGE_ZOOM_OPTIONS.map((zoom) => (
                  <DropdownMenuItem
                    key={zoom}
                    role="menuitemradio"
                    aria-checked={zoomMode === zoom}
                    onClick={() => handleStageZoomChange(String(zoom))}
                    className={cn(
                      MOBILE_PLAYBACK_OPTION_CLASS,
                      zoomMode === zoom ? "bg-studio-hover text-studio-fg font-semibold" : "text-studio-muted",
                    )}
                  >
                    <span>{zoom === "fit" ? "Fit Stage" : `${zoom}%`}</span>
                    {zoomMode === zoom && <Check className="h-3 w-3 shrink-0" />}
                  </DropdownMenuItem>
                ))}
            </DropdownMenu>

            <button
              type="button"
              onClick={() => setPreviewMuted(!previewMuted)}
              aria-label={previewMuted ? "Unmute preview audio" : "Mute preview audio"}
              aria-pressed={previewMuted}
              className={cn(
                "flex h-10 w-6 shrink-0 touch-manipulation items-center justify-center rounded-lg active:bg-studio-hover focus-visible:outline-brand",
                previewMuted ? "text-brand" : "text-studio-muted active:text-studio-fg",
              )}
            >
              {previewMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={stepBackward}
              aria-label="Previous frame"
              className="flex h-10 w-7 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg focus-visible:outline-brand"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleMobilePlayback}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="group flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl text-brand-contrast focus-visible:outline-brand"
          >
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand shadow-sm ring-1 ring-inset ring-brand-contrast/10 transition-transform duration-150 group-active:scale-95">
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </span>
          </button>
          <div className="flex min-w-0 items-center justify-between pl-1">
            <button
              type="button"
              onClick={stepForward}
              aria-label="Next frame"
              className="flex h-10 w-7 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg focus-visible:outline-brand"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleLooping}
              aria-label={
                isLooping ? "Disable loop playback" : "Enable loop playback"
              }
              aria-pressed={isLooping}
              className={cn(
                "flex h-10 w-6 shrink-0 touch-manipulation items-center justify-center rounded-lg active:bg-studio-hover focus-visible:outline-brand",
                isLooping
                  ? "text-brand"
                  : "text-studio-muted active:text-studio-fg",
              )}
            >
              <Repeat2 className="h-3.5 w-3.5" />
            </button>
            <DropdownMenu
              align="right"
              animated={false}
              triggerClassName="w-11 shrink-0"
              className={cn(MOBILE_PLAYBACK_MENU_CLASS, "w-32")}
              trigger={(isOpen) => (
                <button
                  type="button"
                  aria-label={`Preview playback speed: ${playbackRate}×`}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  className={cn(
                    "flex h-10 w-full touch-manipulation items-center justify-center gap-0.5 rounded-lg px-0.5 text-[10px] font-medium tabular-nums text-studio-fg active:bg-studio-hover focus-visible:outline-brand",
                    isOpen && "bg-studio-hover",
                  )}
                >
                  <span className="w-6 shrink-0 text-center">{playbackRate}×</span>
                  <ChevronDown className={cn("h-2.5 w-2.5 shrink-0 text-studio-muted", isOpen && "rotate-180")} />
                </button>
              )}
            >
              <div className="px-2 py-1.5 text-[9px] font-medium leading-3 text-studio-muted">Playback speed</div>
                {MOBILE_PLAYBACK_RATES.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    role="menuitemradio"
                    aria-checked={playbackRate === rate}
                    onClick={() => playbackClock.setPlaybackRate(rate)}
                    aria-label={rate === 1 ? "1×, normal speed" : `${rate}×`}
                    className={cn(
                      MOBILE_PLAYBACK_OPTION_CLASS,
                      playbackRate === rate ? "bg-studio-hover text-studio-fg font-semibold" : "text-studio-muted",
                    )}
                  >
                    <span>{rate}×{rate === 1 ? " · Normal" : ""}</span>
                    {playbackRate === rate && <Check className="h-3 w-3 shrink-0" />}
                  </DropdownMenuItem>
                ))}
            </DropdownMenu>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              aria-label="Fullscreen preview"
              className="flex h-10 w-7 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted active:bg-studio-hover active:text-studio-fg focus-visible:outline-brand"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!isFullscreen ? <MobileTimeline /> : null}
      </main>

      {selectedClip ? (
        <nav aria-label="Clip actions" className="flex h-[calc(64px+env(safe-area-inset-bottom))] shrink-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-t border-studio-border bg-studio-topbar px-1 pb-[env(safe-area-inset-bottom)] touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
        <nav aria-label="Editor tools" className="flex h-[calc(64px+env(safe-area-inset-bottom))] shrink-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-t border-studio-border bg-studio-topbar px-1 pb-[env(safe-area-inset-bottom)] touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
              {sheet === "inspector"
                ? selectedClip
                  ? "Clip settings"
                  : "Canvas settings"
                : "Add to project"}
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

          <div className="min-h-0 flex-1 overflow-hidden [&_[data-studio-panel-header]]:hidden">
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
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-[62px] min-w-[62px] flex-1 snap-start touch-manipulation flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-colors active:bg-studio-hover focus-visible:outline-brand",
        active ? "text-brand" : "text-studio-muted",
        destructive && "text-destructive",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          active && "bg-brand/12",
          prominent &&
            "rounded-full bg-brand text-brand-contrast shadow-lg shadow-brand/25",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export const MobileStudioShell = MobileProjectShell;
