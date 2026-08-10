"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, LoaderCircle, Plus, Search, X } from "lucide-react";
import {
  elementPresets,
  fallbackEmojis,
  fallbackStickers,
  matchesLibrarySearch,
  OpenverseAttribution,
  ShapeArtwork,
  type ElementLibrarySection,
  type ElementPreset,
  type LibraryMedia,
} from "./elements-library";
import {
  fetchOpenverseGifPage,
  OpenverseRateLimitError,
} from "../services/openverse-client";
import { fetchOpenMojiPage } from "../services/openmoji-client";

interface ElementLibraryBrowserProps {
  section: ElementLibrarySection;
  addingId: string | null;
  onBack: () => void;
  onAddElement: (preset: ElementPreset) => void;
  onAddMedia: (item: LibraryMedia) => void;
}

const SECTION_TITLES: Record<ElementLibrarySection, string> = {
  shapes: "Shapes",
  stickers: "Stickers",
  emoji: "Emoji",
  gifs: "GIFs",
};

function formatRetryDelay(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ElementLibraryBrowser({
  section,
  addingId,
  onBack,
  onAddElement,
  onAddMedia,
}: ElementLibraryBrowserProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const requestRef = useRef(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LibraryMedia[]>([]);
  const [pageCursor, setPageCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isOpenverseSection = section === "gifs";
  const isMediaSection = section !== "shapes";
  const isRateLimited = retryAt !== null && retryAt > now;

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 500);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (cursor: number, replace: boolean) => {
      if (!isMediaSection || loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);
      const requestId = ++requestRef.current;

      try {
        const page = isOpenverseSection
          ? await fetchOpenverseGifPage({ query, page: cursor, limit: 18 })
          : await fetchOpenMojiPage({
              section: section as "stickers" | "emoji",
              query,
              offset: cursor,
              limit: 18,
            });
        if (requestId !== requestRef.current) return;

        setItems((current) => {
          if (replace) return page.items;
          const ids = new Set(current.map((item) => item.id));
          return [
            ...current,
            ...page.items.filter((item) => !ids.has(item.id)),
          ];
        });
        setPageCursor("nextPage" in page ? page.nextPage : page.nextOffset);
        setHasMore(page.hasMore);
        setRetryAt(null);
      } catch (cause) {
        if (requestId === requestRef.current) {
          if (!isOpenverseSection) {
            const fallback =
              section === "stickers" ? fallbackStickers : fallbackEmojis;
            setItems(
              fallback.filter((item) => matchesLibrarySearch(item, query)),
            );
            setError(null);
            setRetryAt(null);
          } else if (cause instanceof OpenverseRateLimitError) {
            setNow(Date.now());
            setRetryAt(cause.retryAt);
          } else {
            setRetryAt(null);
          }
          if (isOpenverseSection) {
            setError((cause as Error).message || "Openverse request failed.");
          }
          setHasMore(false);
        }
      } finally {
        if (requestId === requestRef.current) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [isMediaSection, isOpenverseSection, query, section],
  );

  useEffect(() => {
    requestRef.current += 1;
    loadingRef.current = false;
    setItems([]);
    const firstCursor = isOpenverseSection ? 1 : 0;
    setPageCursor(firstCursor);
    setHasMore(true);
    setError(null);
    scrollRef.current?.scrollTo({ top: 0 });
    if (isMediaSection) void loadPage(firstCursor, true);
  }, [isMediaSection, isOpenverseSection, loadPage, query, section]);

  useEffect(() => {
    if (!retryAt || retryAt <= Date.now()) return;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= retryAt) window.clearInterval(interval);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [retryAt]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) void loadPage(pageCursor, false);
  }, [hasMore, isLoading, loadPage, pageCursor]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !isMediaSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "280px 0px", threshold: 0.01 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isMediaSection, loadMore]);

  const visibleShapes = useMemo(
    () =>
      elementPresets.filter((preset) =>
        matchesLibrarySearch(preset, searchInput.trim()),
      ),
    [searchInput],
  );

  const closeSearch = () => {
    setSearchInput("");
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-panel text-studio-fg">
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-studio-border px-3 gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to elements"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {searchOpen ? (
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-studio-muted" />
            <input
              autoFocus
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={`Search ${SECTION_TITLES[section].toLowerCase()}...`}
              className="h-8.5 w-full rounded-lg border border-studio-border bg-studio-panel-raised pl-8 pr-7 text-xs text-studio-fg outline-none transition-colors placeholder:text-studio-muted focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search text"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-studio-muted hover:text-studio-fg"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-2 min-w-0 px-2 text-center">
            <h3 className="text-xs font-bold text-studio-fg truncate">
              {SECTION_TITLES[section]}
            </h3>
            {isOpenverseSection && <OpenverseAttribution compact />}
          </div>
        )}

        <button
          type="button"
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          aria-label={
            searchOpen ? "Close search" : `Search ${SECTION_TITLES[section]}`
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg"
        >
          {searchOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="studio-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-7"
      >
        {section === "shapes" ? (
          <div className="grid grid-cols-3 gap-2">
            {visibleShapes.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onAddElement(preset)}
                title={`Add ${preset.name}`}
                className="flex aspect-square items-center justify-center rounded-md bg-studio-panel-raised transition-colors hover:bg-studio-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ShapeArtwork preset={preset} />
              </button>
            ))}
          </div>
        ) : items.length ? (
          <div className="columns-2 gap-2">
            {items.map((item) => (
              <MasonryMediaTile
                key={item.id}
                item={item}
                isAdding={addingId === item.id}
                onAdd={onAddMedia}
              />
            ))}
          </div>
        ) : !isLoading && !error ? (
          <p className="py-12 text-center text-xs text-studio-muted">
            No {SECTION_TITLES[section].toLowerCase()} found.
          </p>
        ) : null}

        {error && (
          <div
            role="alert"
            className={`mx-auto my-8 max-w-xs rounded-lg border p-4 text-center text-xs ${isRateLimited ? "border-brand/30 bg-brand/10 text-studio-fg" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
          >
            <p className="font-semibold">{error}</p>
            {isRateLimited && (
              <p className="mt-1.5 leading-5 text-studio-muted">
                Requests are paused briefly to respect Openverse&apos;s public
                API limit.
              </p>
            )}
            <button
              type="button"
              onClick={() => void loadPage(1, true)}
              disabled={isRateLimited}
              className="mt-2 block w-full font-bold underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-70"
            >
              {isRateLimited && retryAt
                ? `Retry available in ${formatRetryDelay(retryAt - now)}`
                : "Try again"}
            </button>
            {isRateLimited && (
              <a
                href="https://api.openverse.org/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[10px] text-studio-muted underline hover:text-studio-fg"
              >
                Openverse API documentation
              </a>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex h-16 items-center justify-center">
            <LoaderCircle className="h-5 w-5 animate-spin text-studio-muted" />
          </div>
        )}
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      </div>
    </div>
  );
}

function MasonryMediaTile({
  item,
  isAdding,
  onAdd,
}: {
  item: LibraryMedia;
  isAdding: boolean;
  onAdd: (item: LibraryMedia) => void;
}) {
  const rawRatio = (item.width || 1) / (item.height || 1);
  const ratio = Number.isFinite(rawRatio) && rawRatio > 0 ? rawRatio : 1;
  const transparent = item.kind !== "gif";
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      disabled={isAdding}
      title={`Add ${item.name}`}
      className="group relative mb-2.5 block w-full break-inside-avoid overflow-hidden rounded-lg border border-white/[0.04] bg-studio-panel-raised shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-white/15 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait"
      style={{ aspectRatio: ratio }}
    >
      {/* Original source URLs preserve Openverse GIF animation and resolution. */}
      {!isLoaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.previewUrl}
        srcSet={item.previewSrcSet}
        sizes="260px"
        alt={item.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`relative h-full w-full transition-[opacity,transform] duration-300 group-hover:scale-[1.015] ${isLoaded ? "opacity-100" : "opacity-0"} ${transparent ? "object-contain p-2" : "object-cover"}`}
      />
      <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {isAdding ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-white" />
        ) : (
          <span className="flex h-9 w-9 scale-90 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:scale-100">
            <Plus className="h-4 w-4" />
          </span>
        )}
      </span>
    </button>
  );
}
