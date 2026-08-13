import type { LibraryMedia } from "../components/elements-library";

interface OpenverseTag {
  name?: string;
}

interface OpenverseImage {
  id: string;
  title?: string;
  foreign_landing_url?: string;
  url?: string;
  creator?: string;
  license?: string;
  license_version?: string;
  source?: string;
  filesize?: number;
  filetype?: string;
  tags?: OpenverseTag[];
  mature?: boolean;
  width?: number;
  height?: number;
  detail_url?: string;
}

interface OpenverseResponse {
  result_count?: number;
  page_count?: number;
  page_size?: number;
  page?: number;
  results?: OpenverseImage[];
}

export interface OpenversePage {
  items: LibraryMedia[];
  nextPage: number;
  hasMore: boolean;
}

const OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images/";
const DEFAULT_GIF_QUERY = "animation";
const MAX_IMPORT_BYTES = 15 * 1024 * 1024;
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
const RATE_LIMIT_STORAGE_KEY = "cutnora:openverse-rate-limit-until";
const ALLOWED_LICENSES = new Set(["cc0", "pdm"]);
const inflightRequests = new Map<string, Promise<OpenversePage>>();
let memoryRateLimitUntil = 0;

export class OpenverseRateLimitError extends Error {
  readonly retryAt: number;

  constructor(retryAt: number) {
    super("Openverse's request limit has been reached.");
    this.name = "OpenverseRateLimitError";
    this.retryAt = retryAt;
  }
}

function createAbortError() {
  const error = new Error("The request was cancelled.");
  error.name = "AbortError";
  return error;
}

function waitForRequest<T>(request: Promise<T>, signal?: AbortSignal) {
  if (!signal) return request;
  if (signal.aborted) return Promise.reject(createAbortError());

  return new Promise<T>((resolve, reject) => {
    const handleAbort = () => reject(createAbortError());
    const cleanup = () => signal.removeEventListener("abort", handleAbort);

    signal.addEventListener("abort", handleAbort, { once: true });
    request.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

function getRateLimitUntil() {
  if (typeof window === "undefined") return memoryRateLimitUntil;

  try {
    const stored = Number(
      window.sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY),
    );
    if (Number.isFinite(stored) && stored > Date.now()) {
      memoryRateLimitUntil = Math.max(memoryRateLimitUntil, stored);
    } else {
      window.sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
    }
  } catch {
    // The in-memory cooldown remains available when storage is restricted.
  }

  return memoryRateLimitUntil;
}

function setRateLimitUntil(retryAt: number) {
  memoryRateLimitUntil = Math.max(memoryRateLimitUntil, retryAt);
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      RATE_LIMIT_STORAGE_KEY,
      String(memoryRateLimitUntil),
    );
  } catch {
    // The in-memory cooldown still prevents retry loops.
  }
}

function getRetryAt(response: Response) {
  const now = Date.now();
  const retryAfter = response.headers.get("retry-after")?.trim();
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return now + seconds * 1000;
    }

    const date = Date.parse(retryAfter);
    if (Number.isFinite(date) && date > now) return date;
  }

  return now + DEFAULT_RATE_LIMIT_COOLDOWN_MS;
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapOpenverseImage(item: OpenverseImage): LibraryMedia | null {
  const license = item.license?.toLowerCase();
  if (
    !item.url?.startsWith("https://") ||
    !license ||
    !ALLOWED_LICENSES.has(license) ||
    item.mature ||
    item.filetype?.toLowerCase() !== "gif" ||
    (typeof item.filesize === "number" && item.filesize > MAX_IMPORT_BYTES)
  ) {
    return null;
  }

  const name = item.title?.trim() || "Openverse GIF";
  const creator = item.creator?.trim();
  const licenseLabel =
    license === "cc0"
      ? `CC0${item.license_version ? ` ${item.license_version}` : ""}`
      : "Public Domain Mark";
  const sourceName = item.source
    ? `Openverse · ${titleCase(item.source)}`
    : "Openverse";
  const width = Number(item.width || 480);
  const height = Number(item.height || 360);

  return {
    id: `openverse-${item.id}`,
    name,
    keywords: [
      "gif",
      "animation",
      ...(item.tags ?? [])
        .map((tag) => tag.name?.trim().toLowerCase())
        .filter((tag): tag is string => Boolean(tag)),
    ],
    kind: "gif",
    url: item.url,
    previewUrl: item.url,
    width: Number.isFinite(width) && width > 0 ? width : 480,
    height: Number.isFinite(height) && height > 0 ? height : 360,
    sourceUrl: item.foreign_landing_url || item.detail_url || item.url,
    sourceName,
    license: licenseLabel,
    attribution: `${name}${creator ? ` by ${creator}` : ""} · ${licenseLabel} · via Openverse`,
    provider: "openverse",
  };
}

export async function fetchOpenverseGifPage({
  query = "",
  page = 1,
  limit = 18,
  signal,
}: {
  query?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<OpenversePage> {
  const cleanQuery = query.trim().slice(0, 100) || DEFAULT_GIF_QUERY;
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));
  const requestKey = [cleanQuery, safePage, safeLimit].join("|");
  const existingRequest = inflightRequests.get(requestKey);
  if (existingRequest) return waitForRequest(existingRequest, signal);

  const rateLimitUntil = getRateLimitUntil();
  if (rateLimitUntil > Date.now()) {
    throw new OpenverseRateLimitError(rateLimitUntil);
  }

  const params = new URLSearchParams({
    q: cleanQuery,
    extension: "gif",
    license: "cc0,pdm",
    mature: "false",
    filter_dead: "true",
    page_size: String(safeLimit),
    page: String(safePage),
  });

  const request = (async (): Promise<OpenversePage> => {
    const response = await fetch(`${OPENVERSE_ENDPOINT}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (response.status === 429) {
      const retryAt = getRetryAt(response);
      setRateLimitUntil(retryAt);
      throw new OpenverseRateLimitError(retryAt);
    }
    if (!response.ok) {
      throw new Error(`Openverse request failed (${response.status}).`);
    }

    const payload = (await response.json()) as OpenverseResponse;
    const results = payload.results ?? [];
    const items = results
      .map(mapOpenverseImage)
      .filter((item): item is LibraryMedia => Boolean(item));
    const currentPage = payload.page ?? safePage;
    const pageCount = payload.page_count ?? currentPage;

    return {
      items,
      nextPage: currentPage + 1,
      hasMore: results.length > 0 && currentPage < pageCount,
    };
  })();

  inflightRequests.set(requestKey, request);
  request.then(
    () => {
      if (inflightRequests.get(requestKey) === request) {
        inflightRequests.delete(requestKey);
      }
    },
    () => {
      if (inflightRequests.get(requestKey) === request) {
        inflightRequests.delete(requestKey);
      }
    },
  );

  return waitForRequest(request, signal);
}
