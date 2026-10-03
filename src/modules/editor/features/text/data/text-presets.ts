import type { TextPreset } from "./types";
import { basicPresets } from "./presets/basic";

export type {
  TextPreset,
  TextPresetCategory,
  TextPresetPlacement,
} from "./types";
export {
  getTextPresetPreviewStyle,
  getTextPresetLayout,
} from "./preset-layout";

export const textPresets: TextPreset[] = [
  ...basicPresets,
];
