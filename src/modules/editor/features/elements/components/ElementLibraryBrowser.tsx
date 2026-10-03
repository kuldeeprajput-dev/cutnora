"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, LoaderCircle, Search, X } from "lucide-react";
import { ElementMediaCard } from "./ElementMediaCard";
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
  initialSearch?: string;
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
  initialSearch = "",
}: ElementLibraryBrowserProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const requestRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const [searchOpen, setSearchOpen] = useState(Boolean(initialSearch));
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [query, setQuery] = useState(initialSearch.trim());
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
      const controller = new AbortController();
      requestControllerRef.current = controller;

      try {
        const page = isOpenverseSection
          ? await fetchOpenverseGifPage({
              query,
              page: cursor,
              limit: 18,
              signal: controller.signal,
            })
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
    return () => {
      requestRef.current += 1;
      requestControllerRef.current?.abort();
    };
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
    <div className="@container flex h-full min-h-0 flex-col overflow-hidden bg-studio-panel text-studio-fg">
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-studio-border px-3 gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to elements"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg focus-visible:outline-2 focus-visible:outline-brand lg:h-8 lg:w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {searchOpen ? (
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-studio-muted" />
            <input
              autoFocus
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={`Search ${SECTION_TITLES[section].toLowerCase()}...`}
              aria-label={`Search ${SECTION_TITLES[section].toLowerCase()}`}
              className="h-11 lg:h-9 w-full rounded-xl border border-studio-border bg-studio-panel-raised/60 pl-9 pr-11 text-base lg:text-xs text-studio-fg placeholder:text-studio-muted focus:border-studio-fg/40 focus:ring-1 focus:ring-studio-fg/20 focus:outline-none transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search text"
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-studio-muted hover:text-studio-fg lg:h-8 lg:w-8"
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-fg focus-visible:outline-2 focus-visible:outline-brand lg:h-8 lg:w-8"
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
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
      >
        {section === "shapes" ? (
          <div className="grid grid-cols-3 gap-2 @[420px]:grid-cols-4">
            {visibleShapes.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onAddElement(preset)}
                title={`Add ${preset.name}`}
                aria-label={`Add ${preset.name} to timeline`}
                className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-studio-border bg-studio-panel-raised transition-colors hover:border-studio-border-strong hover:bg-studio-hover focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className="flex aspect-square w-full items-center justify-center">
                  <ShapeArtwork preset={preset} />
                </span>
                <span className="w-full truncate border-t border-studio-border/60 px-2 py-1.5 text-left text-[11px] font-medium">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        ) : items.length ? (
          <div
            className={
              isOpenverseSection
                ? "columns-2 gap-2 @[480px]:columns-3"
                : "grid grid-cols-3 gap-2 @[420px]:grid-cols-4"
            }
          >
            {items.map((item) => (
              <div
                key={item.id}
                className={
                  isOpenverseSection ? "mb-2 break-inside-avoid" : "min-w-0"
                }
              >
                <ElementMediaCard
                  key={item.id}
                  item={item}
                  isAdding={addingId === item.id}
                  isBusy={addingId !== null}
                  onAdd={onAddMedia}
                />
              </div>
            ))}
          </div>
        ) : !isLoading && !error ? (
          <p className="py-12 text-center text-xs text-studio-muted">
            No {SECTION_TITLES[section].toLowerCase()} found.
          </p>
        ) : null}

        {section === "shapes" && visibleShapes.length === 0 && (
          <p className="py-12 text-center text-xs text-studio-muted">
            No shapes match your search.
          </p>
        )}

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
