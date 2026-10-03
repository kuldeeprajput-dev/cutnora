import type { TextStyle, TimelineClip } from "@/modules/editor/types";

export const MIN_TEXT_FONT_SIZE = 10;
export const MAX_TEXT_FONT_SIZE = 400;
export const defaultTextStyle: Omit<TextStyle, "text"> = {
  fontSize: 48,
  fontFamily: "Inter, sans-serif",
  color: "#FFFFFF",
  textAlign: "center",
  fontWeight: "bold",
};

export function getTextPadding(style: TextStyle) {
  return Math.max(0, style.bgPadding ?? 8);
}

export function getTextFont(style: TextStyle) {
  return `${style.fontStyle || "normal"} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
}

export function getDisplayText(style: TextStyle) {
  const text = style.text.replace(/\r\n?/g, "\n");
  if (style.textTransform === "uppercase") return text.toUpperCase();
  if (style.textTransform === "lowercase") return text.toLowerCase();
  if (style.textTransform === "capitalize") {
    return text.replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
  }
  return text;
}

let measurementContext: CanvasRenderingContext2D | null = null;

export function getTextLayout(
  style: TextStyle,
  width: number,
  measure?: (text: string) => number,
) {
  if (!measure && typeof document !== "undefined") {
    measurementContext ??= document.createElement("canvas").getContext("2d");
    if (measurementContext) {
      measurementContext.font = getTextFont(style);
      measurementContext.letterSpacing = "0px";
      measure = (text) => measurementContext!.measureText(text).width;
    }
  }
  const measureGlyphs = measure || ((text) => Array.from(text).length * style.fontSize * 0.6);
  const measureWidth = (text: string) =>
    measureGlyphs(text) + Math.max(0, Array.from(text).length - 1) * (style.letterSpacing || 0);
  const padding = getTextPadding(style);
  const availableWidth = Math.max(1, width - padding * 2);
  const paragraphs = getDisplayText(style).split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    let line = "";
    for (const token of paragraph.match(/\s+|\S+/gu) || []) {
      if (measureWidth(line + token) <= availableWidth) {
        line += token;
        continue;
      }
      if (line) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (!token.trim()) continue;
      for (const character of Array.from(token)) {
        if (line && measureWidth(line + character) > availableWidth) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }

  const lineHeight = style.fontSize * (style.lineHeight || 1.2);
  return {
    lines,
    padding,
    lineHeight,
    height: Math.ceil(lines.length * lineHeight + padding * 2),
    naturalWidth: Math.ceil(Math.max(...paragraphs.map(measureWidth)) + padding * 2),
  };
}

export function scaleTextStyle(style: TextStyle, scale: number): TextStyle {
  const scaled = { ...style, fontSize: style.fontSize * scale, bgPadding: getTextPadding(style) * scale };
  const scalableProps = ["letterSpacing", "bgRadius", "outlineWidth", "shadowBlur", "shadowOffsetX", "shadowOffsetY"] as const;
  for (const key of scalableProps) {
    if (style[key] !== undefined) scaled[key] = style[key] * scale;
  }
  return scaled;
}

export function clampTextScale(style: TextStyle, width: number, height: number, scale: number) {
  const minScale = Math.max(MIN_TEXT_FONT_SIZE / style.fontSize, 20 / width, 20 / height);
  const maxScale = MAX_TEXT_FONT_SIZE / style.fontSize;
  return Math.max(minScale, Math.min(maxScale, scale));
}

export function fitTextBox(transform: TimelineClip["transform"], style: TextStyle, width = transform.width) {
  const height = Math.max(20, getTextLayout(style, width).height);
  return {
    ...transform,
    x: transform.x + (transform.width - width) / 2,
    y: transform.y + (transform.height - height) / 2,
    width,
    height,
  };
}
