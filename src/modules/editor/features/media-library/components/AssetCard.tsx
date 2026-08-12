"use client";

import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { MediaAsset } from "@/modules/projects/types";
import { useProjectStore } from "@/modules/projects";
import type { TimelineClip, Track } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { ensureHighQualityThumbnail } from "../services/media-import-service";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/shared/components/ui/DropdownMenu";
import { IconButton } from "@/shared/components/ui/IconButton";
import {
  FileVideo,
  Image as ImageIcon,
  Music,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";

export interface AssetCardProps {
  asset: MediaAsset;
  viewMode?: "grid" | "list";
}

export function AssetCard({ asset, viewMode = "grid" }: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(
    asset.remoteUrl ?? asset.remotePreviewUrl ?? null,
  );
  const [isThumbLoaded, setIsThumbLoaded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(asset.name);
  const { currentProject, addClip, addTrack } = useProjectStore();
  const {
    blobId,
    duration,
    remotePreviewUrl,
    remoteUrl,
    thumbnailBlobId,
    type: assetType,
  } = asset;

  useEffect(() => {
    let isMounted = true;
    setIsThumbLoaded(false);

    async function loadThumb() {
      if (remoteUrl || remotePreviewUrl) {
        if (isMounted) {
          setThumbUrl(remoteUrl ?? remotePreviewUrl ?? null);
        }
        return;
      }

      if (!thumbnailBlobId) {
        if (isMounted) setThumbUrl(null);
        return;
      }

      let thumbnailBlob: Blob | null = null;
      try {
        thumbnailBlob = await ensureHighQualityThumbnail({
          type: assetType,
          thumbnailBlobId,
          blobId,
          remoteUrl,
          duration,
        });
      } catch {
        const existing = await db.thumbnails.get(thumbnailBlobId);
        thumbnailBlob = existing?.blob ?? null;
      }

      if (thumbnailBlob && isMounted) {
        const url = objectUrlManager.createUrl(thumbnailBlobId, thumbnailBlob);
        setThumbUrl(url);
      }
    }

    void loadThumb();

    return () => {
      isMounted = false;
    };
  }, [
    assetType,
    blobId,
    duration,
    remotePreviewUrl,
    remoteUrl,
    thumbnailBlobId,
  ]);

  const handleAddToTimeline = () => {
    if (!currentProject) return;

    // Find or create appropriate track type
    const requiredTrackType: Track["type"] =
      asset.type === "audio" ? "audio" : "video";
    let targetTrack = currentProject.tracks.find(
      (t) => t.type === requiredTrackType,
    );

    if (!targetTrack) {
      addTrack(
        requiredTrackType,
        `${requiredTrackType.charAt(0).toUpperCase() + requiredTrackType.slice(1)} Track`,
      );
      const updatedTracks =
        useProjectStore.getState().currentProject?.tracks || [];
      targetTrack = updatedTracks.find((t) => t.type === requiredTrackType);
    }

    if (!targetTrack) return;

    // Determine initial timeline start time (after last clip on track)
    let start = 0;
    if (targetTrack.clips.length > 0) {
      const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
      start = lastClip.timelineStart + lastClip.timelineDuration;
    }

    const duration = asset.type === "image" ? 5 : asset.duration;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    const newClip: TimelineClip = {
      id: nanoid(),
      trackId: targetTrack.id,
      assetId: asset.id,
      type:
        asset.type === "image" ? "image" : (asset.type as TimelineClip["type"]),
      timelineStart: Math.max(0, start),
      timelineDuration: Math.max(0.1, duration),
      sourceStart: 0,
      sourceDuration: Math.max(0.1, duration),
      name: asset.name,
      transform: {
        x: 0,
        y: 0,
        width: isMobile ? currentProject.settings.width : asset.width || 1920,
        height: isMobile
          ? currentProject.settings.height
          : asset.height || 1080,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fitMode: "contain",
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    };

    addClip(targetTrack.id, newClip);
    if (isMobile) {
      useEditorUIStore.getState().setSelectedClipIds([newClip.id]);
    }
  };

  const handleDeleteAsset = async () => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (!isMobile) {
      const isUsedInTimeline = currentProject?.tracks.some((t) =>
        t.clips.some((c) => c.assetId === asset.id),
      );

      const promptMessage = isUsedInTimeline
        ? `Warning: Asset "${asset.name}" is currently used by clips in your timeline. Deleting it will also remove those clips from the timeline. Are you sure you want to delete it?`
        : `Delete asset "${asset.name}"?`;

      if (!confirm(promptMessage)) {
        return;
      }
    }

    await db.transaction("rw", db.assets, db.blobs, db.thumbnails, async () => {
      await db.assets.delete(asset.id);
      if (asset.blobId) await db.blobs.delete(asset.blobId);
      if (asset.thumbnailBlobId) {
        await db.thumbnails.delete(asset.thumbnailBlobId);
      }
    });
    if (asset.blobId) objectUrlManager.revokeUrl(asset.blobId);
    if (asset.thumbnailBlobId) {
      objectUrlManager.revokeUrl(asset.thumbnailBlobId);
    }
    useProjectStore.getState().removeAsset(asset.id);
  };

  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (nameInput.trim() && nameInput !== asset.name) {
      db.assets.update(asset.id, { name: nameInput.trim() });
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
              if (clip.assetId === asset.id) clip.name = nameInput.trim();
            });
          });
        }
      });
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderIcon = () => {
    switch (asset.type) {
      case "video":
        return <FileVideo className="h-6 w-6 text-brand" />;
      case "image":
        return <ImageIcon className="h-6 w-6 text-selection" />;
      case "audio":
        return <Music className="h-6 w-6 text-mkt-info" />;
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onDoubleClick={handleAddToTimeline}
        className="group flex items-center justify-between rounded-lg border border-studio-border bg-studio-panel p-2 hover:border-brand transition-colors select-none cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-14 shrink-0 rounded bg-studio-bg border border-studio-border overflow-hidden flex items-center justify-center">
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt={asset.name}
                decoding="async"
                onLoad={() => setIsThumbLoaded(true)}
                onError={() => setIsThumbLoaded(true)}
                className={`h-full w-full transition-opacity duration-200 ${asset.type === "image" ? "object-contain p-1" : "object-cover"} ${isThumbLoaded ? "opacity-100" : "opacity-0"}`}
              />
            ) : (
              renderIcon()
            )}
          </div>
          <div className="min-w-0">
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
                className="h-6 rounded bg-studio-bg border border-brand px-1.5 text-xs text-studio-fg focus:outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-studio-fg truncate">
                {asset.name}
              </p>
            )}
            <p className="text-[10px] text-studio-muted font-mono mt-0.5">
              {asset.type !== "image" && `${formatDuration(asset.duration)} • `}
              {formatSize(asset.size)}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            label="Add to timeline"
            size="sm"
            variant="ghost"
            onClick={handleAddToTimeline}
          >
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
          <DropdownMenu
            trigger={
              <button
                type="button"
                aria-label="Asset options"
                className="p-1 rounded-md text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised transition-colors cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            }
            align="right"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleAddToTimeline();
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add to timeline
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              destructive
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAsset();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          handleAddToTimeline();
        }
      }}
      onDoubleClick={handleAddToTimeline}
      className="group relative flex flex-col rounded-xl border border-studio-border bg-studio-panel p-1.5 transition-all hover:border-brand select-none cursor-pointer"
    >
      {/* Thumbnail View Stage */}
      <div className="relative aspect-video w-full rounded-lg bg-studio-bg border border-studio-border overflow-hidden flex items-center justify-center">
        {thumbUrl && !isThumbLoaded && (
          <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent" />
        )}
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={asset.name}
            decoding="async"
            onLoad={() => setIsThumbLoaded(true)}
            onError={() => setIsThumbLoaded(true)}
            className={`h-full w-full transition-[opacity,transform] duration-300 group-hover:scale-[1.01] ${asset.type === "image" ? "object-contain p-2" : "object-cover"} ${isThumbLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          renderIcon()
        )}

        {/* Duration / Tag Overlay */}
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 font-mono text-[9px] text-studio-fg">
          {asset.type === "image" ? "IMAGE" : formatDuration(asset.duration)}
        </span>

        {/* Hover Quick Add Overlay */}
        <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
          <IconButton
            label="Add to timeline"
            size="sm"
            variant="selection"
            onClick={handleAddToTimeline}
          >
            <Plus className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Asset Info Footer */}
      <div className="mt-1.5 flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0 flex-1 pr-1">
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
              className="h-5 w-full rounded bg-studio-bg border border-brand px-1 text-[11px] text-studio-fg focus:outline-none"
            />
          ) : (
            <p className="text-[11px] sm:text-xs font-semibold text-studio-fg truncate">
              {asset.name}
            </p>
          )}
          <p className="text-[9px] font-mono text-studio-muted mt-0.5">
            {asset.width && asset.height
              ? `${asset.width}×${asset.height} • `
              : ""}
            {formatSize(asset.size)}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu
            trigger={
              <button
                type="button"
                aria-label="Asset options"
                className="p-1 rounded-md text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
              </button>
            }
            align="right"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleAddToTimeline();
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add to timeline
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              destructive
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAsset();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
