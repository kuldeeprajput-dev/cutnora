"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const initialThumbUrl = asset.remoteUrl ?? asset.remotePreviewUrl ?? null;
  const [thumbUrl, setThumbUrl] = useState<string | null>(initialThumbUrl);
  const [isThumbLoaded, setIsThumbLoaded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(asset.name);
  const assetRef = useRef(asset);
  const thumbUrlRef = useRef<string | null>(initialThumbUrl);
  const {
    id: assetId,
    blobId,
    duration,
    remotePreviewUrl,
    remoteUrl,
    source,
    thumbnailBlobId,
    type: assetType,
  } = asset;
  const sourceKind = source?.kind;
  const sourcePath = source?.kind === "opfs" ? source.path : undefined;

  useEffect(() => {
    assetRef.current = asset;
  }, [asset]);

  useEffect(() => {
    let isMounted = true;

    const updateThumbUrl = (nextUrl: string | null) => {
      if (!isMounted || thumbUrlRef.current === nextUrl) return;
      thumbUrlRef.current = nextUrl;
      setIsThumbLoaded(false);
      setThumbUrl(nextUrl);
    };

    async function loadThumb() {
      if (remoteUrl || remotePreviewUrl) {
        updateThumbUrl(remoteUrl ?? remotePreviewUrl ?? null);
        return;
      }

      if (!thumbnailBlobId) {
        updateThumbUrl(null);
        return;
      }

      let thumbnailBlob: Blob | null = null;
      try {
        thumbnailBlob = await ensureHighQualityThumbnail(assetRef.current);
      } catch {
        const existing = await db.thumbnails.get(thumbnailBlobId);
        thumbnailBlob = existing?.blob ?? null;
      }

      if (thumbnailBlob && isMounted) {
        const url = objectUrlManager.createUrl(thumbnailBlobId, thumbnailBlob);
        updateThumbUrl(url);
      }
    }

    void loadThumb();

    return () => {
      isMounted = false;
    };
  }, [
    assetId,
    assetType,
    blobId,
    duration,
    remotePreviewUrl,
    remoteUrl,
    sourceKind,
    sourcePath,
    thumbnailBlobId,
  ]);

  const handleAddToTimeline = () => {
    addMediaAssetToTimeline(asset);
  };

  const handleDeleteAsset = async () => {
    const currentProject = useProjectStore.getState().currentProject;
    const clipsUsingAsset =
      currentProject?.tracks
        .flatMap((track) => track.clips)
        .filter((clip) => clip.assetId === asset.id) ?? [];

    const removedClipIds = new Set(clipsUsingAsset.map((clip) => clip.id));
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

  const MediaTypeIcon =
    asset.type === "image" ? ImageIcon : asset.type === "video" ? FileVideo : Music;
  const mediaTypeLabel =
    asset.type === "image" ? "Image" : asset.type === "video" ? "Video" : "Audio";

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onPreview?.(asset)}
        onDoubleClick={handleAddToTimeline}
        className="group flex items-center justify-between rounded-lg border border-studio-border bg-studio-panel-raised/50 p-2 transition-all duration-200 hover:border-studio-border-strong hover:bg-studio-hover hover:-translate-y-0.5 select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_58px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-14 shrink-0 rounded bg-black/10 dark:bg-black/40 border border-studio-border overflow-hidden flex items-center justify-center">
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
              <MediaTypeIcon className="h-6 w-6 text-studio-muted" aria-hidden="true" />
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
                className="h-6 rounded bg-studio-panel-raised border border-studio-border-strong px-1.5 text-xs text-studio-fg focus:outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-studio-fg group-hover:text-studio-fg transition-colors truncate">
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
          className="flex items-center gap-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleAddToTimeline}
            title="Add to timeline"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-studio-fg text-studio-bg hover:opacity-90 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
          <DropdownMenu
            trigger={
              <button
                type="button"
                aria-label="Asset options"
                className="flex h-7 w-7 items-center justify-center rounded-md text-studio-muted hover:text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            }
            align="right"
          >
            <DropdownMenuItem onClick={() => onPreview?.(asset)}>
              <Eye className="h-3.5 w-3.5" /> Preview media
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToTimeline}>
              <Plus className="h-3.5 w-3.5" /> Add to timeline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Edit2 className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem destructive onClick={handleDeleteAsset}>
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
      className="group relative flex flex-col rounded-xl border border-studio-border bg-studio-panel-raised/40 p-1.5 transition-all duration-300 hover:border-studio-border-strong hover:bg-studio-hover hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_170px]"
    >
      {/* Thumbnail View Stage */}
      <div className="relative aspect-video w-full rounded-lg bg-black/10 dark:bg-black/40 border border-studio-border overflow-hidden flex items-center justify-center">
        {thumbUrl && !isThumbLoaded && (
          <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-studio-hover via-studio-panel-raised to-transparent" />
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
            className={`h-full w-full transition-[opacity,transform] duration-500 ease-out group-hover:scale-105 ${asset.type === "image" ? "object-contain p-2" : "object-cover"} ${isThumbLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <MediaTypeIcon className="h-6 w-6 text-studio-muted" aria-hidden="true" />
        )}

        {/* Hover Quick Action Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 transition-all duration-200 group-hover:opacity-100 flex flex-col justify-between p-1.5 pointer-events-none"
        >
          {/* Top-Right Add to Timeline Button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleAddToTimeline();
            }}
            title="Add to timeline"
            className="self-end pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-all duration-150 shadow-lg shadow-black/50 cursor-pointer hover:scale-110 active:scale-95 translate-y-1 group-hover:translate-y-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Asset Info Footer */}
      <div className="mt-1.5 flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-studio-muted" title={mediaTypeLabel}>
              <MediaTypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{mediaTypeLabel}</span>
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
                aria-label="Rename media file"
                className="h-5 min-w-0 w-full rounded bg-studio-panel-raised border border-studio-border-strong px-1 text-[11px] text-studio-fg focus:outline-none"
              />
            ) : (
              <p title={asset.name} className="min-w-0 text-[11px] sm:text-xs font-semibold text-studio-fg group-hover:text-studio-fg transition-colors truncate">
                {asset.name}
              </p>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] leading-relaxed font-mono text-studio-muted">
            {asset.width && asset.height ? (
              <>
                <span>{asset.width}×{asset.height}</span>
                <span aria-hidden="true">•</span>
              </>
            ) : null}
            {asset.type !== "image" && (
              <>
                <span aria-label={`Duration ${formatDuration(asset.duration)}`}>{formatDuration(asset.duration)}</span>
                <span aria-hidden="true">•</span>
              </>
            )}
            <span>{formatSize(asset.size)}</span>
          </div>
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
                className="p-1 rounded-md text-studio-muted group-hover:text-studio-fg hover:!text-studio-fg hover:bg-studio-hover transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
              </button>
            }
            align="right"
          >
            <DropdownMenuItem onClick={() => onPreview?.(asset)}>
              <Eye className="h-3.5 w-3.5" /> Preview media
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToTimeline}>
              <Plus className="h-3.5 w-3.5" /> Add to timeline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Edit2 className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem destructive onClick={handleDeleteAsset}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
