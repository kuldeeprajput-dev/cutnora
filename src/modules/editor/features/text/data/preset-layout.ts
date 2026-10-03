import type { CSSProperties } from "react";
import type { TextPreset } from "./types";
import { getTextLayout, scaleTextStyle } from "../utils/text-layout";

export function getTextPresetPreviewStyle(
  style: TextPreset["style"],
): CSSProperties {
  const scale = 0.38;
  return {
    fontSize: Math.max(10, Math.round(style.fontSize * scale)),
    fontFamily: style.fontFamily,
    color: style.color,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle || "normal",
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
    letterSpacing:
      style.letterSpacing === undefined
        ? undefined
        : `${style.letterSpacing * scale}px`,
    backgroundColor: style.backgroundColor,
    padding: style.bgPadding
      ? `${Math.max(2, Math.round(style.bgPadding * scale))}px ${Math.max(4, Math.round(style.bgPadding * scale * 1.5))}px`
      : undefined,
    borderRadius: (style.bgRadius || 0) * scale,
    WebkitTextStroke: style.outlineWidth
      ? `${style.outlineWidth * scale}px ${style.outlineColor || "#000000"}`
      : undefined,
    textShadow: style.shadowColor
      ? `${(style.shadowOffsetX || 0) * scale}px ${(style.shadowOffsetY || 0) * scale}px ${(style.shadowBlur || 0) * scale}px ${style.shadowColor}`
      : undefined,
    lineHeight: style.lineHeight || 1.2,
  };
}

export function getTextPresetLayout(
  preset: TextPreset,
  canvasWidth: number,
  canvasHeight: number,
) {
  const { width: baseWidth, height: baseHeight, ...style } = preset.style;
  const scale = Math.min(canvasWidth / 1920, canvasHeight / 1080);
  const width = Math.max(1, Math.round(baseWidth * scale));
  const scaledStyle = scaleTextStyle(style, scale);
  const height = Math.max(
    1,
    Math.round(baseHeight * scale),
    getTextLayout(scaledStyle, width).height,
  );
  const margin = Math.round(Math.min(canvasWidth, canvasHeight) * 0.06);
  const x =
    preset.placement === "lower-left"
      ? margin
      : Math.round((canvasWidth - width) / 2);
  const y =
    preset.placement === "bottom" || preset.placement === "lower-left"
      ? canvasHeight - height - margin
      : preset.placement === "top"
        ? margin
        : Math.round((canvasHeight - height) / 2);
  return {
    width,
    height,
    x,
    y,
    textStyle: scaledStyle,
  };
}
