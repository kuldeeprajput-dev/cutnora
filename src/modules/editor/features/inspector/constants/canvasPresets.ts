import {
  Monitor,
  Smartphone,
  Square,
  RectangleVertical,
  Film,
} from "lucide-react";
import type { AspectRatio } from "@/modules/projects/types";

export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  formatName: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: "yt-video",
    platform: "YouTube",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "YouTube video (16:9)",
  },
  {
    id: "yt-shorts",
    platform: "YouTube",
    formatName: "Shorts",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "YouTube Shorts (9:16)",
  },
  {
    id: "yt-banner",
    platform: "YouTube",
    formatName: "Banner",
    width: 2560,
    height: 1440,
    aspectRatio: "16:9",
    name: "YouTube banner (16:9)",
  },
  {
    id: "ig-reel",
    platform: "Instagram",
    formatName: "Reel / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Instagram Reel / Story (9:16)",
  },
  {
    id: "ig-square",
    platform: "Instagram",
    formatName: "Square post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    name: "Instagram square post (1:1)",
  },
  {
    id: "ig-portrait",
    platform: "Instagram",
    formatName: "Portrait post",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    name: "Instagram portrait post (4:5)",
  },
  {
    id: "tiktok-video",
    platform: "TikTok",
    formatName: "Video / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "TikTok video / Story (9:16)",
  },
  {
    id: "fb-video",
    platform: "Facebook",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "Facebook video (16:9)",
  },
  {
    id: "fb-reel",
    platform: "Facebook",
    formatName: "Reel / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Facebook Reel / Story (9:16)",
  },
  {
    id: "x-video",
    platform: "Twitter / X",
    formatName: "Landscape video",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    name: "Twitter / X video (16:9)",
  },
  {
    id: "li-video",
    platform: "LinkedIn",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "LinkedIn video (16:9)",
  },
  {
    id: "pin-video",
    platform: "Pinterest",
    formatName: "Video Pin",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Pinterest video Pin (9:16)",
  },
  {
    id: "pin-standard",
    platform: "Pinterest",
    formatName: "Standard Pin",
    width: 1000,
    height: 1500,
    aspectRatio: "2:3",
    name: "Pinterest standard Pin (2:3)",
  },
];

export const PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "Twitter / X",
  "LinkedIn",
  "Pinterest",
];

export const POPULAR_FORMATS = [
  {
    ratio: "16:9" as AspectRatio,
    title: "Landscape",
    subtitle: "YouTube / TV",
    width: 1920,
    height: 1080,
    Icon: Monitor,
    badge: "16:9",
  },
  {
    ratio: "9:16" as AspectRatio,
    title: "Vertical",
    subtitle: "TikTok / Reels / Shorts",
    width: 1080,
    height: 1920,
    Icon: Smartphone,
    badge: "9:16",
  },
  {
    ratio: "1:1" as AspectRatio,
    title: "Square",
    subtitle: "Instagram Feed",
    width: 1080,
    height: 1080,
    Icon: Square,
    badge: "1:1",
  },
  {
    ratio: "4:5" as AspectRatio,
    title: "Portrait",
    subtitle: "Social Feed",
    width: 1080,
    height: 1350,
    Icon: RectangleVertical,
    badge: "4:5",
  },
  {
    ratio: "2:3" as AspectRatio,
    title: "Poster",
    subtitle: "Pinterest / Stories",
    width: 1000,
    height: 1500,
    Icon: RectangleVertical,
    badge: "2:3",
  },
  {
    ratio: "21:9" as AspectRatio,
    title: "Cinema",
    subtitle: "Ultra-Wide Movie",
    width: 2560,
    height: 1080,
    Icon: Film,
    badge: "21:9",
  },
];

export const QUALITY_PRESETS = [
  { label: "4K UHD", sub: "3840×2160", scale: 2 },
  { label: "1080p FHD", sub: "1920×1080", scale: 1, popular: true },
  { label: "720p HD", sub: "1280×720", scale: 0.6667 },
];

export const FPS_OPTIONS = [
  { value: 24, label: "24 FPS", desc: "Cinematic film" },
  { value: 30, label: "30 FPS", desc: "Standard video", recommended: true },
  { value: 60, label: "60 FPS", desc: "Smooth motion" },
];

export const CANVAS_COLOR_SWATCHES = [
  { label: "Black", hex: "#000000" },
  { label: "Studio Dark", hex: "#08090A" },
  { label: "Charcoal", hex: "#18191D" },
  { label: "Slate", hex: "#374151" },
  { label: "White", hex: "#FFFFFF" },
  { label: "Brand Orange", hex: "#CC5600" },
  { label: "Midnight Blue", hex: "#1E293B" },
  { label: "Deep Crimson", hex: "#881337" },
  { label: "Forest Emerald", hex: "#064E3B" },
  { label: "Royal Purple", hex: "#581C87" },
] as const;

export function getAspectRatioMultiplier(ratio: AspectRatio, width: number, height: number) {
  const [w, h] = String(ratio).split(":").map(Number);
  return w > 0 && h > 0 ? w / h : Math.max(1, width) / Math.max(1, height);
}
