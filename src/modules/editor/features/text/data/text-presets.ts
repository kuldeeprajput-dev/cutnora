import type { TextPreset } from "./types";
import { basicPresets } from "./presets/basic";
import { captionPresets } from "./presets/captions";
import { labelPresets } from "./presets/labels";

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
  ...captionPresets,
  ...labelPresets,
];
