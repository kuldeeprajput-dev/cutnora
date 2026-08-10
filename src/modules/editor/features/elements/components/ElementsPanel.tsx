"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { ChevronRight, LoaderCircle, Plus, Search, X } from "lucide-react";
import { db } from "@/modules/core/db/database";
import { useProjectStore } from "@/modules/projects";
import type { MediaAsset } from "@/modules/projects/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { processAndStoreMediaFile } from "@/modules/editor/features/media-library/services/media-import-service";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";
import type { TimelineClip } from "@/modules/editor/types";
import { ElementLibraryBrowser } from "./ElementLibraryBrowser";
import {
  elementPresets,
  fallbackEmojis,
  fallbackStickers,
  matchesLibrarySearch,
  OPENMOJI_SOURCE,
  OpenverseAttribution,
  ShapeArtwork,
  TWEMOJI_SOURCE,
  type ElementLibrarySection,
  type ElementPreset,
  type LibraryMedia,
} from "./elements-library";
import {
  fetchOpenverseGifPage,
  OpenverseRateLimitError,
} from "../services/openverse-client";

const SECTION_LABELS: Record<ElementLibrarySection, string> = {
  shapes: "Shapes",
  stickers: "Stickers",
  emoji: "Emoji",
  gifs: "GIFs",
};

function safeFilename(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "element"
  );
}

