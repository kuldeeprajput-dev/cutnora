"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import { deleteStoredMediaAsset } from "@/modules/core/storage/media-asset-service";
import type { MediaAsset } from "@/modules/projects/types";
import { useProjectStore } from "@/modules/projects";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { ensureHighQualityThumbnail } from "../services/media-import-service";
import { addMediaAssetToTimeline } from "../utils/add-media-asset-to-timeline";
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
  Eye,
} from "lucide-react";

export interface AssetCardProps {
  asset: MediaAsset;
  viewMode?: "grid" | "list";
  onPreview?: (asset: MediaAsset) => void;
}

export function AssetCard({
  asset,
  viewMode = "grid",
  onPreview,
}: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(
    asset.remoteUrl ?? asset.remotePreviewUrl ?? null,
  );
  const [isThumbLoaded, setIsThumbLoaded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(asset.name);
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
        thumbnailBlob = await ensureHighQualityThumbnail(asset);
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
    asset,
    blobId,
    duration,
    remotePreviewUrl,
    remoteUrl,
    thumbnailBlobId,
  ]);

  const handleAddToTimeline = () => {
    addMediaAssetToTimeline(asset);
  };

  const handleDeleteAsset = async () => {
    const currentProject = useProjectStore.getState().currentProject;
    const removedClipIds = new Set(
      currentProject?.tracks
        .flatMap((track) => track.clips)
        .filter((clip) => clip.assetId === asset.id)
        .map((clip) => clip.id) ?? [],
    );
    await deleteStoredMediaAsset(asset);
    useProjectStore.getState().removeAsset(asset.id);
    const editorState = useEditorUIStore.getState();
    editorState.setSelectedClipIds(
      editorState.selectedClipIds.filter((id) => !removedClipIds.has(id)),
    );
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
        onClick={() => onPreview?.(asset)}
        onDoubleClick={handleAddToTimeline}
        className="group flex items-center justify-between rounded-lg border border-studio-border bg-studio-panel p-2 transition-colors hover:border-brand select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_58px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-14 shrink-0 rounded bg-studio-bg border border-studio-border overflow-hidden flex items-center justify-center">
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt={asset.name}
                decoding="async"
                loading="lazy"
                draggable={false}
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
            label="Preview media"
            size="sm"
            variant="ghost"
            onClick={() => onPreview?.(asset)}
          >
            <Eye className="h-3.5 w-3.5" />
          </IconButton>
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
                onPreview?.(asset);
              }}
            >
              <Eye className="h-3.5 w-3.5" /> Preview media
            </DropdownMenuItem>
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
      onClick={() => onPreview?.(asset)}
      onDoubleClick={handleAddToTimeline}
      className="group relative flex flex-col rounded-xl border border-studio-border bg-studio-panel p-1.5 transition-[border-color,transform] hover:border-brand active:scale-[0.995] select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_170px]"
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
            loading="lazy"
            draggable={false}
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
        <div
          className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 lg:flex"
          onClick={(event) => event.stopPropagation()}
        >
          <IconButton
            label="Preview media"
            size="sm"
            variant="secondary"
            onClick={() => onPreview?.(asset)}
          >
            <Eye className="h-4 w-4" />
          </IconButton>
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
                onPreview?.(asset);
              }}
            >
              <Eye className="h-3.5 w-3.5" /> Preview media
            </DropdownMenuItem>
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
