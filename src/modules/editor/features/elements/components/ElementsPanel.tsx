"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { ChevronRight, Search, X } from "lucide-react";
import { db } from "@/modules/core/db/database";
import { useProjectStore } from "@/modules/projects";
import type { MediaAsset } from "@/modules/projects/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { processAndStoreMediaFile } from "@/modules/editor/features/media-library/services/media-import-service";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";
import type { TimelineClip } from "@/modules/editor/types";
import { ElementLibraryBrowser } from "./ElementLibraryBrowser";
import { ElementMediaCard } from "./ElementMediaCard";
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
      className="group mb-2 flex min-h-11 w-full items-center justify-between gap-2 rounded-md text-[13px] font-semibold text-studio-fg transition-colors hover:text-studio-fg/80 focus-visible:outline-2 focus-visible:outline-brand lg:min-h-9"
    >
      <span>{SECTION_LABELS[section]}</span>
      <span className="flex items-center gap-1 text-[11px] font-normal text-studio-muted">
        View all <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export function ElementsPanel() {
  const addClip = useProjectStore((state) => state.addClip);
  const addTrack = useProjectStore((state) => state.addTrack);
  const setSelectedClipIds = useEditorUIStore(
    (state) => state.setSelectedClipIds,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const gifsRef = useRef<HTMLElement>(null);
  const previewsLoadedRef = useRef(false);
  const addingRef = useRef(false);
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
    if (activeSection || previewsLoadedRef.current) return;
    const controller = new AbortController();
    let started = false;
    const loadPreviews = async () => {
      if (started) return;
      started = true;
      setIsLoadingPreviews(true);
      try {
        const page = await fetchOpenverseGifPage({
          limit: 6,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        previewsLoadedRef.current = true;
        setPreviews((current) => ({ ...current, gifs: page.items }));
      } catch (error) {
        if (
          !controller.signal.aborted &&
          !(error instanceof OpenverseRateLimitError)
        ) {
          useToastStore
            .getState()
            .showToast(
              "GIF previews are unavailable. Open GIFs to retry.",
              "warning",
            );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingPreviews(false);
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      void loadPreviews();
      return () => controller.abort();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void loadPreviews();
        }
      },
      { root: scrollRef.current, rootMargin: "100px" },
    );
    if (gifsRef.current) observer.observe(gifsRef.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [activeSection]);

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
        timelineStart: usePlaybackStore.getState().playhead,
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
    [addClip, ensureOverlayTrack, setSelectedClipIds],
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
        timelineStart: usePlaybackStore.getState().playhead,
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
    [addClip, ensureOverlayTrack, setSelectedClipIds],
  );

  const handleAddMedia = useCallback(
    async (item: LibraryMedia) => {
      const project = useProjectStore.getState().currentProject;
      if (!project || addingRef.current) return;
      addingRef.current = true;
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
        if (useProjectStore.getState().currentProject?.id !== project.id) {
          throw new Error("The project changed. Please add the element again.");
        }
        const imported = await processAndStoreMediaFile(file, project.id);
        const asset: MediaAsset = {
          ...imported.asset,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          license: item.license,
          attribution: item.attribution,
        };
        await db.assets.put(asset);

        if (useProjectStore.getState().currentProject?.id !== project.id) {
          throw new Error("The project changed. Please add the element again.");
        }
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
        addingRef.current = false;
        setAddingId(null);
      }
    },
    [addMediaClip],
  );

  if (activeSection) {
    return (
      <div className="h-full min-h-0">
        <ElementLibraryBrowser
          section={activeSection}
          addingId={addingId}
          onBack={() => setActiveSection(null)}
          onAddElement={handleAddElement}
          onAddMedia={handleAddMedia}
          initialSearch={search}
        />
      </div>
    );
  }

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-studio-panel text-studio-fg select-none">
      <div className="shrink-0 border-b border-studio-border px-3.5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-studio-muted" />
          <input
            type="search"
            aria-label="Search element previews"
            placeholder="Search elements…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 lg:h-9 w-full rounded-xl border border-studio-border bg-studio-panel-raised/60 pl-9 pr-11 text-base lg:text-xs text-studio-fg placeholder:text-studio-muted focus:border-studio-fg/40 focus:ring-1 focus:ring-studio-fg/20 focus:outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear element search"
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-studio-muted hover:text-studio-fg lg:h-9"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-studio-muted">
          Add shapes, stickers, emoji, and GIFs to your timeline.
        </p>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-5 pt-2"
      >
        {normalizedSearch &&
          !filteredShapes.length &&
          !filteredStickers.length &&
          !filteredEmojis.length &&
          !filteredGifs.length && (
            <p
              role="status"
              className="rounded-lg border border-studio-border bg-studio-panel-raised p-3 text-xs leading-5 text-studio-muted"
            >
              No matching previews. Open a category to search its full library.
            </p>
          )}
        <LibrarySection section="shapes" onOpen={setActiveSection}>
          {filteredShapes.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleAddElement(preset)}
              title={`Add ${preset.name}`}
              className="flex flex-col overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised transition-colors hover:border-studio-border-strong hover:bg-studio-hover focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="flex h-[83px] w-full items-center justify-center">
                <ShapeArtwork preset={preset} />
              </span>
              <span className="w-full truncate border-t border-studio-border/60 px-2 py-1.5 text-left text-[11px] font-medium">
                {preset.name}
              </span>
            </button>
          ))}
        </LibrarySection>

        <LibrarySection section="stickers" onOpen={setActiveSection}>
          {filteredStickers.map((item) => (
            <ElementMediaCard
              key={item.id}
              item={item}
              isAdding={addingId === item.id}
              isBusy={addingId !== null}
              compact
              onAdd={handleAddMedia}
            />
          ))}
        </LibrarySection>

        <LibrarySection section="emoji" onOpen={setActiveSection}>
          {filteredEmojis.map((item) => (
            <ElementMediaCard
              key={item.id}
              item={item}
              isAdding={addingId === item.id}
              isBusy={addingId !== null}
              compact
              onAdd={handleAddMedia}
            />
          ))}
        </LibrarySection>

        <LibrarySection
          section="gifs"
          onOpen={setActiveSection}
          sectionRef={gifsRef}
          wide
        >
          {isLoadingPreviews ? (
            <PreviewSkeletons />
          ) : filteredGifs.length ? (
            filteredGifs.map((item) => (
              <ElementMediaCard
                key={item.id}
                item={item}
                isAdding={addingId === item.id}
                isBusy={addingId !== null}
                compact
                onAdd={handleAddMedia}
              />
            ))
          ) : (
            <button
              type="button"
              onClick={() => setActiveSection("gifs")}
              className="flex min-h-[111px] items-center justify-center rounded-md border border-dashed border-studio-border bg-studio-panel-raised px-3 text-center text-[10px] leading-4 text-studio-muted"
            >
              Browse GIFs
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
  sectionRef,
}: {
  section: ElementLibrarySection;
  onOpen: (section: ElementLibrarySection) => void;
  children: React.ReactNode;
  wide?: boolean;
  sectionRef?: React.Ref<HTMLElement>;
}) {
  return (
    <section ref={sectionRef} className="mb-5">
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
      className="h-[111px] animate-pulse rounded-md bg-studio-panel-raised"
    />
  ));
}
