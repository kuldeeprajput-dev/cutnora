import type { TextPreset } from "./types";
import { basicPresets } from "./presets/basic";
import { captionPresets } from "./presets/captions";
import { labelPresets } from "./presets/labels";
import { creativePresets } from "./presets/creative";
import { effectPresets } from "./presets/effects";

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
  ...creativePresets,
  ...effectPresets,
];
