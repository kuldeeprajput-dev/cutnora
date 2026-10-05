"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileAudio,
  FileImage,
  FileVideo2,
  HardDrive,
  ImageIcon,
  Loader2,
  Monitor,
  Music2,
  Plus,
} from "lucide-react";
import type { MediaAsset } from "@/modules/projects/types";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import { resolveMediaAssetUrl } from "@/modules/core/storage/media-source-service";
import { ensureHighQualityThumbnail } from "@/modules/editor/features/media-library/services/media-import-service";
import { Button } from "@/shared/components/ui/Button";
import { Dialog } from "@/shared/components/ui/Dialog";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/utils/cn";
import { ThemedImagePreview } from "./ThemedImagePreview";
import { ThemedVideoPlayer } from "./ThemedVideoPlayer";

interface MediaPreviewDialogProps {
  asset: MediaAsset | null;
  assets: MediaAsset[];
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  onAddToTimeline: (asset: MediaAsset) => void;
}

const FALLBACK_PEAKS = Array.from(
  { length: 56 },
  (_, i) => 0.18 + Math.abs(Math.sin(i * 0.43) * Math.cos(i * 0.17)) * 0.72
);

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
}

function formatMediaFormat(asset: MediaAsset) {
  const ext = asset.name.split(".").pop();
  return ext && ext !== asset.name ? ext.toUpperCase() : asset.type.toUpperCase();
}

function AudioArtwork({ asset }: { asset: MediaAsset }) {
  const peaks = asset.waveformPeaks?.length ? asset.waveformPeaks.slice(0, 56) : FALLBACK_PEAKS;
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised text-studio-fg">
      <div className="absolute inset-x-5 top-1/2 flex h-24 -translate-y-1/2 items-center justify-center gap-[3px] opacity-25">
        {peaks.map((p, i) => (
          <span key={i} className="w-0.5 min-h-1 rounded-full bg-studio-fg" style={{ height: `${Math.max(8, p * 88)}%` }} />
        ))}
      </div>
      <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-studio-border-strong bg-studio-hover shadow-lg sm:h-24 sm:w-24">
        <Music2 className="h-10 w-10 sm:h-12 sm:w-12 text-studio-fg" strokeWidth={1.75} />
      </div>
    </div>
  );
}