function SectionHeader({
  section,
  onOpen,
}: {
  section: ElementLibrarySection;
  onOpen: (section: ElementLibrarySection) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(section)}
      className="group mb-3 flex items-center gap-1 text-[13px] font-bold text-studio-muted transition-colors hover:text-studio-fg"
    >
      <span>{SECTION_LABELS[section]}</span>
      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export function ElementsPanel() {
  const { addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] =
    useState<ElementLibrarySection | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [previews, setPreviews] = useState<{
    stickers: LibraryMedia[];
    emoji: LibraryMedia[];
    gifs: LibraryMedia[];
  }>({
    stickers: fallbackStickers,
    emoji: fallbackEmojis,
    gifs: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingPreviews(true);

    fetchOpenverseGifPage({
      limit: 10,
      signal: controller.signal,
    })
      .then((gifsPage) => {
        if (controller.signal.aborted) return;
        setPreviews((current) => ({ ...current, gifs: gifsPage.items }));
      })
      .catch((error) => {
        if (
          (error as Error).name !== "AbortError" &&
          !(error instanceof OpenverseRateLimitError)
        ) {
          useToastStore
            .getState()
            .showToast(
              `Openverse previews unavailable: ${(error as Error).message}`,
              "warning",
            );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPreviews(false);
      });

    return () => controller.abort();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredShapes = useMemo(
    () =>
      elementPresets.filter((item) =>
        matchesLibrarySearch(item, normalizedSearch),
      ),
    [normalizedSearch],
  );
  const filteredStickers = useMemo(
    () =>
      previews.stickers.filter((item) =>
        matchesLibrarySearch(item, normalizedSearch),
      ),
    [normalizedSearch, previews.stickers],
  );
  const filteredEmojis = useMemo(
    () =>
      previews.emoji.filter((item) =>
        matchesLibrarySearch(item, normalizedSearch),
      ),
    [normalizedSearch, previews.emoji],
  );
  const filteredGifs = useMemo(
    () =>
      previews.gifs.filter((item) =>
        matchesLibrarySearch(item, normalizedSearch),
      ),
    [normalizedSearch, previews.gifs],
  );

  const ensureOverlayTrack = useCallback(() => {
    const project = useProjectStore.getState().currentProject;
    if (!project) return null;

    let track = project.tracks.find((item) => item.type === "overlay");
    if (!track) {
      addTrack("overlay", "Elements");
      track = useProjectStore
        .getState()
        .currentProject?.tracks.find((item) => item.type === "overlay");
    }
    return track ?? null;
  }, [addTrack]);

  const handleAddElement = useCallback(
    (preset: ElementPreset) => {
      const project = useProjectStore.getState().currentProject;
      if (!project) return;
      const track = ensureOverlayTrack();
      if (!track) return;

      const { width, height, ...elementStyle } = preset.style;
      const newClipId = nanoid();
      const newClip: TimelineClip = {
        id: newClipId,
        trackId: track.id,
        type: "overlay",
        timelineStart: playhead,
        timelineDuration: 5,
        sourceStart: 0,
        sourceDuration: 5,
        name: preset.name,
        elementStyle,
        transform: {
          x: Math.round((project.settings.width - width) / 2),
          y: Math.round((project.settings.height - height) / 2),
          width,
          height,
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
        audio: { volume: 1, muted: false, fadeIn: 0, fadeOut: 0 },
        speed: 1,
      };

      addClip(track.id, newClip);
      setSelectedClipIds([newClipId]);
    },
    [addClip, ensureOverlayTrack, playhead, setSelectedClipIds],
  );

  const addMediaClip = useCallback(
    (asset: MediaAsset, item: LibraryMedia) => {
      const track = ensureOverlayTrack();
      const project = useProjectStore.getState().currentProject;
      if (!track || !project) return;

      const naturalWidth = asset.width || item.width || 512;
      const naturalHeight = asset.height || item.height || 512;
      const maxWidth =
        item.kind === "gif"
          ? Math.min(560, project.settings.width * 0.56)
          : 260;
      const maxHeight =
        item.kind === "gif"
          ? Math.min(315, project.settings.height * 0.56)
          : 260;
      const scale = Math.min(
        maxWidth / naturalWidth,
        maxHeight / naturalHeight,
      );
      const width = Math.max(80, Math.round(naturalWidth * scale));
      const height = Math.max(80, Math.round(naturalHeight * scale));
      const clipId = nanoid();
      const newClip: TimelineClip = {
        id: clipId,
        trackId: track.id,
        assetId: asset.id,
        type: "image",
        timelineStart: playhead,
        timelineDuration: 5,
        sourceStart: 0,
        sourceDuration: 5,
        name: item.name,
        transform: {
          x: Math.round((project.settings.width - width) / 2),
          y: Math.round((project.settings.height - height) / 2),
          width,
          height,
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
        audio: { volume: 1, muted: false, fadeIn: 0, fadeOut: 0 },
        speed: 1,
      };

      addClip(track.id, newClip);
      setSelectedClipIds([clipId]);
    },
    [addClip, ensureOverlayTrack, playhead, setSelectedClipIds],
  );

  const handleAddMedia = useCallback(
    async (item: LibraryMedia) => {
      const project = useProjectStore.getState().currentProject;
      if (!project || addingId) return;
      setAddingId(item.id);

      try {
        const response = await fetch(item.url);
        if (!response.ok) {
          throw new Error(`Download failed (${response.status})`);
        }
        const blob = await response.blob();
        if (!blob.size) throw new Error("The downloaded file was empty.");
        if (blob.size > 15 * 1024 * 1024) {
          throw new Error("This asset is larger than the 15 MB import limit.");
        }

        const extension = item.kind === "gif" ? "gif" : "svg";
        const mimeType =
          blob.type || (item.kind === "gif" ? "image/gif" : "image/svg+xml");
        const file = new File(
          [blob],
          `${safeFilename(item.name)}.${extension}`,
          { type: mimeType },
        );
        const imported = await processAndStoreMediaFile(file, project.id);
        const asset: MediaAsset = {
          ...imported.asset,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          license: item.license,
          attribution: item.attribution,
        };
        await db.assets.put(asset);

        useProjectStore.getState().addAsset(asset);
        addMediaClip(asset, item);
        useToastStore
          .getState()
          .showToast(`${item.name} added to the timeline`, "success");
      } catch (error) {
        useToastStore
          .getState()
          .showToast(
            `Could not add ${item.name}: ${(error as Error).message}`,
            "error",
          );
      } finally {
        setAddingId(null);
      }
    },
    [addMediaClip, addingId],
  );

  if (activeSection) {
    return (
      <div className="h-full p-0.5">
        <ElementLibraryBrowser
          section={activeSection}
          addingId={addingId}
          onBack={() => setActiveSection(null)}
          onAddElement={handleAddElement}
          onAddMedia={handleAddMedia}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-studio-panel text-studio-fg select-none">


      <div className="studio-scrollbar min-h-0 flex-1 overflow-y-auto px-3.5 pb-5 pt-2">
        <LibrarySection section="shapes" onOpen={setActiveSection}>
          {filteredShapes.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleAddElement(preset)}
              title={`Add ${preset.name}`}
              className="flex h-[83px] items-center justify-center overflow-hidden rounded-md bg-studio-panel-raised transition-colors hover:bg-studio-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ShapeArtwork preset={preset} />
            </button>
          ))}
        </LibrarySection>

        <LibrarySection section="stickers" onOpen={setActiveSection}>
          {filteredStickers.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              isAdding={addingId === item.id}
              onAdd={handleAddMedia}
            />
          ))}
        </LibrarySection>

        <LibrarySection section="emoji" onOpen={setActiveSection}>
          {filteredEmojis.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              isAdding={addingId === item.id}
              onAdd={handleAddMedia}
            />
          ))}
        </LibrarySection>

        <LibrarySection section="gifs" onOpen={setActiveSection} wide>
          {isLoadingPreviews ? (
            <PreviewSkeletons />
          ) : filteredGifs.length ? (
            filteredGifs.map((item) => (
              <MediaTile
                key={item.id}
                item={item}
                isAdding={addingId === item.id}
                onAdd={handleAddMedia}
                wide
              />
            ))
          ) : (
            <button
              type="button"
              onClick={() => setActiveSection("gifs")}
              className="flex h-[83px] w-[190px] items-center justify-center rounded-md border border-dashed border-studio-border bg-studio-panel-raised px-3 text-center text-[10px] leading-4 text-studio-muted"
            >
              Open Openverse to browse CC0 and Public Domain GIFs
            </button>
          )}
        </LibrarySection>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-studio-border/70 pt-3">
          <p className="text-[9px] leading-4 text-studio-muted">
            Stickers by
            <a
              className="ml-1 underline hover:text-studio-fg"
              href={OPENMOJI_SOURCE}
              target="_blank"
              rel="noreferrer"
            >
              OpenMoji
            </a>
            <span className="mx-1">·</span>
            Emoji by
            <a
              className="ml-1 underline hover:text-studio-fg"
              href={TWEMOJI_SOURCE}
              target="_blank"
              rel="noreferrer"
            >
              Twemoji
            </a>
          </p>
          <OpenverseAttribution />
        </div>
      </div>
    </div>
  );
}

