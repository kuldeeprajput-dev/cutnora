"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/modules/core/db/database";
import { useProjectStore } from "@/modules/projects";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { useMediaImporter } from "../hooks/useMediaImporter";
import { MediaDropzone } from "./MediaDropzone";
import { AssetCard } from "./AssetCard";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { addMediaAssetToTimeline } from "../utils/add-media-asset-to-timeline";
import { Input } from "@/shared/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/shared/components/ui/DropdownMenu";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import {
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
  Plus,
  UploadCloud,
  ChevronDown,
  Check,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { MediaAsset } from "@/modules/projects/types";

export type FilterCategory = "all" | "video" | "image" | "audio";
export type SortOption = "newest" | "name" | "duration";

export function MediaLibraryPanel() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const activeTool = useEditorUIStore((state) => state.activeTool);
  const {
    isImporting,
    importProgress,
    importStatus,
    importErrors,
    importFiles,
    cancelImport,
    clearErrors,
  } = useMediaImporter();

  const [filter, setFilter] = useState<FilterCategory>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const deferredSearch = useDeferredValue(search);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preselect filter when opened via rail tool icons (Videos, Images, Audio)
  useEffect(() => {
    if (activeTool === "videos") setFilter("video");
    else if (activeTool === "images") setFilter("image");
    else if (activeTool === "audio") setFilter("audio");
    else if (activeTool === "media") setFilter("all");
  }, [activeTool]);

  // Dexie live query for project assets
  const rawAssets = useLiveQuery(
    async () => {
      if (!currentProject) return [];
      return db.assets.where("projectId").equals(currentProject.id).toArray();
    },
    [currentProject?.id],
    [],
  );

  const hasAssets = (rawAssets || []).length > 0;

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasAssets) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importFiles(e.dataTransfer.files);
    }
  };

  const filteredAssets = useMemo(() => {
    let list: MediaAsset[] = [...(rawAssets || [])];

    // Filter by type
    if (filter !== "all") {
      list = list.filter((a) => a.type === filter);
    }

    // Search query
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }

    // Sorting
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "duration") return (b.duration || 0) - (a.duration || 0);
      return b.createdAt - a.createdAt; // newest
    });

    return list;
  }, [deferredSearch, filter, rawAssets, sort]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-busy={isImporting}
      className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden overscroll-contain p-2 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:overflow-hidden lg:overscroll-auto lg:p-3"
    >
      {/* Hidden File Input for triggering file picker anywhere */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            importFiles(e.target.files);
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      {/* Drag & Drop Overlay when assets exist */}
      {isDragOver && hasAssets && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1A1A]/95 backdrop-blur-sm border-2 border-dashed border-white/60 rounded-2xl p-4 text-center">
          <UploadCloud className="h-10 w-10 text-white animate-bounce mb-2" />
          <p className="text-xs font-bold text-white">
            Drop media files to import
          </p>
          <p className="text-[11px] text-white/60 mt-1">
            Supports Videos, Images, and Audio
          </p>
        </div>
      )}

      {/* When NO assets exist: ONLY SHOW DRAG AND DROP */}
      {!hasAssets ? (
        <div className="flex h-full w-full flex-1 flex-col min-h-0 gap-3">
          {/* Progress Bar during active imports */}
          {isImporting && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1.5">
                <span className="flex min-w-0 items-center gap-1.5 text-white">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" /> Processing
                  <span className="truncate text-white/80">
                    {importStatus?.fileName || "media assets..."}
                  </span>
                </span>
                <div className="ml-2 flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[11px] text-white/50">
                    {importStatus?.phase || "validating"} · {importProgress}%
                  </span>
                  <button
                    type="button"
                    onClick={cancelImport}
                    className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <ProgressBar value={importProgress} />
              {importStatus?.phase === "copying" && (
                <p className="mt-1 text-right font-mono text-[10px] text-white/50">
                  {(importStatus.bytesProcessed / 1024 ** 2).toFixed(1)} MB /{" "}
                  {(importStatus.totalBytes / 1024 ** 2).toFixed(1)} MB
                </p>
              )}
            </div>
          )}

          {/* Import Error Alerts */}
          {importErrors.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Import Issues
                </span>
                <button
                  type="button"
                  onClick={clearErrors}
                  className="text-[10px] underline hover:opacity-80 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {importErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Full-height Dropzone */}
          <MediaDropzone
            onFilesSelected={importFiles}
            isImporting={isImporting}
          />
        </div>
      ) : (
        <>
          {/* FIXED TOP CONTROLS & HEADER SECTION (NON-SCROLLING) */}
          <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 border-b border-studio-border/50 pb-2 lg:pb-3">
            {/* Progress Bar during active imports */}
            {isImporting && (
              <div className="rounded-xl border border-studio-border bg-studio-panel p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-studio-fg mb-1.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-brand">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing
                    <span className="truncate">
                      {importStatus?.fileName || "media assets..."}
                    </span>
                  </span>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[11px] text-studio-muted">
                      {importStatus?.phase || "validating"} · {importProgress}%
                    </span>
                    <button
                      type="button"
                      onClick={cancelImport}
                      className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <ProgressBar value={importProgress} />
                {importStatus?.phase === "copying" && (
                  <p className="mt-1 text-right font-mono text-[10px] text-studio-muted">
                    {(importStatus.bytesProcessed / 1024 ** 2).toFixed(1)} MB /{" "}
                    {(importStatus.totalBytes / 1024 ** 2).toFixed(1)} MB
                  </p>
                )}
              </div>
            )}

            {/* Import Error Alerts */}
            {importErrors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Import Issues
                  </span>
                  <button
                    type="button"
                    onClick={clearErrors}
                    className="text-[10px] underline hover:opacity-80 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Row 1: Search + Import */}
            <div className="flex w-full min-w-0 items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search media by filename</span>
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <Input
                  type="search"
                  placeholder="Search…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-8 min-w-0 pl-8 pr-8 text-xs bg-white/[0.04] border-white/10 placeholder:text-white/25 text-white focus:border-white/25 focus:bg-white/[0.06]"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear media search"
                    className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-white/30 transition-colors hover:text-white/70 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </label>
              <button
                type="button"
                onClick={triggerUpload}
                disabled={isImporting}
                className="h-8 px-3 shrink-0 flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-white/15 text-white/70 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white hover:border-white/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Import</span>
              </button>
            </div>

            {/* Row 2: Category Filter Tabs */}
            <div className="flex w-full items-center gap-1 overflow-x-auto py-0.5 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {(["all", "video", "image", "audio"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                  className={cn(
                    "flex-1 min-w-max rounded-md px-2.5 py-1.5 text-center text-[11px] font-semibold capitalize transition-all duration-200 cursor-pointer active:scale-[0.97]",
                    filter === cat
                      ? "bg-white/10 text-white"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Row 3: Sort + View Mode */}
            <div className="flex items-center justify-between gap-2 w-full pt-1.5 border-t border-white/[0.06]">
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors duration-200 select-none cursor-pointer"
                  >
                    <span>
                      {sort === "newest"
                        ? "Newest first"
                        : sort === "name"
                          ? "By name"
                          : "By duration"}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                }
              >
                <DropdownMenuItem
                  onClick={() => setSort("newest")}
                  className={cn(
                    "flex items-center justify-between text-[11px]",
                    sort === "newest" && "text-white font-semibold",
                  )}
                >
                  <span>Newest first</span>
                  {sort === "newest" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSort("name")}
                  className={cn(
                    "flex items-center justify-between text-[11px]",
                    sort === "name" && "text-white font-semibold",
                  )}
                >
                  <span>By name</span>
                  {sort === "name" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSort("duration")}
                  className={cn(
                    "flex items-center justify-between text-[11px]",
                    sort === "duration" && "text-white font-semibold",
                  )}
                >
                  <span>By duration</span>
                  {sort === "duration" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              </DropdownMenu>

              <div className="flex items-center rounded-md bg-white/[0.04] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded transition-all duration-200 cursor-pointer",
                    viewMode === "grid" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"
                  )}
                >
                  <LayoutGrid className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="List View"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded transition-all duration-200 cursor-pointer",
                    viewMode === "list" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"
                  )}
                >
                  <List className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE MEDIA ASSETS SECTION (ONLY THIS SCROLLS!) */}
          <div className="shrink-0 overflow-visible pt-2 pb-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:pt-3 lg:pr-2 lg:pb-0 studio-scrollbar">
            {filteredAssets.length === 0 ? (
              <div className="flex min-h-36 flex-col items-center justify-center px-4 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-studio-border bg-studio-panel-raised text-studio-muted">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-studio-fg">
                  No matching media
                </p>
                <p className="mt-1 max-w-48 text-[10px] leading-4 text-studio-muted">
                  Try another filename or clear the active media filter.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-2 max-[300px]:grid-cols-1 min-[560px]:grid-cols-3 lg:grid-cols-2"
                    : "flex flex-col gap-2"
                }
              >
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    viewMode={viewMode}
                    onPreview={setPreviewAsset}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <MediaPreviewDialog
        asset={previewAsset}
        assets={filteredAssets}
        onClose={() => setPreviewAsset(null)}
        onSelect={setPreviewAsset}
        onAddToTimeline={(asset) => {
          addMediaAssetToTimeline(asset);
          setPreviewAsset(null);
        }}
      />
    </div>
  );
}
