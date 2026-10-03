"use client";

import React, { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Maximize2,
  Minus,
  Palette,
  Plus,
  Sparkles,
  Square,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import type { TextStyle, TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import {
  InspectorColorControl,
  InspectorControlLabel,
  InspectorResetButton,
  InspectorSection,
  InspectorSliderHeader,
} from "@/modules/editor/features/inspector/components/InspectorControls";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";
import { textFontFamilies } from "../utils/text-fonts";
import {
  defaultTextStyle,
  fitTextBox,
  getTextLayout,
  MIN_TEXT_FONT_SIZE,
  MAX_TEXT_FONT_SIZE,
} from "../utils/text-layout";

export interface TextInspectorTabProps {
  clip: TimelineClip;
}

const formatButtonClass =
  "flex h-7 items-center justify-center rounded-md border text-xs transition-colors focus-visible:outline-none cursor-pointer";

export function TextInspectorTab({ clip }: TextInspectorTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const canvasWidth = useProjectStore(
    (state) => state.currentProject?.settings.width || 1920,
  );
  const [fontSizeDraft, setFontSizeDraft] = useState<string | null>(null);

  const textStyle: TextStyle = clip.textStyle || {
    ...defaultTextStyle,
    text: clip.name || "Sample Text",
  };

  const updateTextStyle = (updates: Partial<TextStyle>) => {
    const updatedStyle = { ...textStyle, ...updates };
    const affectsLayout = [
      "text",
      "fontSize",
      "fontFamily",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "lineHeight",
      "bgPadding",
      "textTransform",
    ].some((key) => key in updates);
    updateClip(clip.id, {
      name:
        updates.text !== undefined
          ? updates.text.slice(0, 20) || "Text"
          : clip.name,
      textStyle: updatedStyle,
      ...(affectsLayout
        ? { transform: fitTextBox(clip.transform, updatedStyle) }
        : {}),
    });
  };

  const activeClass =
    "border-studio-border bg-studio-hover text-studio-fg font-semibold shadow-xs";
  const idleClass =
    "border-studio-border bg-studio-panel-raised/50 text-studio-muted hover:border-studio-border-strong hover:bg-studio-hover hover:text-studio-fg";

  return (
    <div className="flex flex-col text-xs text-studio-fg pb-3 select-none">
      <InspectorSection
        icon={Type}
        title="Text content"
      >
        <textarea
          aria-label="Text content"
          rows={3}
          value={textStyle.text}
          onChange={(event) => updateTextStyle({ text: event.target.value })}
          className="w-full resize-none rounded-lg border border-studio-border bg-studio-panel-raised/60 p-2.5 text-xs leading-5 text-studio-fg focus:border-studio-fg/40 focus:outline-none"
        />
      </InspectorSection>

      <InspectorSection
        icon={Type}
        title="Typography"
      >
        <p className="mb-2 text-[11px] leading-4 text-studio-muted">
          Drag corners to scale text. Drag sides to change wrapping.
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2.5">
          <div className="min-w-0">
            <InspectorControlLabel htmlFor="text-font-family">
              Font family
            </InspectorControlLabel>
            <Select
              id="text-font-family"
              value={textStyle.fontFamily}
              onChange={(event) =>
                updateTextStyle({ fontFamily: event.target.value })
              }
              className="mt-1.5 h-9 text-xs"
            >
              {!textFontFamilies.some(
                (font) => font.value === textStyle.fontFamily,
              ) && (
                <option value={textStyle.fontFamily}>
                  {textStyle.fontFamily.split(",")[0]}
                </option>
              )}
              {textFontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-0">
            <InspectorControlLabel htmlFor="text-font-size">
              Size
            </InspectorControlLabel>
            <div className="flex items-center gap-1 mt-1.5">
              <button
                type="button"
                aria-label="Decrease font size"
                onClick={() =>
                  updateTextStyle({
                    fontSize: Math.max(
                      MIN_TEXT_FONT_SIZE,
                      Math.round(textStyle.fontSize - 4),
                    ),
                  })
                }
                className="flex h-11 lg:h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg"
              >
                <Minus className="h-3 w-3" />
              </button>
              <div className="relative min-w-0 flex-1">
                <Input
                  id="text-font-size"
                  type="number"
                  min={MIN_TEXT_FONT_SIZE}
                  max={MAX_TEXT_FONT_SIZE}
                  step="1"
                  value={
                    fontSizeDraft ?? Math.round(textStyle.fontSize * 100) / 100
                  }
                  onFocus={() =>
                    setFontSizeDraft(
                      String(Math.round(textStyle.fontSize * 100) / 100),
                    )
                  }
                  onBlur={() => setFontSizeDraft(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  onChange={(event) => {
                    setFontSizeDraft(event.target.value);
                    const value = event.target.valueAsNumber;
                    if (
                      Number.isFinite(value) &&
                      value >= MIN_TEXT_FONT_SIZE &&
                      value <= MAX_TEXT_FONT_SIZE
                    )
                      updateTextStyle({ fontSize: value });
                  }}
                  className="h-11 lg:h-9 pr-6 font-mono text-base lg:text-xs"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                  px
                </span>
              </div>
              <button
                type="button"
                aria-label="Increase font size"
                onClick={() =>
                  updateTextStyle({
                    fontSize: Math.min(
                      MAX_TEXT_FONT_SIZE,
                      Math.round(textStyle.fontSize + 4),
                    ),
                  })
                }
                className="flex h-11 lg:h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[16, 24, 32, 48, 64, 80, 100].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateTextStyle({ fontSize: size })}
              className={cn(
                "h-6 px-1.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer shrink-0",
                Math.round(textStyle.fontSize) === size ? activeClass : idleClass,
              )}
            >
              {size}px
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const width = Math.min(
              canvasWidth * 0.9,
              Math.max(
                20,
                getTextLayout(textStyle, clip.transform.width).naturalWidth,
              ),
            );
            updateClip(clip.id, {
              transform: fitTextBox(clip.transform, textStyle, width),
            });
          }}
          className="mt-2 flex min-h-11 lg:min-h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-studio-border bg-studio-panel-raised/50 text-xs text-studio-muted hover:bg-studio-hover hover:text-studio-fg"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Fit text box
        </button>

        <InspectorControlLabel>Style & alignment</InspectorControlLabel>
        <div className="mt-1.5 grid grid-cols-7 gap-1 rounded-lg border border-studio-border bg-studio-panel-raised/50 p-1">
          <button
            type="button"
            aria-label="Bold"
            aria-pressed={textStyle.fontWeight === "bold"}
            onClick={() =>
              updateTextStyle({
                fontWeight: textStyle.fontWeight === "bold" ? "normal" : "bold",
              })
            }
            className={cn(
              formatButtonClass,
              textStyle.fontWeight === "bold" ? activeClass : idleClass,
            )}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Italic"
            aria-pressed={textStyle.fontStyle === "italic"}
            onClick={() =>
              updateTextStyle({
                fontStyle:
                  textStyle.fontStyle === "italic" ? "normal" : "italic",
              })
            }
            className={cn(
              formatButtonClass,
              textStyle.fontStyle === "italic" ? activeClass : idleClass,
            )}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Underline"
            aria-pressed={textStyle.textDecoration === "underline"}
            onClick={() =>
              updateTextStyle({
                textDecoration:
                  textStyle.textDecoration === "underline" ? "none" : "underline",
              })
            }
            className={cn(
              formatButtonClass,
              textStyle.textDecoration === "underline" ? activeClass : idleClass,
            )}
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Strikethrough"
            aria-pressed={textStyle.textDecoration === "line-through"}
            onClick={() =>
              updateTextStyle({
                textDecoration:
                  textStyle.textDecoration === "line-through"
                    ? "none"
                    : "line-through",
              })
            }
            className={cn(
              formatButtonClass,
              textStyle.textDecoration === "line-through" ? activeClass : idleClass,
            )}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          {[
            { value: "left", label: "Align left", Icon: AlignLeft },
            { value: "center", label: "Align center", Icon: AlignCenter },
            { value: "right", label: "Align right", Icon: AlignRight },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={textStyle.textAlign === value}
              onClick={() =>
                updateTextStyle({
                  textAlign: value as TextStyle["textAlign"],
                })
              }
              className={cn(
                formatButtonClass,
                textStyle.textAlign === value ? activeClass : idleClass,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="mt-2.5">
          <InspectorControlLabel>Text case</InspectorControlLabel>
          <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-lg border border-studio-border bg-studio-panel-raised/50 p-1">
            {[
              { value: "none", label: "Default case", text: "Aa" },
              { value: "uppercase", label: "Uppercase", text: "AA" },
              { value: "lowercase", label: "Lowercase", text: "aa" },
              { value: "capitalize", label: "Title Case", text: "Ab" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                aria-label={item.label}
                aria-pressed={(textStyle.textTransform || "none") === item.value}
                onClick={() =>
                  updateTextStyle({
                    textTransform: item.value as TextStyle["textTransform"],
                  })
                }
                className={cn(
                  formatButtonClass,
                  (textStyle.textTransform || "none") === item.value
                    ? activeClass
                    : idleClass,
                )}
              >
                <span className="text-[11px] font-semibold">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-3.5">
          <div>
            <InspectorSliderHeader
              label="Line height"
              value={(textStyle.lineHeight || 1.2).toFixed(1)}
            />
            <Slider
              aria-label="Line height"
              value={textStyle.lineHeight || 1.2}
              min={0.8}
              max={2.5}
              step={0.1}
              onValueChange={(value) =>
                updateTextStyle({ lineHeight: value })
              }
            />
          </div>
          <div>
            <InspectorSliderHeader
              label="Letter spacing"
              value={`${textStyle.letterSpacing || 0}px`}
            />
            <Slider
              aria-label="Letter spacing"
              value={textStyle.letterSpacing || 0}
              min={-5}
              max={30}
              step={1}
              onValueChange={(value) =>
                updateTextStyle({ letterSpacing: value })
              }
            />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Palette}
        title="Colors"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <InspectorColorControl
            label="Text color"
            value={textStyle.color || "#FFFFFF"}
            onChange={(value) => updateTextStyle({ color: value })}
          />
          <InspectorColorControl
            label="Background"
            value={textStyle.backgroundColor || "#000000"}
            onChange={(value) =>
              updateTextStyle({ backgroundColor: value })
            }
          />
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Square}
        title="Text background"
      >
        <div className="space-y-3.5">
          <div>
            <InspectorSliderHeader
              label="Padding"
              value={`${textStyle.bgPadding || 0}px`}
            />
            <Slider
              aria-label="Background padding"
              value={textStyle.bgPadding || 0}
              min={0}
              max={40}
              step={1}
              onValueChange={(value) =>
                updateTextStyle({ bgPadding: value })
              }
            />
          </div>
          <div>
            <InspectorSliderHeader
              label="Corner radius"
              value={`${textStyle.bgRadius || 0}px`}
            />
            <Slider
              aria-label="Background corner radius"
              value={textStyle.bgRadius || 0}
              min={0}
              max={40}
              step={1}
              onValueChange={(value) =>
                updateTextStyle({ bgRadius: value })
              }
            />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={Sparkles}
        title="Outline & shadow"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <InspectorColorControl
            label="Outline"
            value={textStyle.outlineColor || "#000000"}
            onChange={(value) =>
              updateTextStyle({ outlineColor: value })
            }
          />
          <InspectorColorControl
            label="Shadow"
            value={textStyle.shadowColor || "#000000"}
            onChange={(value) =>
              updateTextStyle({ shadowColor: value })
            }
          />
        </div>
        <div className="mt-3 space-y-3.5">
          {[
            {
              label: "Outline width",
              value: textStyle.outlineWidth || 0,
              min: 0,
              max: 10,
              key: "outlineWidth",
            },
            {
              label: "Shadow blur",
              value: textStyle.shadowBlur || 0,
              min: 0,
              max: 30,
              key: "shadowBlur",
            },
            {
              label: "Shadow offset X",
              value: textStyle.shadowOffsetX || 0,
              min: -20,
              max: 20,
              key: "shadowOffsetX",
            },
            {
              label: "Shadow offset Y",
              value: textStyle.shadowOffsetY || 0,
              min: -20,
              max: 20,
              key: "shadowOffsetY",
            },
          ].map((control) => (
            <div key={control.key}>
              <InspectorSliderHeader
                label={control.label}
                value={`${control.value}px`}
              />
              <Slider
                aria-label={control.label}
                value={control.value}
                min={control.min}
                max={control.max}
                step={1}
                onValueChange={(value) =>
                  updateTextStyle({
                    [control.key]: value,
                  } as Partial<TextStyle>)
                }
              />
            </div>
          ))}
        </div>
      </InspectorSection>
      <InspectorResetButton
        onClick={() =>
          updateClip(clip.id, {
            textStyle: { ...defaultTextStyle, text: textStyle.text },
            transform: fitTextBox(clip.transform, {
              ...defaultTextStyle,
              text: textStyle.text,
            }),
          })
        }
      >
        Reset text
      </InspectorResetButton>
    </div>
  );
}
