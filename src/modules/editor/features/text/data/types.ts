import type { TextStyle } from "@/modules/editor/types";

export type TextPresetCategory =
  | "basic"
  | "captions"
  | "labels"
  | "creative"
  | "effects";

export type TextPresetPlacement = "center" | "bottom" | "lower-left" | "top";

export interface TextPreset {
  id: string;
  name: string;
  category: TextPresetCategory;
  placement?: TextPresetPlacement;
  keywords?: string[];
  previewText: string;
  style: TextStyle & { width: number; height: number };
}
