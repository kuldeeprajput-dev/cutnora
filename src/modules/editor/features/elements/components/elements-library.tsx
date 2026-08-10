import React from "react";
import type { ElementStyle } from "@/modules/editor/types";

export type ElementLibrarySection = "shapes" | "stickers" | "emoji" | "gifs";

export interface ElementPreset {
  id: string;
  name: string;
  keywords: string[];
  style: ElementStyle & { width: number; height: number };
}

export interface LibraryMedia {
  id: string;
  name: string;
  keywords: string[];
  kind: "sticker" | "emoji" | "gif";
  url: string;
  previewUrl: string;
  previewSrcSet?: string;
  width?: number;
  height?: number;
  sourceUrl: string;
  sourceName: string;
  license: string;
  attribution: string;
  provider: "twemoji" | "openmoji" | "openverse";
}

export const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";
export const TWEMOJI_SOURCE = "https://github.com/twitter/twemoji";
export const OPENMOJI_BASE =
  "https://cdn.jsdelivr.net/npm/openmoji@17.0.0/color/svg";
export const OPENMOJI_SOURCE = "https://openmoji.org/";
export const OPENVERSE_SOURCE = "https://openverse.org/";

function twemoji(
  code: string,
  name: string,
  kind: "sticker" | "emoji",
  keywords: string[],
): LibraryMedia {
  const url = `${TWEMOJI_BASE}/${code}.svg`;
  return {
    id: `${kind}-${code}`,
    name,
    keywords,
    kind,
    url,
    previewUrl: url,
    width: 512,
    height: 512,
    sourceUrl: TWEMOJI_SOURCE,
    sourceName: "Twemoji",
    license: "CC BY 4.0",
    attribution:
      "Twemoji graphics by Twitter and contributors, licensed under CC BY 4.0.",
    provider: "twemoji",
  };
}

export function createOpenMojiMedia(
  code: string,
  name: string,
  kind: "sticker" | "emoji",
  keywords: string[],
): LibraryMedia {
  const url = `${OPENMOJI_BASE}/${code.toUpperCase()}.svg`;
  return {
    id: `${kind}-openmoji-${code.toLowerCase()}`,
    name,
    keywords,
    kind,
    url,
    previewUrl: url,
    width: 618,
    height: 618,
    sourceUrl: OPENMOJI_SOURCE,
    sourceName: "OpenMoji",
    license: "CC BY-SA 4.0",
    attribution:
      "All emojis designed by OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0.",
    provider: "openmoji",
  };
}

function openmoji(code: string, name: string, keywords: string[]) {
  return createOpenMojiMedia(code, name, "sticker", keywords);
}

export const elementPresets: ElementPreset[] = [
  {
    id: "rectangle",
    name: "Rectangle",
    keywords: ["box", "square", "shape"],
    style: {
      fillColor: "#d3524b",
      shapeType: "rectangle",
      width: 300,
      height: 220,
    },
  },
  {
    id: "circle",
    name: "Circle",
    keywords: ["round", "shape"],
    style: {
      fillColor: "#f0843d",
      borderRadius: 999,
      shapeType: "circle",
      width: 220,
      height: 220,
    },
  },
  {
    id: "triangle",
    name: "Triangle",
    keywords: ["badge", "shape"],
    style: {
      fillColor: "#ead174",
      shapeType: "triangle",
      width: 240,
      height: 220,
    },
  },
  {
    id: "flag",
    name: "Flag",
    keywords: ["banner", "label", "shape"],
    style: {
      fillColor: "#79bd61",
      shapeType: "flag",
      width: 300,
      height: 220,
    },
  },
  {
    id: "speech-bubble",
    name: "Speech Bubble",
    keywords: ["chat", "message", "shape"],
    style: {
      fillColor: "#15a98f",
      shapeType: "chat-bubble",
      width: 300,
      height: 240,
    },
  },
];

