"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Clapperboard,
  Gauge,
  Link2,
  Link2Off,
  Monitor,
  Palette,
  RectangleVertical,
  RotateCcw,
  Share2,
  Smartphone,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { useProjectStore } from "@/modules/projects";
import type { AspectRatio } from "@/modules/projects/types";
import { Button } from "@/shared/components/ui/Button";
import { ColorPickerPopover } from "@/shared/components/ui/ColorPicker";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  formatName: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: "yt-video",
    platform: "YouTube",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "YouTube video",
  },
  {
    id: "yt-shorts",
    platform: "YouTube",
    formatName: "Shorts",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "YouTube Shorts",
  },
  {
    id: "yt-banner",
    platform: "YouTube",
    formatName: "Banner",
    width: 2560,
    height: 1440,
    aspectRatio: "16:9",
    name: "YouTube banner",
  },
  {
    id: "ig-reel",
    platform: "Instagram",
    formatName: "Reel / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Instagram Reel / Story",
  },
  {
    id: "ig-square",
    platform: "Instagram",
    formatName: "Square post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    name: "Instagram square post",
  },
  {
    id: "ig-portrait",
    platform: "Instagram",
    formatName: "Portrait post",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    name: "Instagram portrait post",
  },
  {
    id: "ig-landscape",
    platform: "Instagram",
    formatName: "Landscape",
    width: 1080,
    height: 608,
    aspectRatio: "16:9",
    name: "Instagram landscape",
  },
  {
    id: "x-video",
    platform: "Twitter / X",
    formatName: "Video",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    name: "X landscape video",
  },
  {
    id: "x-square",
    platform: "Twitter / X",
    formatName: "Square post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    name: "X square post",
  },
  {
    id: "li-video",
    platform: "LinkedIn",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "LinkedIn video",
  },
  {
    id: "li-square",
    platform: "LinkedIn",
    formatName: "Square post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    name: "LinkedIn square post",
  },
  {
    id: "tiktok-video",
    platform: "TikTok",
    formatName: "Video / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "TikTok video / Story",
  },
  {
    id: "fb-video",
    platform: "Facebook",
    formatName: "Video",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    name: "Facebook video",
  },
  {
    id: "fb-reel",
    platform: "Facebook",
    formatName: "Reel / Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Facebook Reel / Story",
  },
  {
    id: "fb-square",
    platform: "Facebook",
    formatName: "Square post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    name: "Facebook square post",
  },
  {
    id: "pin-video",
    platform: "Pinterest",
    formatName: "Video Pin",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    name: "Pinterest video Pin",
  },
  {
    id: "pin-standard",
    platform: "Pinterest",
    formatName: "Standard Pin",
    width: 1000,
    height: 1500,
    aspectRatio: "2:3",
    name: "Pinterest standard Pin",
  },
];

const PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "Twitter / X",
  "LinkedIn",
  "Pinterest",
];
const RATIOS: Array<{
  value: AspectRatio;
  label: string;
  width: number;
  height: number;
  Icon: typeof Monitor;
}> = [
  {
    value: "16:9",
    label: "Landscape",
    width: 1920,
    height: 1080,
    Icon: Monitor,
  },
  {
    value: "9:16",
    label: "Vertical",
    width: 1080,
    height: 1920,
    Icon: Smartphone,
  },
  { value: "1:1", label: "Square", width: 1080, height: 1080, Icon: Square },
  {
    value: "4:5",
    label: "Portrait",
    width: 1080,
    height: 1350,
    Icon: RectangleVertical,
  },
  {
    value: "2:3",
    label: "Poster",
    width: 1000,
    height: 1500,
    Icon: RectangleVertical,
  },
];
const FPS = [
  { value: 24, hint: "Cinema" },
  { value: 30, hint: "Standard" },
  { value: 60, hint: "Smooth" },
];

