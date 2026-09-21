"use client";

import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Palette,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import type { TextStyle, TimelineClip } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import {
  InspectorColorControl,
  InspectorControlLabel,
  InspectorSection,
  InspectorSliderHeader,
} from "@/modules/editor/features/inspector/components/InspectorControls";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

export interface TextInspectorTabProps {
  clip: TimelineClip;
}

const fontFamilies = [
  { label: "Inter (Sans-Serif)", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New (Monospace)", value: "Courier New, monospace" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const formatButtonClass =
  "flex h-7 items-center justify-center rounded-md border text-xs transition-colors focus-visible:outline-none cursor-pointer";

export function TextInspectorTab({ clip }: TextInspectorTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);

  const textStyle: TextStyle = clip.textStyle || {
    text: clip.name || "Sample Text",
    fontSize: 48,
    fontFamily: "Inter, sans-serif",
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  };

  const updateTextStyle = (updates: Partial<TextStyle>) => {
    const updatedStyle = { ...textStyle, ...updates };
    updateClip(clip.id, {
      name:
        updates.text !== undefined
          ? updates.text.slice(0, 20) || "Text"
          : clip.name,
      textStyle: updatedStyle,
    });
  };

  const activeClass = "border-white/25 bg-white/15 text-white font-semibold shadow-xs";
  const idleClass =
    "border-white/[0.06] bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white";

  return (
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      <InspectorSection
        icon={Type}
        title="Text content"
      >
        <textarea
          aria-label="Text content"
          rows={3}
          value={textStyle.text}
          onChange={(event) => updateTextStyle({ text: event.target.value })}
          className="w-full resize-none rounded-lg border border-white/10 bg-[#141414] p-2.5 text-xs leading-5 text-white focus:border-white/30 focus:outline-none"
        />
      </InspectorSection>

      <InspectorSection
        icon={Type}
        title="Typography"
      >
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
              {fontFamilies.map((font) => (
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
            <div className="relative mt-1.5">
              <Input
                id="text-font-size"
                type="number"
                min={10}
                max={200}
                value={textStyle.fontSize}
                onChange={(event) =>
                  updateTextStyle({
                    fontSize: Number.parseInt(event.target.value, 10) || 48,
                  })
                }
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </div>
        </div>

        <InspectorControlLabel>Style & alignment</InspectorControlLabel>
        <div className="mt-1.5 grid grid-cols-5 gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          <button
            type="button"
            aria-label="Bold"
            aria-pressed={textStyle.fontWeight === "bold"}
            onClick={() =>
              updateTextStyle({
                fontWeight:
                  textStyle.fontWeight === "bold" ? "normal" : "bold",
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
    </div>
  );
}