export const fallbackStickers: LibraryMedia[] = [
  openmoji("1F44B", "Hello", ["hello", "wave", "hi"]),
  openmoji("1F389", "Celebrate", ["party", "celebrate", "confetti"]),
  openmoji("1F525", "Fire", ["fire", "hot", "trending"]),
  openmoji("1F496", "Sparkle Heart", ["heart", "love", "sparkle"]),
  openmoji("1F4A1", "Idea", ["idea", "light", "tip"]),
  openmoji("1F680", "Launch", ["rocket", "launch", "fast"]),
  openmoji("2728", "Sparkles", ["sparkle", "shine", "magic"]),
  openmoji("1F4AF", "One Hundred", ["hundred", "perfect", "score"]),
  openmoji("1F3AF", "Target", ["target", "goal", "bullseye"]),
  openmoji("1F31F", "Glowing Star", ["star", "shine", "favorite"]),
  openmoji("1F44D", "Thumbs Up", ["yes", "like", "approve"]),
  openmoji("1F44F", "Applause", ["clap", "bravo", "congratulations"]),
  openmoji("1F64C", "Celebrate Hands", ["hooray", "celebrate", "hands"]),
  openmoji("1F4AA", "Strong", ["strong", "power", "muscle"]),
  openmoji("1F3C6", "Winner", ["trophy", "winner", "award"]),
  openmoji("1F381", "Gift", ["gift", "present", "birthday"]),
  openmoji("1F388", "Balloon", ["balloon", "party", "birthday"]),
  openmoji("1F4A5", "Boom", ["boom", "impact", "explosion"]),
  openmoji("1F4AB", "Dizzy", ["dizzy", "stars", "motion"]),
  openmoji("1F440", "Eyes", ["look", "watch", "eyes"]),
  openmoji("1F514", "Bell", ["bell", "notification", "alert"]),
  openmoji("1F50D", "Search", ["search", "find", "zoom"]),
  openmoji("2705", "Done", ["done", "check", "success"]),
  openmoji("274C", "No", ["no", "cross", "wrong"]),
];