function LibrarySection({
  section,
  onOpen,
  children,
  wide = false,
}: {
  section: ElementLibrarySection;
  onOpen: (section: ElementLibrarySection) => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="mb-7">
      <SectionHeader section={section} onOpen={onOpen} />
      <div
        className={`grid grid-flow-col gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${wide ? "auto-cols-[144px]" : "auto-cols-[82px]"}`}
      >
        {children}
      </div>
    </section>
  );
}

function PreviewSkeletons() {
  return Array.from({ length: 4 }, (_, index) => (
    <div
      key={index}
      className="h-[83px] animate-pulse rounded-md bg-studio-panel-raised"
    />
  ));
}

function MediaTile({
  item,
  isAdding,
  onAdd,
  wide = false,
}: {
  item: LibraryMedia;
  isAdding: boolean;
  onAdd: (item: LibraryMedia) => void;
  wide?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      disabled={isAdding}
      title={`Add ${item.name}`}
      className="group relative flex h-[83px] items-center justify-center overflow-hidden rounded-lg border border-white/[0.04] bg-studio-panel-raised shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-white/15 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait"
    >
      {/* Provider media is loaded from its original URL to preserve animation. */}
      {!isLoaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.previewUrl}
        srcSet={item.previewSrcSet}
        sizes={wide ? "144px" : "56px"}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={
          `${isLoaded ? "opacity-100" : "opacity-0"} relative transition-[opacity,transform] duration-300 group-hover:scale-[1.02] ` +
          (wide ? "h-full w-full object-cover" : "h-14 w-14 object-contain")
        }
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {isAdding ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-white" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-md">
            <Plus className="h-4 w-4" />
          </span>
        )}
      </span>
    </button>
  );
}
