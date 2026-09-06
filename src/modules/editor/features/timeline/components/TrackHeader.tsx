"use client";

import React, { useState } from "react";
import type { Track } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { IconButton } from "@/shared/components/ui/IconButton";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/shared/components/ui/DropdownMenu";
import { confirm } from "@/shared/components/ui/Popup";
import { TrackHeaderContextMenu } from "./TrackHeaderContextMenu";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  GripVertical,
  MoreVertical,
  Trash2,
  Edit2,
  Video,
  Type,
  Music,
  Shapes,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface TrackHeaderProps {
  track: Track;
  reorderState?: "active" | "over" | null;
  reorderDropPosition?: "before" | "after";
}

export function TrackHeader({
  track,
  reorderState,
  reorderDropPosition = "before",
}: TrackHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(track.name);
  const { currentProject, deleteTrack } = useProjectStore();
  const activeTrackId = useEditorUIStore((state) => state.activeTrackId);
  const setActiveTrackId = useEditorUIStore((state) => state.setActiveTrackId);
  const trackHeaderWidth = useEditorUIStore((state) =>
    Math.max(170, state.trackHeaderWidth ?? 180),
  );
  const isCompact = trackHeaderWidth < 200;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  const isSelected = activeTrackId === track.id;

  const handleToggleLock = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.locked = !t.locked;
      }
    });
  };

  const handleToggleHide = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.hidden = !t.hidden;
      }
    });
  };

  const handleToggleMute = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.muted = !t.muted;
      }
    });
  };

  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (nameInput.trim() && nameInput !== track.name) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          const t = state.currentProject.tracks.find((x) => x.id === track.id);
          if (t) t.name = nameInput.trim();
        }
      });
    }
  };

  const handleDeleteTrack = async () => {
    if (track.clips.length > 0) {
      const ok = await confirm({
        title: "Delete Track",
        message: `Track "${track.name}" contains ${track.clips.length} clip(s). Are you sure you want to delete this track and all of its clips?`,
        confirmText: "Delete Track",
        variant: "destructive",
      });
      if (!ok) return;
    }
    if (!currentProject) return;
    deleteTrack(track.id);
    if (activeTrackId === track.id) setActiveTrackId(null);
    useEditorUIStore.getState().clearSelection();
  };

  const renderTypeIcon = () => {
    switch (track.type) {
      case "video":
        return <Video className="h-3.5 w-3.5 text-brand shrink-0" />;
      case "overlay":
        return <Shapes className="h-3.5 w-3.5 text-mkt-info shrink-0" />;
      case "text":
        return <Type className="h-3.5 w-3.5 text-selection shrink-0" />;
      case "audio":
        return <Music className="h-3.5 w-3.5 text-mkt-success shrink-0" />;
    }
  };

  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setActiveTrackId(track.id)}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative flex h-12 w-full shrink-0 items-center border-b border-studio-border bg-studio-topbar px-1.5 text-studio-fg select-none transition-[background-color,border-color,opacity,box-shadow] hover:bg-studio-panel overflow-hidden",
          !isCompact ? "justify-between" : "justify-between gap-1",
          isSelected &&
            "bg-studio-panel-raised shadow-[inset_3px_0_0_var(--color-brand),inset_0_1px_0_rgba(255,255,255,0.025)]",
          reorderState === "active" &&
            "border-y border-dashed border-brand/50 bg-brand/5",
          reorderState === "over" && "bg-brand/10",
        )}
      >
        {reorderState === "over" && (
          <div
            className={cn(
              "pointer-events-none absolute left-0 right-0 z-40 h-0.5 bg-brand shadow-[0_0_8px_rgba(234,88,12,0.8)]",
              reorderDropPosition === "before" ? "-top-px" : "-bottom-px",
            )}
          >
            <span className="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand" />
          </div>
        )}

        {/* Left: Drag Handle & Track Type Icon / Name */}
        <div
          className={cn(
            "flex items-center min-w-0",
            !isCompact ? "flex-1 gap-1.5" : "shrink-0 gap-1",
          )}
        >
          <button
            type="button"
            aria-label="Reorder track"
            {...attributes}
            {...listeners}
            title="Drag to reorder track"
            className={cn(
              "flex h-6 w-4 shrink-0 touch-none cursor-grab items-center justify-center rounded text-studio-muted outline-none transition-[color,background-color,transform] hover:bg-studio-panel-raised hover:text-studio-fg focus-visible:ring-1 focus-visible:ring-brand active:cursor-grabbing active:scale-95",
              isDragging && "bg-brand/15 text-brand",
            )}
          >
            <GripVertical className="h-3 w-3" />
          </button>

          <span
            className={cn(
              "flex h-6 w-5 shrink-0 items-center justify-center transition-opacity",
              (track.muted || track.hidden) && "opacity-60",
            )}
            title={`${track.name} (${track.type} track)${track.locked ? " • Locked" : ""}${track.muted ? " • Muted" : ""}${track.hidden ? " • Hidden" : ""}`}
          >
            {renderTypeIcon()}
          </span>

          {isRenaming ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setIsRenaming(false);
              }}
              autoFocus
              className="h-6 flex-1 min-w-[60px] rounded bg-studio-panel-raised border border-brand px-1.5 text-xs font-medium text-studio-fg focus:outline-none focus:ring-1 focus:ring-brand z-10"
            />
          ) : !isCompact ? (
            <span
              className="text-xs font-semibold text-studio-fg truncate min-w-0 ml-0.5"
              title={track.name}
            >
              {track.name}
            </span>
          ) : null}
        </div>

        {/* Right: Lock, Hide, Mute, Menu Actions */}
        {!isRenaming && (
          <div className="flex items-center gap-0.5 shrink-0">
            <IconButton
              label={track.locked ? "Unlock track" : "Lock track"}
              size="sm"
              variant="ghost"
              onClick={handleToggleLock}
              className="h-6 w-6 p-0 rounded text-studio-muted hover:text-studio-fg"
            >
              {track.locked ? (
                <Lock className="h-3 w-3 text-selection" />
              ) : (
                <Unlock className="h-3 w-3 text-studio-muted" />
              )}
            </IconButton>

            {track.type !== "audio" && (
              <IconButton
                label={track.hidden ? "Show track" : "Hide track"}
                size="sm"
                variant="ghost"
                onClick={handleToggleHide}
                className="h-6 w-6 p-0 rounded text-studio-muted hover:text-studio-fg"
              >
                {track.hidden ? (
                  <EyeOff className="h-3 w-3 text-destructive" />
                ) : (
                  <Eye className="h-3 w-3 text-studio-muted" />
                )}
              </IconButton>
            )}

            {(track.type === "audio" || track.type === "video") && (
              <IconButton
                label={track.muted ? "Unmute track" : "Mute track"}
                size="sm"
                variant="ghost"
                onClick={handleToggleMute}
                className="h-6 w-6 p-0 rounded text-studio-muted hover:text-studio-fg"
              >
                {track.muted ? (
                  <VolumeX className="h-3 w-3 text-destructive" />
                ) : (
                  <Volume2 className="h-3 w-3 text-studio-muted" />
                )}
              </IconButton>
            )}

            <DropdownMenu
              trigger={
                <IconButton
                  label="Track options"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 rounded text-studio-muted hover:text-studio-fg"
                >
                  <MoreVertical className="h-3 w-3" />
                </IconButton>
              }
              align="right"
            >
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Edit2 className="h-3.5 w-3.5" /> Rename Track
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleLock}>
                {track.locked ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" /> Unlock Track
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-selection" /> Lock Track
                  </>
                )}
              </DropdownMenuItem>
              {track.type !== "audio" && (
                <DropdownMenuItem onClick={handleToggleHide}>
                  {track.hidden ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Show Track
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-destructive" /> Hide Track
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {(track.type === "audio" || track.type === "video") && (
                <DropdownMenuItem onClick={handleToggleMute}>
                  {track.muted ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5" /> Unmute Track
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-destructive" /> Mute Track
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem destructive onClick={handleDeleteTrack}>
                <Trash2 className="h-3.5 w-3.5" /> Delete Track
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        )}
      </div>

      {contextMenuPos && (
        <TrackHeaderContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          trackId={track.id}
          trackType={track.type}
          isMuted={track.muted || false}
          isLocked={track.locked || false}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </>
  );
}