export function MediaPreviewDialog({
  asset,
  assets,
  onClose,
  onSelect,
  onAddToTimeline,
}: MediaPreviewDialogProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | undefined>();
  const [loadError, setLoadError] = useState("");
  const [isPreviewFullscreen, setPreviewFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const currentIndex = asset ? assets.findIndex((item) => item.id === asset.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < assets.length - 1;

  useEffect(() => setPreviewFullscreen(false), [asset?.id]);

  useEffect(() => {
    if (!isPreviewFullscreen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    previewRef.current?.querySelector<HTMLButtonElement>("[data-preview-back]")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setPreviewFullscreen(false);
      } else if (event.key === "Tab") {
        event.stopPropagation();
        const focusables = Array.from(previewRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
        ) ?? []).filter((element) => element.getClientRects().length > 0);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const handleResize = () => { if (!mobileQuery.matches) setPreviewFullscreen(false); };
    window.addEventListener("keydown", handleKeyDown, true);
    mobileQuery.addEventListener("change", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      mobileQuery.removeEventListener("change", handleResize);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isPreviewFullscreen]);

  useEffect(() => {
    let active = true;
    setSourceUrl(null);
    setLoadError("");
    if (!asset || asset.type === "audio") return;

    void resolveMediaAssetUrl(asset)
      .then((url) => { if (active) setSourceUrl(url); })
      .catch((err: unknown) => {
        if (active) setLoadError(err instanceof Error ? err.message : "Preview unavailable");
      });

    return () => { active = false; };
  }, [asset]);

  useEffect(() => {
    let active = true;
    setPosterUrl(undefined);
    if (!asset || asset.type !== "video") return;
    if (asset.remotePreviewUrl) { setPosterUrl(asset.remotePreviewUrl); return; }
    if (!asset.thumbnailBlobId) return;

    void ensureHighQualityThumbnail(asset).then((blob) => {
      if (active && blob && asset.thumbnailBlobId) {
        setPosterUrl(objectUrlManager.createUrl(asset.thumbnailBlobId, blob));
      }
    }).catch(() => {});

    return () => { active = false; };
  }, [asset]);

  useEffect(() => {
    if (!asset) return;
    const handleKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.defaultPrevented || target?.closest('[data-media-player], button, input, textarea, select, [role="menu"]')) return;
      if (e.key === "ArrowLeft" && hasPrevious) { e.preventDefault(); onSelect(assets[currentIndex - 1]); }
      if (e.key === "ArrowRight" && hasNext) { e.preventDefault(); onSelect(assets[currentIndex + 1]); }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [asset, assets, currentIndex, hasNext, hasPrevious, onSelect]);

  const metadata = useMemo(() => {
    if (!asset) return [];
    const items = [
      {
        icon: asset.type === "video" ? FileVideo2 : asset.type === "image" ? FileImage : FileAudio,
        label: "Format",
        value: formatMediaFormat(asset),
      },
    ];
    if (asset.width && asset.height) items.push({ icon: Monitor, label: "Dimensions", value: `${asset.width} x ${asset.height} px` });
    if (asset.type !== "image" && asset.duration) items.push({ icon: Clock3, label: "Duration", value: formatDuration(asset.duration) });
    if (asset.size) items.push({ icon: HardDrive, label: "File size", value: formatSize(asset.size) });
    return items;
  }, [asset]);

  if (!asset) return null;

  const TypeIcon = asset.type === "video" ? FileVideo2 : asset.type === "image" ? ImageIcon : FileAudio;

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title="Media preview"
      description="Review source media before adding to timeline."
      mobileBottomSheet
      className={cn(
        "max-w-[920px] overflow-y-auto border-studio-border bg-studio-panel p-3 sm:p-5",
        isPreviewFullscreen && "fixed inset-0 h-dvh max-h-none max-w-none overflow-hidden rounded-none border-0 bg-black p-0 sm:max-h-none sm:rounded-none sm:border-0 sm:p-0 [&>div:first-child]:hidden [&>div:last-child]:h-full",
      )}
    >
      <div className={cn("grid min-h-0 overflow-hidden rounded-xl border border-studio-border bg-studio-panel-raised/40 lg:grid-cols-[minmax(0,1fr)_250px]", isPreviewFullscreen && "h-full rounded-none border-0 lg:grid-cols-1")}>
        <section className={cn("min-w-0", isPreviewFullscreen && "h-full")}>
          <div ref={previewRef} className={cn("flex min-h-[210px] items-center justify-center p-2.5 sm:min-h-[300px] sm:p-4", isPreviewFullscreen && "relative h-full min-h-0 p-0 sm:min-h-0 sm:p-0")}>
            {isPreviewFullscreen && (
              <div className="absolute inset-x-0 top-[env(safe-area-inset-top)] z-30 flex items-center gap-2 py-2 pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] text-white">
                <button
                  type="button"
                  data-preview-back
                  aria-label="Back to media details"
                  onClick={() => setPreviewFullscreen(false)}
                  className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-black/60 active:bg-white/15"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <span className="min-w-0 truncate text-xs font-medium drop-shadow-md">{asset.name}</span>
              </div>
            )}
            {asset.type !== "audio" && !sourceUrl && !loadError && (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-studio-muted" aria-label="Loading preview" />
              </div>
            )}
            {loadError && (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-black/40 px-6 text-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm font-semibold text-studio-fg">Preview unavailable</p>
                <p className="max-w-sm text-xs text-studio-muted">{loadError}</p>
              </div>
            )}
            {sourceUrl && asset.type === "video" && <ThemedVideoPlayer src={sourceUrl} poster={posterUrl} label={asset.name} previewFullscreen={isPreviewFullscreen} onTogglePreviewFullscreen={() => setPreviewFullscreen((current) => !current)} />}
            {sourceUrl && asset.type === "image" && (
              <ThemedImagePreview src={sourceUrl} alt={asset.name} previewFullscreen={isPreviewFullscreen} onTogglePreviewFullscreen={() => setPreviewFullscreen((current) => !current)} />
            )}
            {asset.type === "audio" && <AudioArtwork asset={asset} />}
          </div>

          <nav aria-label="Media preview navigation" className={cn("flex items-center justify-between border-t border-studio-border bg-studio-panel-raised/60 px-2 py-2 sm:px-3", isPreviewFullscreen && "hidden")}>
            <Button size="sm" variant="ghost" disabled={!hasPrevious} onClick={() => onSelect(assets[currentIndex - 1])} aria-label="Previous media" className="text-studio-muted hover:text-studio-fg hover:bg-studio-hover">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <span className="font-mono text-[10px] tabular-nums text-studio-muted">{currentIndex + 1} / {assets.length}</span>
            <Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => onSelect(assets[currentIndex + 1])} aria-label="Next media" className="text-studio-muted hover:text-studio-fg hover:bg-studio-hover">
              Next
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </nav>
        </section>

        <aside className={cn("flex min-w-0 flex-col border-t border-studio-border bg-studio-panel-raised/60 p-4 lg:border-l lg:border-t-0", isPreviewFullscreen && "hidden")}>
          <div className="min-w-0">
            <Tooltip content={asset.name} position="bottom" className="max-w-72 whitespace-normal text-left">
              <p className="line-clamp-2 min-w-0 cursor-default text-sm font-semibold leading-5 text-studio-fg">{asset.name}</p>
            </Tooltip>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-studio-muted">
              <TypeIcon className="h-3.5 w-3.5" />
              {asset.type}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1">
              {metadata.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-studio-border bg-studio-panel text-studio-muted">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-studio-muted">{label}</p>
                    <p className="truncate font-mono text-[11px] text-studio-fg">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sticky bottom-0 z-10 -mx-4 mt-5 border-t border-studio-border bg-studio-panel-raised/60 px-4 pt-3 lg:static lg:mx-0 lg:mt-auto lg:border-0 lg:px-0 lg:pt-8">
            <Button
              size="md"
              onClick={() => onAddToTimeline(asset)}
              className="w-full gap-2 border-none bg-studio-fg text-studio-bg font-semibold shadow-sm transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add to Timeline
            </Button>
          </div>
        </aside>
      </div>
    </Dialog>
  );
}
