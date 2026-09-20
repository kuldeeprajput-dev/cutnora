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
import { confirm } from "@/shared/components/ui/Popup";
import {
  FileVideo,
  Film,
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

    const ok = await confirm({
      title: "Delete Media Asset",
      message:
        clipsUsingAsset.length > 0
          ? `Are you sure you want to delete "${asset.name}"? This asset is currently used in ${clipsUsingAsset.length} clip(s) on the timeline and will be removed.`
          : `Are you sure you want to delete "${asset.name}" from your project media library?`,
      confirmText: "Delete Asset",
      variant: "destructive",
    });
    if (!ok) return;

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

  const renderIcon = () => {
    switch (asset.type) {
      case "video":
        return <FileVideo className="h-6 w-6 text-white/50" />;
      case "image":
        return <ImageIcon className="h-6 w-6 text-white/50" />;
      case "audio":
        return <Music className="h-6 w-6 text-white/50" />;
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onPreview?.(asset)}
        onDoubleClick={handleAddToTimeline}
        className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] p-2 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.045] hover:-translate-y-0.5 select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_58px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-14 shrink-0 rounded bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
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
                className="h-6 rounded bg-white/[0.06] border border-white/30 px-1.5 text-xs text-white focus:outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                {asset.name}
              </p>
            )}
            <p className="text-[10px] text-white/40 font-mono mt-0.5">
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
            onClick={() => onPreview?.(asset)}
            title="Preview media"
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleAddToTimeline}
            title="Add to timeline"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black hover:bg-neutral-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
          <DropdownMenu
            trigger={
              <button
                type="button"
                aria-label="Asset options"
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
      className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.025] p-1.5 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-[0.99] select-none cursor-pointer lg:[content-visibility:auto] lg:[contain-intrinsic-size:0_170px]"
    >
      {/* Thumbnail View Stage */}
      <div className="relative aspect-video w-full rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
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
            className={`h-full w-full transition-[opacity,transform] duration-500 ease-out group-hover:scale-105 ${asset.type === "image" ? "object-contain p-2" : "object-cover"} ${isThumbLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          renderIcon()
        )}

        {/* Media Type / Duration Badge */}
        <span className="absolute bottom-1.5 right-1.5 z-10 inline-flex items-center justify-center gap-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 px-2 py-0.5 text-[9px] font-medium leading-none text-white/90 shadow-sm transition-all duration-200 select-none">
          {asset.type === "image" ? (
            <>
              <ImageIcon className="h-2.5 w-2.5 text-white/70 shrink-0 -translate-y-px" />
              <span className="tracking-wide leading-none">Image</span>
            </>
          ) : (
            <>
              <Film className="h-2.5 w-2.5 text-white/70 shrink-0 -translate-y-px" />
              <span className="font-mono tracking-tight leading-none">{formatDuration(asset.duration)}</span>
            </>
          )}
        </span>

        {/* Hover Quick Action Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 transition-all duration-200 group-hover:opacity-100 flex flex-col justify-between p-1.5 pointer-events-none"
        >
          {/* Top-Right Frosted Glass Floating Capsule */}
          <div
            className="self-end pointer-events-auto flex items-center gap-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 p-0.5 shadow-xl shadow-black/50 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => onPreview?.(asset)}
              title="Preview media"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/75 hover:text-white hover:bg-white/20 transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            {/* Hairline Divider */}
            <div className="h-3 w-px bg-white/20 mx-0.5" />

            {/* Add to Timeline Button */}
            <button
              type="button"
              onClick={handleAddToTimeline}
              title="Add to timeline"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-all duration-150 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
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
              className="h-5 w-full rounded bg-white/[0.06] border border-white/30 px-1 text-[11px] text-white focus:outline-none"
            />
          ) : (
            <p className="text-[11px] sm:text-xs font-semibold text-white/90 group-hover:text-white transition-colors truncate">
              {asset.name}
            </p>
          )}
          <p className="text-[9px] font-mono text-white/40 mt-0.5">
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
                className="p-1 rounded-md text-white/40 group-hover:text-white/70 hover:!text-white hover:bg-white/10 transition-colors cursor-pointer"
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
