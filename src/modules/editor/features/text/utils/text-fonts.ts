import type { TextStyle } from "@/modules/editor/types";

export const textFontFamilies = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Anton", value: "Anton, Impact, sans-serif" },
  { label: "Oswald", value: "Oswald, sans-serif" },
  { label: "Playfair Display", value: "Playfair Display, Georgia, serif" },
  {
    label: "Dancing Script",
    value: "Dancing Script, Caveat, Brush Script MT, cursive",
  },
  { label: "Great Vibes", value: "Great Vibes, Brush Script MT, cursive" },
  { label: "Pacifico", value: "Pacifico, Comic Sans MS, cursive" },
  { label: "Space Mono", value: "Space Mono, monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

export async function loadTextFonts(styles: TextStyle[]): Promise<void> {
  if (!document.fonts) return;
  const fontRequests = new Map<string, string>();
  for (const style of styles) {
    const font = `${style.fontStyle || "normal"} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    fontRequests.set(font, (fontRequests.get(font) || "") + style.text);
  }
  await Promise.all(
    [...fontRequests].map(([font, text]) => document.fonts.load(font, text)),
  );
}
