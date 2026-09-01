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
  Smartphone,
  Sparkles,
  Square,
  Volume2,
  ArrowLeftRight,
  Film,
} from "lucide-react";
import { useProjectStore } from "@/modules/projects";
import type { AspectRatio } from "@/modules/projects/types";
import { Button } from "@/shared/components/ui/Button";
import { ColorPickerPopover } from "@/shared/components/ui/ColorPicker";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";
import { cn } from "@/shared/utils/cn";

import {
  SOCIAL_PRESETS,
  PLATFORMS,
  POPULAR_FORMATS,
  QUALITY_PRESETS,
  FPS_OPTIONS,
  CANVAS_COLOR_SWATCHES,
  getAspectRatioMultiplier,
  type SocialPreset,
} from "../constants/canvasPresets";

export type { SocialPreset };

export function CanvasSettingsPanel() {
  const settings = useProjectStore((state) => state.currentProject?.settings);
  const updateSettings = useProjectStore(
    (state) => state.updateProjectSettings,
  );
  const settingsWidth = settings?.width;
  const settingsHeight = settings?.height;
  const [linked, setLinked] = useState(true);
  const [customResolutionOpen, setCustomResolutionOpen] = useState(false);
  const [presetId, setPresetId] = useState("");
  const [dimensionDraft, setDimensionDraft] = useState(() => ({
    width: settingsWidth === undefined ? "" : String(settingsWidth),
    height: settingsHeight === undefined ? "" : String(settingsHeight),
  }));

  useEffect(() => {
    if (settingsWidth === undefined || settingsHeight === undefined) return;
    setDimensionDraft({
      width: String(settingsWidth),
      height: String(settingsHeight),
    });
  }, [settingsWidth, settingsHeight]);

  if (!settings) return null;

  const matchedPreset = SOCIAL_PRESETS.find(
    (preset) =>
      preset.width === settings.width && preset.height === settings.height,
  );
  const activePreset =
    SOCIAL_PRESETS.find((preset) => preset.id === presetId) ?? matchedPreset;

  const commitDimension = (key: "width" | "height") => {
    const raw = dimensionDraft[key].trim();
    const parsed = Number.parseInt(raw, 10);

    if (!raw || !Number.isFinite(parsed)) {
      setDimensionDraft({
        width: String(settings.width),
        height: String(settings.height),
      });
      return;
    }

    const value = Math.min(7680, Math.max(64, parsed));
    const ratio = getAspectRatioMultiplier(
      settings.aspectRatio,
      settings.width,
      settings.height,
    );
    let dimensions: { width: number; height: number };

    if (!linked) {
      dimensions = {
        width: key === "width" ? value : settings.width,
        height: key === "height" ? value : settings.height,
      };
    } else if (key === "width") {
      const height = Math.round(value / ratio);
      dimensions =
        height < 64
          ? { width: Math.round(64 * ratio), height: 64 }
          : height > 7680
            ? { width: Math.round(7680 * ratio), height: 7680 }
            : { width: value, height };
    } else {
      const width = Math.round(value * ratio);
      dimensions =
        width < 64
          ? { width: 64, height: Math.round(64 / ratio) }
          : width > 7680
            ? { width: 7680, height: Math.round(7680 / ratio) }
            : { width, height: value };
    }

    setDimensionDraft({
      width: String(dimensions.width),
      height: String(dimensions.height),
    });
    setPresetId("");
    updateSettings({
      ...dimensions,
      aspectRatio: linked ? settings.aspectRatio : "custom",
    });
  };

  const handleApplyResolutionScale = (baseW: number, baseH: number) => {
    const isPortrait = settings.height > settings.width;
    const nextW = isPortrait ? Math.min(baseW, baseH) : Math.max(baseW, baseH);
    const nextH = isPortrait ? Math.max(baseW, baseH) : Math.min(baseW, baseH);

    updateSettings({
      width: nextW,
      height: nextH,
    });
  };

  const handleSwapOrientation = () => {
    const newW = settings.height;
    const newH = settings.width;
    const swappedRatio =
      settings.aspectRatio === "16:9"
        ? ("9:16" as AspectRatio)
        : settings.aspectRatio === "9:16"
        ? ("16:9" as AspectRatio)
        : settings.aspectRatio === "4:5"
        ? ("16:9" as AspectRatio)
        : settings.aspectRatio;

    updateSettings({
      width: newW,
      height: newH,
      aspectRatio: swappedRatio,
    });
  };

  const getFormatLabel = () => {
    if (activePreset) return activePreset.name;
    const matched = POPULAR_FORMATS.find((f) => f.ratio === settings.aspectRatio);
    if (matched) return `${matched.title} (${matched.ratio})`;
    return `${settings.aspectRatio} Custom Format`;
  };

  return (
    <div className="flex flex-col gap-4 pb-2 text-studio-fg">
      {/* 1. Header Format Card with Live Mini Canvas Wireframe */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Top row: Status Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                Active Canvas
              </span>
              <span className="text-[10px] font-semibold text-studio-muted">
                {settings.aspectRatio === "custom" ? "Custom Ratio" : `${settings.aspectRatio} Ratio`}
              </span>
            </div>

            {/* Format Title */}
            <p className="mt-1.5 text-sm font-bold text-studio-fg truncate">
              {getFormatLabel()}
            </p>

            {/* Specs Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="rounded-md border border-studio-border bg-studio-panel px-2 py-0.5 font-medium text-studio-fg">
                {settings.width} × {settings.height} px
              </span>
              <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 font-bold text-brand">
                {Math.max(settings.width, settings.height) >= 3840
                  ? "4K UHD"
                  : Math.max(settings.width, settings.height) >= 2560
                  ? "2K QHD"
                  : Math.max(settings.width, settings.height) >= 1920
                  ? "1080p FHD"
                  : Math.max(settings.width, settings.height) >= 1280
                  ? "720p HD"
                  : "SD"}
              </span>
              <span className="rounded-md border border-studio-border bg-studio-panel px-1.5 py-0.5 font-medium text-studio-muted">
                {settings.fps} FPS
              </span>
            </div>
          </div>

          {/* Dynamic Aspect Ratio Wireframe Preview */}
          <div className="flex flex-col items-center justify-center shrink-0 pl-1">
            {(() => {
              const maxDim = 42;
              const w = settings.width || 1920;
              const h = settings.height || 1080;
              let wireframeW = maxDim;
              let wireframeH = maxDim;

              if (w >= h) {
                wireframeW = maxDim;
                wireframeH = Math.max(20, Math.round(maxDim * (h / w)));
              } else {
                wireframeH = maxDim;
                wireframeW = Math.max(20, Math.round(maxDim * (w / h)));
              }

              return (
                <div
                  style={{ width: `${wireframeW}px`, height: `${wireframeH}px` }}
                  className="relative flex items-center justify-center rounded-md border border-studio-border bg-studio-panel shadow-xs transition-all duration-300"
                  title={`Canvas shape: ${settings.width} × ${settings.height}`}
                >
                  <span className="text-[8px] font-mono font-bold text-brand leading-none">
                    {settings.aspectRatio === "custom" ? "Custom" : settings.aspectRatio}
                  </span>
                </div>
              );
            })()}
            <span className="mt-1 text-[8px] font-medium text-studio-muted">
              {settings.width > settings.height
                ? "Landscape"
                : settings.height > settings.width
                ? "Vertical"
                : "Square"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Popular Video Formats & Platform Presets */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg">Video Format</h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">Choose where this video will be played</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSwapOrientation}
            className="h-7 gap-1 px-2 text-[10px] font-medium cursor-pointer text-brand hover:border-brand/40"
            title="Swap width and height (Rotate landscape / portrait)"
          >
            <ArrowLeftRight className="h-3 w-3" /> Rotate ⇄
          </Button>
        </div>

        {/* Social Platforms Dropdown - Placed right after Video Format */}
        <div>
          <Select
            id="canvas-preset"
            value={activePreset?.id ?? ""}
            onChange={(event) => {
              const preset = SOCIAL_PRESETS.find(
                (item) => item.id === event.target.value,
              );
              if (!preset) return;
              setCustomResolutionOpen(false);
              setPresetId(preset.id);
              updateSettings({
                width: preset.width,
                height: preset.height,
                aspectRatio: preset.aspectRatio,
              });
            }}
            className="h-9 text-xs"
          >
            <option value="">Choose a specific platform template...</option>
            {PLATFORMS.map((platform) => (
              <optgroup key={platform} label={platform}>
                {SOCIAL_PRESETS.filter(
                  (preset) => preset.platform === platform,
                ).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.width}×{preset.height})
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>

        {/* 6 Popular Cards with Icons Left Beside the Text */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {POPULAR_FORMATS.map((item) => {
            const active = settings.aspectRatio === item.ratio;
            return (
              <button
                key={item.ratio}
                type="button"
                onClick={() => {
                  setCustomResolutionOpen(false);
                  setPresetId("");
                  updateSettings({
                    width: item.width,
                    height: item.height,
                    aspectRatio: item.ratio,
                  });
                }}
                className={cn(
                  "relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer select-none",
                  active
                    ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                {/* Top Row: Icon + Title on left, Checkmark on right */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <item.Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-brand" : "text-studio-muted")} />
                    <span className="text-xs font-bold text-studio-fg truncate">{item.title}</span>
                  </div>
                  {active && (
                    <Check className="h-3.5 w-3.5 text-brand shrink-0" />
                  )}
                </div>

                {/* Bottom Row: Subtitle on left, Ratio badge on bottom right */}
                <div className="mt-1.5 flex items-center justify-between w-full gap-1">
                  <span className="text-[9px] text-studio-muted truncate">
                    {item.subtitle}
                  </span>
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0",
                    active ? "bg-brand/20 text-brand font-bold" : "bg-studio-bg/60 text-studio-muted"
                  )}>
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Custom Resolution & Width / Height */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg">Canvas Resolution</h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">Set exact pixel width & height</p>
          </div>
          <button
            type="button"
            onClick={() => setLinked((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer",
              linked
                ? "border-brand/40 bg-brand/10 text-brand font-semibold"
                : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg"
            )}
          >
            {linked ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
            <span>{linked ? "Proportions Locked" : "Free Size"}</span>
          </button>
        </div>

        {/* Quick Resolution Tier Chips */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {QUALITY_PRESETS.map((q) => {
            let isActive = false;
            let subText = `${Math.round(1920 * q.scale)}×${Math.round(1080 * q.scale)}`;

            if (settings.aspectRatio === "16:9") {
              isActive =
                settings.width === Math.round(1920 * q.scale) &&
                settings.height === Math.round(1080 * q.scale);
              subText = `${Math.round(1920 * q.scale)}×${Math.round(1080 * q.scale)}`;
            } else if (settings.aspectRatio === "9:16") {
              isActive =
                settings.width === Math.round(1080 * q.scale) &&
                settings.height === Math.round(1920 * q.scale);
              subText = `${Math.round(1080 * q.scale)}×${Math.round(1920 * q.scale)}`;
            } else if (settings.aspectRatio === "1:1") {
              isActive =
                settings.width === Math.round(1080 * q.scale) &&
                settings.height === Math.round(1080 * q.scale);
              subText = `${Math.round(1080 * q.scale)}×${Math.round(1080 * q.scale)}`;
            } else if (settings.aspectRatio === "4:5") {
              isActive =
                settings.width === Math.round(1080 * q.scale) &&
                settings.height === Math.round(1350 * q.scale);
              subText = `${Math.round(1080 * q.scale)}×${Math.round(1350 * q.scale)}`;
            } else if (settings.aspectRatio === "2:3") {
              isActive =
                settings.width === Math.round(1000 * q.scale) &&
                settings.height === Math.round(1500 * q.scale);
              subText = `${Math.round(1000 * q.scale)}×${Math.round(1500 * q.scale)}`;
            } else if (settings.aspectRatio === "21:9") {
              isActive =
                settings.width === Math.round(2560 * q.scale) &&
                settings.height === Math.round(1080 * q.scale);
              subText = `${Math.round(2560 * q.scale)}×${Math.round(1080 * q.scale)}`;
            } else {
              const landscapeWidth = Math.round(1920 * q.scale);
              const landscapeHeight = Math.round(1080 * q.scale);
              const isPortrait = settings.height > settings.width;
              const targetWidth = isPortrait
                ? landscapeHeight
                : landscapeWidth;
              const targetHeight = isPortrait
                ? landscapeWidth
                : landscapeHeight;
              isActive =
                settings.width === targetWidth &&
                settings.height === targetHeight;
              subText = `${targetWidth}×${targetHeight}`;
            }

            return (
              <button
                key={q.label}
                type="button"
                onClick={() => {
                  setCustomResolutionOpen(false);
                  if (settings.aspectRatio === "16:9") {
                    handleApplyResolutionScale(
                      Math.round(1920 * q.scale),
                      Math.round(1080 * q.scale)
                    );
                  } else if (settings.aspectRatio === "9:16") {
                    handleApplyResolutionScale(
                      Math.round(1080 * q.scale),
                      Math.round(1920 * q.scale)
                    );
                  } else if (settings.aspectRatio === "1:1") {
                    handleApplyResolutionScale(
                      Math.round(1080 * q.scale),
                      Math.round(1080 * q.scale)
                    );
                  } else if (settings.aspectRatio === "4:5") {
                    handleApplyResolutionScale(
                      Math.round(1080 * q.scale),
                      Math.round(1350 * q.scale)
                    );
                  } else if (settings.aspectRatio === "2:3") {
                    handleApplyResolutionScale(
                      Math.round(1000 * q.scale),
                      Math.round(1500 * q.scale)
                    );
                  } else if (settings.aspectRatio === "21:9") {
                    handleApplyResolutionScale(
                      Math.round(2560 * q.scale),
                      Math.round(1080 * q.scale)
                    );
                  } else {
                    handleApplyResolutionScale(
                      Math.round(1920 * q.scale),
                      Math.round(1080 * q.scale)
                    );
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none",
                  !customResolutionOpen && isActive
                    ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg"
                )}
              >
                <span className={cn("text-xs font-bold", !customResolutionOpen && isActive ? "text-brand" : "text-studio-fg")}>
                  {q.label}
                </span>
                <span className={cn("text-[9px] mt-0.5", !customResolutionOpen && isActive ? "text-brand/80 font-medium" : "text-studio-muted")}>
                  {subText}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={customResolutionOpen}
            onClick={() => {
              setPresetId("");
              setCustomResolutionOpen(true);
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border p-2 transition-all cursor-pointer select-none",
              customResolutionOpen
                ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
            )}
          >
            <span className={cn("text-xs font-bold", customResolutionOpen ? "text-brand" : "text-studio-fg")}>
              Custom
            </span>
            <span className={cn("mt-0.5 text-[9px]", customResolutionOpen ? "font-medium text-brand/80" : "text-studio-muted")}>
              Enter size
            </span>
          </button>
        </div>

        {/* Width & Height Inputs */}
        {customResolutionOpen ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-studio-border bg-studio-panel/50 p-2.5">
          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              Width (px)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={64}
                max={7680}
                value={dimensionDraft.width}
                onChange={(event) =>
                  setDimensionDraft((current) => ({
                    ...current,
                    width: event.target.value,
                  }))
                }
                onBlur={() => commitDimension("width")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </div>

          <div className="pt-4 text-studio-muted">
            <button
              type="button"
              onClick={() => setLinked(!linked)}
              title={linked ? "Click to unlock aspect ratio" : "Click to lock aspect ratio"}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer",
                linked ? "border-brand/40 bg-brand/10 text-brand" : "border-studio-border bg-studio-panel text-studio-muted"
              )}
            >
              {linked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              Height (px)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={64}
                max={7680}
                value={dimensionDraft.height}
                onChange={(event) =>
                  setDimensionDraft((current) => ({
                    ...current,
                    height: event.target.value,
                  }))
                }
                onBlur={() => commitDimension("height")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </div>
        </div>
        ) : null}
      </section>

      {/* 4. Frame Rate (FPS) */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-brand" /> Video Smoothness (FPS)
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">Frames rendered per second</p>
          </div>
          <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
            {settings.fps} FPS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {FPS_OPTIONS.map((option) => {
            const active = settings.fps === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSettings({ fps: option.value })}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none",
                  active
                    ? "border-brand bg-brand text-white shadow-xs font-bold"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg"
                )}
              >
                <span className="text-xs font-bold">{option.label}</span>
                <span className={cn("text-[9px] mt-0.5", active ? "text-white/80" : "text-studio-muted")}>
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Canvas Background Appearance */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-brand" /> Canvas Background Color
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">Visible in empty canvas areas</p>
          </div>
          <ColorPickerPopover
            label="Canvas Background Color"
            value={settings.backgroundColor || "#000000"}
            presets={CANVAS_COLOR_SWATCHES.map((s) => s.hex)}
            onChange={(hex) => updateSettings({ backgroundColor: hex.toUpperCase() })}
            align="right"
            triggerClassName="h-8 w-28 shrink-0 bg-studio-panel px-2 border-studio-border"
          />
        </div>

        {/* Quick Color Swatches */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CANVAS_COLOR_SWATCHES.map((preset) => {
            const isSelected = (settings.backgroundColor || "#000000").toUpperCase() === preset.hex.toUpperCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => updateSettings({ backgroundColor: preset.hex })}
                title={`${preset.label} (${preset.hex})`}
                style={{ backgroundColor: preset.hex }}
                className={cn(
                  "relative h-7 w-7 rounded-md border shadow-xs transition-all hover:scale-105 cursor-pointer",
                  isSelected ? "border-brand ring-2 ring-brand/60 scale-105" : "border-white/15 hover:border-white/40"
                )}
              >
                {isSelected && (
                  <Check
                    className={cn(
                      "absolute inset-0 m-auto h-3.5 w-3.5 drop-shadow-md",
                      preset.hex === "#FFFFFF" ? "text-studio-bg" : "text-white"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Master Audio Output */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-brand" /> Master Audio Level
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">Overall project volume</p>
          </div>
          <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
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
      </section>

      {/* 7. Reset Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setLinked(true);
          setCustomResolutionOpen(false);
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
        className="w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Canvas to Default (1080p 16:9)
      </Button>
    </div>
  );
}
