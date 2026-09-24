"use client";

import React from "react";
import {
  Scissors,
  ArrowLeftToLine,
  ArrowRightToLine,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Maximize2,
  Video,
  Music,
  Image as ImageIcon,
  Type,
  ChevronDown,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/modules/core/db/database";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";
import { IconButton } from "@/shared/components/ui/IconButton";
import { Button } from "@/shared/components/ui/Button";
import { Slider } from "@/shared/components/ui/Slider";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/shared/components/ui/DropdownMenu";
import { formatTimecode } from "../utils/ruler-utils";
import {
  MAX_TIMELINE_ZOOM,
  getNextTimelineZoom,
  sliderValueToTimelineZoom,
  timelineZoomToSliderValue,
} from "../utils/timeline-zoom-utils";

const STAGE_ZOOM_OPTIONS: Array<{ label: string; value: "fit" | number }> = [
  { label: "Fit Stage", value: "fit" },
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "150%", value: 150 },
  { label: "200%", value: 200 },
];

function truncateFileName(name: string, maxLength = 22): string {
  if (!name || name.length <= maxLength) return name;
  const lastDot = name.lastIndexOf(".");
  if (lastDot > 0 && lastDot > name.length - 8) {
    const ext = name.slice(lastDot);
    const base = name.slice(0, lastDot);
    const availableBaseLen = maxLength - ext.length - 3;
    if (availableBaseLen > 3) {
      return `${base.slice(0, availableBaseLen)}...${ext}`;
    }
  }
  return `${name.slice(0, maxLength - 3)}...`;
}

export interface TimelineToolbarProps {
  fitTimelineZoom?: number;
  minimumTimelineZoom?: number;
}

