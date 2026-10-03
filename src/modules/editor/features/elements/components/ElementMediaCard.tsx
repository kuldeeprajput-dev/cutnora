"use client";

import { memo, useState } from "react";
import { ImageOff, LoaderCircle, Plus } from "lucide-react";
import type { LibraryMedia } from "./elements-library";

interface ElementMediaCardProps {
  item: LibraryMedia;
  isAdding: boolean;
  isBusy: boolean;
  onAdd: (item: LibraryMedia) => void;
  compact?: boolean;
}

export const ElementMediaCard = memo(function ElementMediaCard({
  item,
  isAdding,
  isBusy,
  onAdd,
  compact = false,
}: ElementMediaCardProps) {
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const ratio = (item.width || 1) / (item.height || 1);
  const aspectRatio =
    item.kind === "gif"
      ? Math.min(1.8, Math.max(0.65, Number.isFinite(ratio) ? ratio : 1))
      : 1;

  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      disabled={isBusy}
      aria-label={`Add ${item.name} to timeline`}
      aria-busy={isAdding}
      title={`Add ${item.name}`}
      className="group block min-w-0 w-full overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised text-left transition-colors hover:border-studio-border-strong hover:bg-studio-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait"
    >
      <span
        className={`relative flex items-center justify-center overflow-hidden ${compact ? "h-[83px]" : "w-full"}`}
        style={compact ? undefined : { aspectRatio }}
      >
        {imageState === "loading" && (
          <span className="absolute inset-0 animate-pulse bg-studio-hover/50 motion-reduce:animate-none" />
        )}
        {imageState === "error" ? (
          <span className="flex flex-col items-center gap-1 px-2 text-center text-studio-muted">
            <ImageOff className="h-5 w-5" />
            <span className="text-[10px]">Preview unavailable</span>
          </span>
        ) : (
          // Provider images retain their animation; previews load only when nearby.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            srcSet={item.previewSrcSet}
            sizes={compact ? (item.kind === "gif" ? "144px" : "82px") : "160px"}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImageState("ready")}
            onError={() => setImageState("error")}
            className={`${imageState === "ready" ? "opacity-100" : "opacity-0"} h-full w-full ${item.kind === "gif" ? "object-cover" : "object-contain p-3"}`}
          />
        )}
        <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-studio-border bg-studio-panel/95 text-studio-fg shadow-sm">
          {isAdding ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </span>
      </span>
      <span className="block truncate border-t border-studio-border/60 px-2 py-1.5 text-[11px] font-medium text-studio-fg">
        {item.name}
      </span>
    </button>
  );
});