const CANVAS_COLOR_SWATCHES = [
  { label: "Black", hex: "#000000" },
  { label: "Studio dark", hex: "#121316" },
  { label: "Charcoal", hex: "#1E1F24" },
  { label: "Slate", hex: "#374151" },
  { label: "White", hex: "#FFFFFF" },
  { label: "Brand orange", hex: "#F97316" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Red", hex: "#EF4444" },
  { label: "Violet", hex: "#8B5CF6" },
  { label: "Blue", hex: "#3B82F6" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Emerald", hex: "#10B981" },
] as const;

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Monitor;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-studio-border/80 py-4 first:border-t-0">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised text-brand">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-studio-fg">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-[10px] leading-4 text-studio-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function CanvasColorControl({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  const committedColor = value.toUpperCase();
  const [draftColor, setDraftColor] = useState(committedColor);

  useEffect(() => {
    setDraftColor((currentColor) =>
      currentColor === committedColor ? currentColor : committedColor,
    );
  }, [committedColor]);

  const commitColor = (nextColor: string) => {
    const normalizedColor = nextColor.toUpperCase();
    setDraftColor(normalizedColor);
    if (normalizedColor !== committedColor) onCommit(normalizedColor);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-studio-border/90 bg-studio-bg/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div
        className="h-2 w-full transition-colors"
        style={{ backgroundColor: draftColor }}
        aria-hidden="true"
      />
      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-studio-fg">
              Canvas color
            </p>
            <p className="mt-0.5 text-[9px] leading-3.5 text-studio-muted">
              Used in empty and transparent areas.
            </p>
          </div>
          <ColorPickerPopover
            label="Canvas background color"
            value={draftColor}
            presets={CANVAS_COLOR_SWATCHES.map((swatch) => swatch.hex)}
            onChange={(hex) => setDraftColor(hex.toUpperCase())}
            onChangeEnd={commitColor}
            align="right"
            triggerClassName="h-9 w-[132px] shrink-0 bg-studio-panel px-2.5"
          />
        </div>

        <div
          role="radiogroup"
          aria-label="Canvas color presets"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {CANVAS_COLOR_SWATCHES.map((preset) => {
            const isSelected =
              draftColor.toUpperCase() === preset.hex.toUpperCase();
            return (
              <button
                key={preset.hex}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => commitColor(preset.hex)}
                title={`${preset.label} · ${preset.hex}`}
                aria-label={`Use ${preset.label} canvas color`}
                style={{ backgroundColor: preset.hex }}
                className={cn(
                  "relative h-7 w-7 rounded-md border shadow-sm transition-[transform,border-color,box-shadow] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-panel",
                  isSelected
                    ? "border-brand ring-1 ring-brand/70"
                    : "border-white/15 hover:border-white/35",
                )}
              >
                {isSelected ? (
                  <Check
                    className={cn(
                      "absolute inset-0 m-auto h-3.5 w-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]",
                      preset.hex === "#FFFFFF"
                        ? "text-studio-bg"
                        : "text-white",
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getRatio(ratio: AspectRatio, width: number, height: number) {
  const [w, h] = String(ratio).split(":").map(Number);
  return w > 0 && h > 0 ? w / h : Math.max(1, width) / Math.max(1, height);
}

export function CanvasSettingsPanel() {
  const settings = useProjectStore((state) => state.currentProject?.settings);
  const updateSettings = useProjectStore(
    (state) => state.updateProjectSettings,
  );
  const [linked, setLinked] = useState(true);
  const [presetId, setPresetId] = useState("");

  const matchedPreset = settings
    ? (SOCIAL_PRESETS.find(
        (preset) =>
          preset.width === settings.width && preset.height === settings.height,
      ) ?? null)
    : null;

  if (!settings) return null;
  const activePreset =
    SOCIAL_PRESETS.find((preset) => preset.id === presetId) ?? matchedPreset;

  const updateDimension = (key: "width" | "height", raw: string) => {
    const value = Math.min(7680, Math.max(64, Number.parseInt(raw, 10) || 64));
    const ratio = getRatio(
      settings.aspectRatio,
      settings.width,
      settings.height,
    );
    const dimensions =
      key === "width"
        ? {
            width: value,
            ...(linked ? { height: Math.round(value / ratio) } : {}),
          }
        : {
            height: value,
            ...(linked ? { width: Math.round(value * ratio) } : {}),
          };
    setPresetId("");
    updateSettings({
      ...dimensions,
      aspectRatio: linked ? settings.aspectRatio : "custom",
    });
  };

  return (
    <div className="flex flex-col pb-2 text-studio-fg">
      <div className="mb-3 rounded-xl border border-brand/30 bg-brand/[0.08] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
              <Sparkles className="h-3 w-3" /> Current format
            </div>
            <p className="mt-1.5 text-sm font-semibold text-studio-fg">
              {settings.aspectRatio === "custom"
                ? "Custom canvas"
                : `${settings.aspectRatio} canvas`}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-studio-muted">
              {settings.width} × {settings.height} px · {settings.fps} FPS
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-studio-bg/40 text-brand">
            <Clapperboard className="h-4 w-4" />
          </span>
        </div>
      </div>

      <SettingsSection
        icon={Share2}
        title="Format"
        description="Use a publishing preset or choose a frame shape."
      >
        <label
          className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-studio-muted"
          htmlFor="canvas-preset"
        >
          Publishing preset
        </label>
        <Select
          id="canvas-preset"
          value={activePreset?.id ?? ""}
          onChange={(event) => {
            const preset = SOCIAL_PRESETS.find(
              (item) => item.id === event.target.value,
            );
            if (!preset) return;
            setPresetId(preset.id);
            updateSettings({
              width: preset.width,
              height: preset.height,
              aspectRatio: preset.aspectRatio,
            });
          }}
          className="h-9 text-xs"
        >
          <option value="">Custom project format</option>
          {PLATFORMS.map((platform) => (
            <optgroup key={platform} label={platform}>
              {SOCIAL_PRESETS.filter(
                (preset) => preset.platform === platform,
              ).map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.formatName} — {preset.width}×{preset.height}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {RATIOS.map((ratio) => {
            const active = settings.aspectRatio === ratio.value;
            return (
              <button
                key={ratio.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPresetId("");
                  updateSettings({
                    width: ratio.width,
                    height: ratio.height,
                    aspectRatio: ratio.value,
                  });
                }}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition-[background-color,border-color,color,transform] active:scale-[0.98]",
                  active
                    ? "border-brand bg-brand/15 text-brand"
                    : "border-studio-border bg-studio-bg/45 text-studio-muted hover:border-brand/50 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                {active ? (
                  <Check className="absolute right-1.5 top-1.5 h-3 w-3" />
                ) : null}
                <ratio.Icon className="mb-1 h-4 w-4" />
                <span className="text-[10px] font-semibold">{ratio.value}</span>
                <span className="mt-0.5 text-[8px] text-studio-muted">
                  {ratio.label}
                </span>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={linked ? Link2 : Link2Off}
        title="Resolution"
        description="Linked dimensions preserve the selected frame shape."
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-studio-muted">
            Width
            <div className="relative mt-1.5">
              <Input
                type="number"
                min={64}
                max={7680}
                value={settings.width}
                onChange={(event) =>
                  updateDimension("width", event.target.value)
                }
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </label>
          <button
            type="button"
            onClick={() => setLinked((value) => !value)}
            aria-label={
              linked ? "Unlink canvas dimensions" : "Link canvas dimensions"
            }
            aria-pressed={linked}
            className={cn(
              "mb-0.5 flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              linked
                ? "border-brand/40 bg-brand/15 text-brand"
                : "border-studio-border bg-studio-bg text-studio-muted hover:text-studio-fg",
            )}
          >
            {linked ? (
              <Link2 className="h-3.5 w-3.5" />
            ) : (
              <Link2Off className="h-3.5 w-3.5" />
            )}
          </button>
          <label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-studio-muted">
            Height
            <div className="relative mt-1.5">
              <Input
                type="number"
                min={64}
                max={7680}
                value={settings.height}
                onChange={(event) =>
                  updateDimension("height", event.target.value)
                }
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </label>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Gauge}
        title="Frame rate"
        description="Frames rendered per second."
      >
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-studio-border bg-studio-bg/50 p-1">
          {FPS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateSettings({ fps: option.value })}
              aria-pressed={settings.fps === option.value}
              className={cn(
                "rounded-md px-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                settings.fps === option.value
                  ? "bg-brand text-white shadow-sm"
                  : "text-studio-muted hover:bg-studio-panel-raised hover:text-studio-fg",
              )}
            >
              <span className="block text-xs font-bold">{option.value}</span>
              <span
                className={cn(
                  "block text-[8px]",
                  settings.fps === option.value
                    ? "text-white/75"
                    : "text-studio-muted",
                )}
              >
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="The background color behind transparent media."
      >
        <CanvasColorControl
          value={settings.backgroundColor}
          onCommit={(backgroundColor) =>
            updateSettings({ backgroundColor }, { recordHistory: true })
          }
        />
      </SettingsSection>

      <SettingsSection
        icon={Volume2}
        title="Master audio"
        description="Controls the final project output level."
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-medium text-studio-muted">
            Output level
          </span>
          <span className="rounded-md border border-studio-border bg-studio-bg px-1.5 py-0.5 font-mono text-[10px] text-studio-fg">
            {Math.round(settings.masterVolume * 100)}%
          </span>
        </div>
        <Slider
          value={settings.masterVolume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => updateSettings({ masterVolume: value })}
        />
      </SettingsSection>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setLinked(true);
          setPresetId("");
          updateSettings({
            width: 1920,
            height: 1080,
            aspectRatio: "16:9",
            fps: 30,
            backgroundColor: "#000000",
            masterVolume: 1,
          });
        }}
        className="w-full justify-center border border-transparent text-studio-muted hover:border-studio-border"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset canvas settings
      </Button>
    </div>
  );
}
