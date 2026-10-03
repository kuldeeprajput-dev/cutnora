"use client";

import React, { useEffect, useRef, useState } from "react";
import type { TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { AlertTriangle } from "lucide-react";
import {
  defaultTextStyle,
  fitTextBox,
  getTextLayout,
} from "@/modules/editor/features/text/utils/text-layout";

export interface TextLayerProps {
  clip: TimelineClip;
  stageScale: number;
}

export const TextLayer = React.memo(function TextLayer({
  clip,
  stageScale,
}: TextLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const editingRef = useRef(false);
  const [, refreshFonts] = useState(0);
  const { updateClip, currentProject } = useProjectStore();
  const textStyle = clip.textStyle || {
    ...defaultTextStyle,
    text: clip.name || "Sample Text",
  };
  const fontKey = `${textStyle.fontStyle || "normal"} ${textStyle.fontWeight} 48px ${textStyle.fontFamily}`;

  useEffect(() => {
    if (!document.fonts) return;
    let active = true;
    const triggerRefresh = () => { if (active) refreshFonts((v) => v + 1); };
    document.fonts.load(fontKey).then(triggerRefresh, triggerRefresh);
    return () => { active = false; };
  }, [fontKey]);

  const layout = getTextLayout(textStyle, clip.transform.width);
  const startEditing = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (editingRef.current) return;
    setTextInput(textStyle.text);
    editingRef.current = true;
    setIsEditing(true);
  };
  const finishEditing = (cancel = false) => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setIsEditing(false);
    if (cancel || textInput === textStyle.text) return;
    const updatedStyle = { ...textStyle, text: textInput };
    updateClip(clip.id, {
      name: textInput.slice(0, 20) || "Text",
      textStyle: updatedStyle,
      transform: fitTextBox(clip.transform, updatedStyle),
    });
  };
  const projectWidth = currentProject?.settings.width || 1920;
  const projectHeight = currentProject?.settings.height || 1080;
  const isOverflowing =
    clip.transform.x < 0 || clip.transform.y < 0 ||
    clip.transform.x + clip.transform.width > projectWidth ||
    clip.transform.y + clip.transform.height > projectHeight;
  const hasClippedText = layout.height > clip.transform.height + 1;

  // Text uses project pixels inside a scaled wrapper, just like its selection.
  const style: React.CSSProperties = {
    width: clip.transform.width,
    height: clip.transform.height,
    transform: `scale(${stageScale})`,
    transformOrigin: "top left",
    fontSize: textStyle.fontSize,
    fontFamily: textStyle.fontFamily,
    color: textStyle.color,
    fontWeight: textStyle.fontWeight,
    fontStyle: textStyle.fontStyle || "normal",
    textDecoration: textStyle.textDecoration,
    textTransform: textStyle.textTransform,
    textAlign: textStyle.textAlign,
    lineHeight: textStyle.lineHeight || 1.2,
    letterSpacing: textStyle.letterSpacing || 0,
    backgroundColor: textStyle.backgroundColor,
    padding: layout.padding,
    opacity: clip.transform.opacity,
    borderRadius: textStyle.bgRadius || 0,
    textShadow: textStyle.shadowColor ? `${textStyle.shadowOffsetX || 0}px ${textStyle.shadowOffsetY || 0}px ${textStyle.shadowBlur || 0}px ${textStyle.shadowColor}` : undefined,
    WebkitTextStroke: textStyle.outlineWidth ? `${textStyle.outlineWidth}px ${textStyle.outlineColor || "#000000"}` : undefined,
    paintOrder: "stroke fill",
  };

  return (
    <div
      onDoubleClick={startEditing}
      style={style}
      className="group/text relative flex items-center justify-center select-none overflow-hidden"
      title={
        hasClippedText
          ? "Text exceeds this box. Use Fit text box in Text properties."
          : "Double-click to edit text"
      }
    >
      {isEditing ? (
        <textarea
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          onBlur={() => finishEditing()}
          autoFocus
          aria-label="Edit canvas text"
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              finishEditing(true);
            } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              finishEditing();
            }
          }}
          className="h-full w-full resize-none border-0 bg-transparent p-0 focus:outline-none"
          style={{ font: "inherit", color: "inherit", textAlign: "inherit", letterSpacing: "inherit", lineHeight: "inherit", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        />
      ) : (
        <span className="w-full whitespace-pre">
          {layout.lines.map((line, index) => (
            <span key={index} className="block">
              {line || "\u00a0"}
            </span>
          ))}
        </span>
      )}
      {(isOverflowing || hasClippedText) && !isEditing && (
        <div
          className="absolute right-1 top-1 z-40 rounded-full bg-brand p-1 text-brand-contrast shadow-lg opacity-0 group-hover/text:opacity-100"
          title={
            hasClippedText
              ? "Text exceeds its box. Use Fit text box."
              : "Clip extends outside the canvas."
          }
        >
          <AlertTriangle className="h-3 w-3" />
        </div>
      )}
    </div>
  );
});
