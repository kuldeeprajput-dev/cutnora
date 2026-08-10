import {
  createOpenMojiMedia,
  type LibraryMedia,
} from "../components/elements-library";

interface OpenMojiEntry {
  hexcode?: string;
  annotation?: string;
  tags?: string;
  openmoji_tags?: string;
  group?: string;
  subgroups?: string;
}

export interface OpenMojiPage {
  items: LibraryMedia[];
  nextOffset: number;
  hasMore: boolean;
}

const OPENMOJI_CATALOG_URL =
  "https://cdn.jsdelivr.net/npm/openmoji@17.0.0/data/openmoji.json";
const STICKER_GROUP_ORDER = [
  "activities",
  "objects",
  "symbols",
  "travel-places",
  "food-drink",
  "animals-nature",
  "smileys-emotion",
];
const STICKER_GROUPS = new Set(STICKER_GROUP_ORDER);
let catalogRequest: Promise<OpenMojiEntry[]> | null = null;

function getCatalog() {
  if (catalogRequest) return catalogRequest;

  catalogRequest = fetch(OPENMOJI_CATALOG_URL, {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `OpenMoji catalog request failed (${response.status}).`,
        );
      }
      return (await response.json()) as OpenMojiEntry[];
    })
    .catch((error: unknown) => {
      catalogRequest = null;
      throw error;
    });

  return catalogRequest;
}

function getKeywords(entry: OpenMojiEntry) {
  return [entry.tags, entry.openmoji_tags, entry.group, entry.subgroups]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function matchesQuery(entry: OpenMojiEntry, query: string) {
  if (!query) return true;
  const haystack = [
    entry.annotation,
    entry.tags,
    entry.openmoji_tags,
    entry.group,
    entry.subgroups,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export async function fetchOpenMojiPage({
  section,
  query = "",
  offset = 0,
  limit = 18,
}: {
  section: "stickers" | "emoji";
  query?: string;
  offset?: number;
  limit?: number;
}): Promise<OpenMojiPage> {
  const catalog = await getCatalog();
  const cleanQuery = query.trim().toLowerCase().slice(0, 100);
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(48, Math.max(1, Math.floor(limit)));
  const filtered = catalog
    .filter(
      (entry) =>
        entry.hexcode &&
        entry.annotation &&
        entry.group !== "component" &&
        (section === "emoji" || STICKER_GROUPS.has(entry.group ?? "")) &&
        matchesQuery(entry, cleanQuery),
    )
    .sort((left, right) => {
      if (section === "emoji") return 0;
      return (
        STICKER_GROUP_ORDER.indexOf(left.group ?? "") -
        STICKER_GROUP_ORDER.indexOf(right.group ?? "")
      );
    });
  const pageEntries = filtered.slice(safeOffset, safeOffset + safeLimit);
  const items = pageEntries.map((entry) =>
    createOpenMojiMedia(
      entry.hexcode!,
      entry.annotation!,
      section === "stickers" ? "sticker" : "emoji",
      getKeywords(entry),
    ),
  );
  const nextOffset = safeOffset + pageEntries.length;

  return {
    items,
    nextOffset,
    hasMore: pageEntries.length > 0 && nextOffset < filtered.length,
  };
}