export const fallbackEmojis: LibraryMedia[] = [
  twemoji("1f600", "Grinning Face", "emoji", ["happy", "smile", "grin"]),
  twemoji("1f602", "Tears of Joy", "emoji", ["laugh", "funny", "tears"]),
  twemoji("1f60a", "Smiling Face", "emoji", ["happy", "blush", "smile"]),
  twemoji("1f970", "Smiling Hearts", "emoji", ["love", "heart", "happy"]),
  twemoji("1f618", "Kiss", "emoji", ["kiss", "love", "heart"]),
  twemoji("1f60d", "Heart Eyes", "emoji", ["love", "heart", "eyes"]),
  twemoji("1f914", "Thinking Face", "emoji", ["think", "question", "hmm"]),
  twemoji("1f62e", "Surprised Face", "emoji", ["wow", "surprise", "shock"]),
  twemoji("1f60e", "Cool Face", "emoji", ["cool", "sunglasses", "happy"]),
  twemoji("1f622", "Crying Face", "emoji", ["sad", "cry", "tear"]),
  twemoji("1f973", "Party Face", "emoji", ["party", "celebrate", "happy"]),
  twemoji("1f923", "Rolling Laugh", "emoji", ["laugh", "funny", "floor"]),
  twemoji("1f92f", "Mind Blown", "emoji", ["wow", "shock", "mind"]),
  twemoji("1f609", "Wink", "emoji", ["wink", "playful", "happy"]),
  twemoji("1f644", "Eye Roll", "emoji", ["eyes", "annoyed", "roll"]),
  twemoji("1f621", "Angry Face", "emoji", ["angry", "mad", "red"]),
  twemoji("1f631", "Screaming Face", "emoji", ["fear", "shock", "scream"]),
  twemoji("1f917", "Hugging Face", "emoji", ["hug", "happy", "hands"]),
  twemoji("1f975", "Hot Face", "emoji", ["hot", "heat", "sweat"]),
  twemoji("1f976", "Cold Face", "emoji", ["cold", "freeze", "ice"]),
  twemoji("1f603", "Smiling Eyes", "emoji", ["happy", "smile", "joy"]),
  twemoji("1f604", "Big Smile", "emoji", ["happy", "laugh", "smile"]),
  twemoji("1f605", "Nervous Laugh", "emoji", ["sweat", "laugh", "relief"]),
  twemoji("1f606", "Squinting Laugh", "emoji", ["laugh", "funny", "happy"]),
  twemoji("1f607", "Angel Face", "emoji", ["angel", "innocent", "halo"]),
  twemoji("1f642", "Slight Smile", "emoji", ["smile", "calm", "happy"]),
  twemoji("1f643", "Upside Down", "emoji", ["silly", "upside", "playful"]),
  twemoji("1f911", "Money Face", "emoji", ["money", "rich", "cash"]),
  twemoji("1f92a", "Goofy Face", "emoji", ["silly", "funny", "wild"]),
  twemoji("1f928", "Raised Eyebrow", "emoji", [
    "suspicious",
    "question",
    "hmm",
  ]),
  twemoji("1f9d0", "Monocle Face", "emoji", ["inspect", "smart", "curious"]),
  twemoji("1f612", "Unamused Face", "emoji", ["annoyed", "bored", "unhappy"]),
  twemoji("1f614", "Pensive Face", "emoji", ["sad", "thoughtful", "quiet"]),
  twemoji("1f62d", "Loudly Crying", "emoji", ["cry", "sad", "tears"]),
  twemoji("1f624", "Triumph Face", "emoji", ["proud", "angry", "steam"]),
  twemoji("1f47b", "Ghost", "emoji", ["ghost", "spooky", "halloween"]),
  twemoji("1f4a9", "Poop", "emoji", ["poop", "funny", "silly"]),
  twemoji("1f44d", "Thumbs Up", "emoji", ["yes", "like", "approve"]),
];

export function matchesLibrarySearch(
  item: { name: string; keywords?: string[] },
  query: string,
) {
  if (!query) return true;
  const haystack = [item.name, ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function ShapeArtwork({ preset }: { preset: ElementPreset }) {
  const color = preset.style.fillColor;

  if (preset.id === "circle") {
    return (
      <span
        className="h-14 w-14 rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  }

  if (preset.id === "triangle") {
    return (
      <span
        className="h-0 w-0 border-x-[29px] border-b-[54px] border-x-transparent"
        style={{ borderBottomColor: color }}
      />
    );
  }

  if (preset.id === "flag") {
    return (
      <svg viewBox="0 0 100 82" className="h-14 w-16" aria-hidden="true">
        <path d="M8 5h84v56H31L8 80Z" fill={color} />
      </svg>
    );
  }

  if (preset.id === "speech-bubble") {
    return (
      <svg viewBox="0 0 100 90" className="h-16 w-16" aria-hidden="true">
        <path
          d="M50 3a43 43 0 1 1-28 75L7 85l6-20A43 43 0 0 1 50 3Z"
          fill={color}
        />
      </svg>
    );
  }

  return <span className="h-14 w-14" style={{ backgroundColor: color }} />;
}

export function OpenverseAttribution({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <a
      href={OPENVERSE_SOURCE}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 whitespace-nowrap"
      aria-label="GIFs from Openverse"
    >
      <span
        className={`${compact ? "text-[7px]" : "text-[8px]"} font-medium uppercase tracking-wide text-studio-muted/70`}
      >
        GIFs from
      </span>
      <strong
        className={`${compact ? "text-[10px]" : "text-[11px]"} font-black tracking-tight text-studio-fg hover:underline`}
      >
        Openverse
      </strong>
    </a>
  );
}