export function TimelineToolbar({
  fitTimelineZoom = 50,
  minimumTimelineZoom = 10,
}: TimelineToolbarProps) {
  const {
    selectedClipIds,
    zoom,
    setZoom,
    activeTool,
    setActiveTool,
    zoomMode,
    setZoomMode,
    stageScale,
    triggerResetView,
    showTrackHeaders = true,
    toggleTrackHeaders,
  } = useEditorUIStore();

  const {
    playhead,
    duration,
    fps,
    isPlaying,
    isLooping,
    togglePlay,
    toggleLooping,
    stepForward,
    stepBackward,
  } = usePlaybackStore();

  const { currentProject, splitClip, trimClip, duplicateClips, deleteClips, addTrack } =
    useProjectStore();

  const projectSettings = currentProject?.settings || {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 10,
  };

  const hasSelection = selectedClipIds.length > 0;
  const hasTimelineMedia = (currentProject?.tracks ?? []).some(
    (track) => track.clips.length > 0,
  );

  // Selected media properties logic
  const selectedClips = (currentProject?.tracks || [])
    .flatMap((t) => t.clips)
    .filter((c) => selectedClipIds.includes(c.id));

  const selectedClip = selectedClips.length === 1 ? selectedClips[0] : null;

  const selectedAsset = useLiveQuery(
    async () => {
      if (!selectedClip?.assetId) return null;
      return db.assets.get(selectedClip.assetId);
    },
    [selectedClip?.assetId],
    null,
  );

  let selectedMediaName: string | null = null;
  let selectedMediaDetails: string | null = null;

  if (selectedClips.length > 1) {
    selectedMediaName = `${selectedClips.length} clips selected`;
  } else if (selectedClip) {
    const name = selectedClip.name;
    const isVideo =
      selectedClip.type === "video" || selectedAsset?.type === "video";
    const isImage =
      selectedClip.type === "image" || selectedAsset?.type === "image";
    const isAudio =
      selectedClip.type === "audio" || selectedAsset?.type === "audio";

    selectedMediaName = truncateFileName(name, 22);

    const width =
      selectedAsset?.width ||
      (selectedClip.transform?.width
        ? Math.round(selectedClip.transform.width)
        : null);
    const height =
      selectedAsset?.height ||
      (selectedClip.transform?.height
        ? Math.round(selectedClip.transform.height)
        : null);

    const details: string[] = [];

    if (width && height && (isVideo || isImage)) {
      details.push(`${width}×${height}`);
    }

    // FPS only displayed for VIDEO clips
    if (isVideo) {
      const activeFps =
        (selectedAsset as any)?.fps || fps || projectSettings.fps;
      details.push(`${activeFps} FPS`);
    } else if (isAudio) {
      const durationSecs = selectedClip.timelineDuration;
      details.push(`${durationSecs.toFixed(1)}s`);
    }

    selectedMediaDetails = details.length > 0 ? details.join(" • ") : null;
  }

  const handleSplit = () => {
    if (selectedClipIds.length > 0) {
      selectedClipIds.forEach((id) => splitClip(id, playhead));
    }
  };

  const handleTrimLeft = () => {
    if (selectedClips.length > 0) {
      selectedClips.forEach((clip) => {
        const clipStart = clip.timelineStart;
        const clipEnd = clip.timelineStart + clip.timelineDuration;
        if (playhead > clipStart && playhead <= clipEnd) {
          const newDuration = Math.max(0.1, clipEnd - playhead);
          const delta = playhead - clipStart;
          const newSourceStart = clip.sourceStart + delta * (clip.speed ?? 1);
          trimClip(clip.id, playhead, newDuration, newSourceStart);
        }
      });
    }
  };

  const handleTrimRight = () => {
    if (selectedClips.length > 0) {
      selectedClips.forEach((clip) => {
        const clipStart = clip.timelineStart;
        const clipEnd = clip.timelineStart + clip.timelineDuration;
        if (playhead >= clipStart && playhead < clipEnd) {
          const newDuration = Math.max(0.1, playhead - clipStart);
          trimClip(clip.id, clipStart, newDuration, clip.sourceStart);
        }
      });
    }
  };

  const handleDuplicate = () => {
    if (selectedClipIds.length > 0) {
      duplicateClips(selectedClipIds);
    }
  };

  const handleDelete = () => {
    if (selectedClipIds.length > 0) {
      deleteClips(selectedClipIds);
      useEditorUIStore.getState().clearSelection();
    }
  };

  const handleResetZoom = () => {
    setZoom(fitTimelineZoom);
  };

  return (
    <div className="relative flex h-11 w-full shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-studio-border bg-transparent px-2 text-xs select-none">
      {/* Left: Timeline Edit Actions */}
      <div className="z-10 flex shrink-0 items-center gap-0.5">
        <IconButton
          label="Split"
          shortcut="S"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleSplit}
          tooltipPosition="top"
          className="cursor-pointer"
        >
          <Scissors className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Trim Left"
          shortcut="Q"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleTrimLeft}
          tooltipPosition="top"
          className="cursor-pointer"
        >
          <ArrowLeftToLine className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Trim Right"
          shortcut="W"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleTrimRight}
          tooltipPosition="top"
          className="cursor-pointer"
        >
          <ArrowRightToLine className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Duplicate"
          shortcut="Ctrl+D"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDuplicate}
          tooltipPosition="top"
          className="cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label="Delete"
          shortcut="Del"
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={handleDelete}
          tooltipPosition="top"
          className="cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>

        <div className="mx-1 h-3.5 w-px bg-studio-border" />

        <DropdownMenu
          align="left"
          className="min-w-0 w-[136px] p-1 rounded-xl border border-studio-border bg-studio-panel-raised/95 backdrop-blur-md shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150"
          trigger={(isOpen) => (
            <button
              type="button"
              className={cn(
                "group flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors cursor-pointer select-none",
                isOpen
                  ? "bg-studio-hover text-studio-fg shadow-xs"
                  : "text-studio-fg/90 hover:bg-studio-hover hover:text-studio-fg"
              )}
            >
              <Plus
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isOpen
                    ? "text-studio-fg"
                    : "text-studio-muted group-hover:text-studio-fg"
                )}
              />
              <span>Add Track</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-studio-muted transition-transform duration-150 ml-0.5",
                  isOpen && "rotate-180 text-studio-fg"
                )}
              />
            </button>
          )}
        >
          <DropdownMenuItem
            onClick={() => addTrack("video", "Video Track")}
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-studio-fg/90 hover:text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
          >
            <Video className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg transition-colors shrink-0" />
            <span className="truncate">Video Track</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => addTrack("audio", "Audio Track")}
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-studio-fg/90 hover:text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
          >
            <Music className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg transition-colors shrink-0" />
            <span className="truncate">Audio Track</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => addTrack("overlay", "Image Track")}
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-studio-fg/90 hover:text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg transition-colors shrink-0" />
            <span className="truncate">Image Track</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => addTrack("text", "Text Track")}
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-studio-fg/90 hover:text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
          >
            <Type className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg transition-colors shrink-0" />
            <span className="truncate">Text Track</span>
          </DropdownMenuItem>
        </DropdownMenu>

        <div className="mx-0.5 h-3.5 w-px bg-studio-border" />

        <IconButton
          label={showTrackHeaders ? "Hide tracks" : "Show tracks"}
          size="sm"
          variant="ghost"
          onClick={toggleTrackHeaders}
          tooltipPosition="top"
          className={cn(
            "cursor-pointer h-7 w-7 transition-colors",
            !showTrackHeaders
              ? "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised"
              : "text-studio-fg/90 hover:bg-studio-panel-raised",
          )}
        >
          <Layers
            className={cn(
              "h-3.5 w-3.5 transition-opacity",
              !showTrackHeaders && "opacity-40",
            )}
          />
        </IconButton>
      </div>

      {/* Center: Stage Controls + Transport Playback Controls (Always Centered) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex shrink-0 items-center gap-2">
        {/* Canvas Stage View Controls (Fit Stage) */}
        <div className="flex items-center shrink-0 w-[78px]">
          <DropdownMenu
            align="left"
            className="w-28 p-1"
            trigger={(isOpen) => (
              <button
                type="button"
                className={cn(
                  "flex h-7 w-[78px] items-center justify-between rounded-md bg-transparent px-1.5 text-xs font-medium text-studio-fg transition-colors cursor-pointer select-none",
                  "hover:bg-studio-panel-raised hover:text-studio-fg",
                  "focus-visible:outline-none focus-visible:bg-studio-panel-raised",
                  isOpen && "bg-studio-panel-raised text-studio-fg"
                )}
              >
                <span className="truncate">
                  {zoomMode === "fit" ? "Fit Stage" : `${zoomMode}%`}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-studio-muted transition-transform duration-150 shrink-0",
                    isOpen && "rotate-180 text-studio-fg"
                  )}
                />
              </button>
            )}
          >
            {STAGE_ZOOM_OPTIONS.map((opt) => {
              const isSelected = zoomMode === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.label}
                  onClick={() => setZoomMode(opt.value)}
                  className={cn(
                    "flex items-center justify-between px-2 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors",
                    isSelected
                      ? "bg-studio-hover text-studio-fg font-semibold"
                      : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised/50"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-3 w-3 text-studio-fg shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </div>

        <div className="h-3.5 w-px bg-studio-border" />

        {/* Transport Playback Controls & Timecode */}
        <div className="flex items-center gap-1">
          <IconButton
            label="Step backward 1 frame"
            size="sm"
            variant="ghost"
            onClick={stepBackward}
            showTooltip={false}
            className="cursor-pointer text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            size="sm"
            variant="ghost"
            onClick={togglePlay}
            showTooltip={false}
            className="cursor-pointer rounded-md bg-studio-fg text-studio-bg hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current text-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current text-current ml-0.5" />
            )}
          </IconButton>

          <IconButton
            label="Step forward 1 frame"
            size="sm"
            variant="ghost"
            onClick={stepForward}
            showTooltip={false}
            className="cursor-pointer text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            label={isLooping ? "Disable loop" : "Enable loop"}
            size="sm"
            variant="ghost"
            onClick={toggleLooping}
            showTooltip={false}
            className={cn(
              "cursor-pointer transition-colors hover:bg-studio-panel-raised",
              isLooping
                ? "text-studio-fg"
                : "text-studio-muted hover:text-studio-fg",
            )}
          >
            {isLooping ? (
              <Repeat1 className="h-3.5 w-3.5" />
            ) : (
              <Repeat className="h-3.5 w-3.5" />
            )}
          </IconButton>

          <span className="ml-1.5 font-mono text-[11px] font-semibold text-studio-fg whitespace-nowrap select-none">
            {formatTimecode(playhead, fps, false)}{" "}
            <span className="text-studio-muted font-normal">/</span>{" "}
            <span className="text-studio-muted font-normal">
              {formatTimecode(duration, fps, false)}
            </span>
          </span>

          <IconButton
            label="Toggle fullscreen"
            size="sm"
            variant="ghost"
            showTooltip={false}
            onClick={() => {
              const stageContainer =
                document.getElementById("stage-fullscreen-container") ||
                document.documentElement;
              if (!document.fullscreenElement) {
                stageContainer.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
              useEditorUIStore.getState().toggleFullscreen();
            }}
            className="cursor-pointer text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised ml-0.5"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Right: Selected Media Info + Zoom Controls */}
      <div className="z-10 ml-auto flex shrink-0 items-center gap-2">
        {/* Selected Media Indicator (Only displayed when media is selected) */}
        {(selectedMediaName || selectedMediaDetails) ? (
          <>
            <div className="flex items-center gap-1.5 font-mono text-studio-muted text-[11px] whitespace-nowrap shrink-0 max-w-[200px] truncate">
              <span
                className="font-medium text-studio-fg/90 truncate"
                title={selectedClip?.name || selectedMediaName || undefined}
              >
                {selectedMediaName}
              </span>
              {selectedMediaDetails && (
                <>
                  <span>•</span>
                  <span className="truncate">{selectedMediaDetails}</span>
                </>
              )}
            </div>
            <div className="h-3.5 w-px bg-studio-border" />
          </>
        ) : null}

        {/* Timeline Zoom Slider Controls */}
        <div className="flex items-center gap-1">
          <Tooltip content="Reset zoom" position="top">
            <button
              type="button"
              aria-label="Reset zoom"
              className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
              onClick={handleResetZoom}
              disabled={!hasTimelineMedia}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="flex items-center gap-1 w-40">
            <Tooltip content="Zoom out" shortcut="-" position="top">
              <button
                type="button"
                aria-label="Zoom out"
                className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
                onClick={() =>
                  setZoom(getNextTimelineZoom(zoom, "out", minimumTimelineZoom))
                }
                disabled={!hasTimelineMedia || zoom <= minimumTimelineZoom}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Slider
              value={timelineZoomToSliderValue(zoom, minimumTimelineZoom)}
              min={0}
              max={100}
              step={1}
              disabled={!hasTimelineMedia}
              onValueChange={(value) =>
                setZoom(sliderValueToTimelineZoom(value, minimumTimelineZoom))
              }
            />
            <Tooltip content="Zoom in" shortcut="+" position="top">
              <button
                type="button"
                aria-label="Zoom in"
                className="p-1 rounded text-studio-fg/85 hover:text-studio-fg bg-transparent hover:bg-transparent cursor-pointer transition-colors"
                onClick={() =>
                  setZoom(getNextTimelineZoom(zoom, "in", minimumTimelineZoom))
                }
                disabled={!hasTimelineMedia || zoom >= MAX_TIMELINE_ZOOM}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
