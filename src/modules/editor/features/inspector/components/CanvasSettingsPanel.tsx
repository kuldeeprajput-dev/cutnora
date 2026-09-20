"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  Link2,
  Link2Off,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { useProjectStore } from "@/modules/projects";
import type { AspectRatio } from "@/modules/projects/types";
import { ColorPickerPopover } from "@/shared/components/ui/ColorPicker";
import { Input } from "@/shared/components/ui/Input";
import { Slider } from "@/shared/components/ui/Slider";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/shared/components/ui/DropdownMenu";
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
  const currentProject = useProjectStore((state) => state.currentProject);
  const settings = currentProject?.settings;
  const updateSettings = useProjectStore(
    (state) => state.updateProjectSettings,
  );

  const [aspectRatioExpanded, setAspectRatioExpanded] = useState(false);
  const [resolutionExpanded, setResolutionExpanded] = useState(false);
  const [bgColorsExpanded, setBgColorsExpanded] = useState(false);

  const [nameDraft, setNameDraft] = useState(currentProject?.name ?? "Untitled project");
  const [isEditingName, setIsEditingName] = useState(false);

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
    if (currentProject?.name) {
      setNameDraft(currentProject.name);
    }
  }, [currentProject?.name]);

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

  const handleNameSubmit = () => {
    setIsEditingName(false);
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== currentProject?.name) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.name = trimmed;
          state.currentProject.updatedAt = Date.now();
        }
      });
    } else {
      setNameDraft(currentProject?.name ?? "Untitled project");
    }
  };

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

  const getRatioLabel = (ratio: AspectRatio) => {
    if (ratio === "16:9") return "Landscape";
    if (ratio === "9:16") return "Vertical";
    if (ratio === "1:1") return "Square";
    if (ratio === "4:5") return "Portrait";
    if (ratio === "2:3") return "Poster";
    if (ratio === "21:9") return "Cinema";
    return "Custom";
  };

  return (
    <div className="flex flex-col gap-3 text-white pb-3 select-none">
      <div className="flex flex-col text-xs">
          {/* Row 1: Project Name */}
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
            <span className="text-white/50 font-medium">Name</span>
            {isEditingName ? (
              <input
                type="text"
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSubmit();
                  if (e.key === "Escape") {
                    setNameDraft(currentProject?.name ?? "Untitled project");
                    setIsEditingName(false);
                  }
                }}
                className="h-7 w-48 rounded border border-white/30 bg-[#141414] px-2 text-right font-medium text-white outline-none focus:border-white"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
                className="max-w-[200px] truncate text-right font-medium text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 cursor-pointer"
              >
                {nameDraft || "Untitled project"}
              </button>
            )}
          </div>

          {/* Row 2: Frame rate */}
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
            <span className="text-white/50 font-medium">Frame rate</span>
            <DropdownMenu
              align="right"
              className="w-36 min-w-[130px] rounded-2xl border border-white/10 bg-[#141416] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-md"
              trigger={(isOpen) => (
                <div className="flex items-center gap-1 font-medium text-white/90 hover:text-white transition-colors cursor-pointer text-xs">
                  <span>{settings?.fps ?? 30} fps</span>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                  )}
                </div>
              )}
            >
              {FPS_OPTIONS.map((opt) => {
                const isSelected = (settings?.fps ?? 30) === opt.value;
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => updateSettings({ fps: opt.value })}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      isSelected
                        ? "text-white"
                        : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                      )}
                    </span>
                    <span>{opt.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenu>
          </div>

          {/* Row 3: Aspect ratio */}
          <div className="py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Aspect ratio</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatioExpanded((prev) => !prev)}
                  className="flex items-center gap-1.5 font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs">{settings.aspectRatio}</span>
                  <span className="text-[11px] text-white/45">
                    ({getRatioLabel(settings.aspectRatio)})
                  </span>
                  {aspectRatioExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSwapOrientation}
                  title="Swap orientation (Rotate ⇄)"
                  className="flex h-6 w-6 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded Aspect Ratio Options */}
            {aspectRatioExpanded && (
              <div className="mt-2.5 space-y-1 pl-0.5">
                {/* Platform Presets Dropdown */}
                <div className="pb-1">
                  <DropdownMenu
                    matchTriggerWidth
                    triggerClassName="w-full"
                    className="max-h-72 w-full overflow-y-auto studio-scrollbar rounded-xl border border-white/10 bg-[#141416] p-1.5 shadow-2xl shadow-black/90 backdrop-blur-md"
                    trigger={(isOpen) => (
                      <div
                        className={cn(
                          "flex h-8 w-full items-center justify-between gap-2 rounded-lg border px-2.5 text-xs transition-all cursor-pointer",
                          isOpen
                            ? "border-white/30 bg-white/[0.06] text-white"
                            : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
                        )}
                      >
                        <span className="truncate">
                          {activePreset
                            ? `${activePreset.name} (${activePreset.width}×${activePreset.height})`
                            : "Platform templates (YouTube, TikTok, Reels...)"}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-white/60 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0" />
                        )}
                      </div>
                    )}
                  >
                    <div className="flex flex-col space-y-1">
                      {PLATFORMS.map((platform, idx) => {
                        const presets = SOCIAL_PRESETS.filter((p) => p.platform === platform);
                        if (presets.length === 0) return null;
                        return (
                          <div key={platform} className={cn(idx > 0 && "pt-1.5 mt-1 border-t border-white/[0.06]")}>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/35 select-none"
                            >
                              {platform}
                            </div>
                            <div className="space-y-0.5">
                              {presets.map((preset) => {
                                const isSelected = activePreset?.id === preset.id;
                                return (
                                  <DropdownMenuItem
                                    key={preset.id}
                                    onClick={() => {
                                      setCustomResolutionOpen(false);
                                      setPresetId(preset.id);
                                      updateSettings({
                                        width: preset.width,
                                        height: preset.height,
                                        aspectRatio: preset.aspectRatio,
                                      });
                                    }}
                                    className={cn(
                                      "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                                      isSelected
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 truncate">
                                      <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
                                      </span>
                                      <span className="truncate">{preset.formatName}</span>
                                      <span className="font-mono text-[10px] text-white/40 shrink-0">
                                        ({preset.aspectRatio})
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-white/35 shrink-0 ml-auto pl-2">
                                      {preset.width}×{preset.height}
                                    </span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </DropdownMenu>
                </div>

                {POPULAR_FORMATS.map((item) => {
                  const active = settings.aspectRatio === item.ratio && !customResolutionOpen;
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
                        "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                        active
                          ? "bg-white/[0.08] text-white font-medium border border-white/10 shadow-xs"
                          : "text-white/65 hover:bg-white/[0.04] hover:text-white border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.Icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", active ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                        <span className="font-mono text-xs w-9 text-left font-medium shrink-0">{item.ratio}</span>
                        <span className="text-[11px] text-white/50 group-hover:text-white/70 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-white/35 group-hover:text-white/50">{item.subtitle}</span>
                        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                          {active && <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Custom Ratio Row */}
                <button
                  type="button"
                  onClick={() => {
                    setPresetId("");
                    setCustomResolutionOpen(true);
                    setResolutionExpanded(true);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                    customResolutionOpen
                      ? "bg-white/[0.08] text-white font-medium border border-white/10 shadow-xs"
                      : "text-white/65 hover:bg-white/[0.04] hover:text-white border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SlidersHorizontal className={cn("h-3.5 w-3.5 shrink-0 transition-colors", customResolutionOpen ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                    <span className="font-mono text-xs w-9 text-left font-medium shrink-0">Custom</span>
                    <span className="text-[11px] text-white/50 group-hover:text-white/70 truncate">Free size</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/35 group-hover:text-white/50">Manual px</span>
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {customResolutionOpen && <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Row 4: Resolution */}
          <div className="py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Resolution</span>
              <button
                type="button"
                onClick={() => setResolutionExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="font-mono text-xs">
                  {settings.width} × {settings.height}
                </span>
                {resolutionExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                )}
              </button>
            </div>

            {/* Resolution Tier Pills & Custom Dimension Inputs */}
            {resolutionExpanded && (
              <div className="mt-2.5 space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {QUALITY_PRESETS.map((q) => {
                    let isActive = false;
                    if (settings.aspectRatio === "16:9") {
                      isActive =
                        settings.width === Math.round(1920 * q.scale) &&
                        settings.height === Math.round(1080 * q.scale);
                    } else if (settings.aspectRatio === "9:16") {
                      isActive =
                        settings.width === Math.round(1080 * q.scale) &&
                        settings.height === Math.round(1920 * q.scale);
                    } else if (settings.aspectRatio === "1:1") {
                      isActive =
                        settings.width === Math.round(1080 * q.scale) &&
                        settings.height === Math.round(1080 * q.scale);
                    } else {
                      isActive =
                        settings.width === Math.round(1920 * q.scale) ||
                        settings.height === Math.round(1080 * q.scale);
                    }

                    return (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => {
                          setCustomResolutionOpen(false);
                          handleApplyResolutionScale(
                            Math.round(1920 * q.scale),
                            Math.round(1080 * q.scale)
                          );
                        }}
                        className={cn(
                          "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                          !customResolutionOpen && isActive
                            ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                            : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                        )}
                      >
                        {q.label.split(" ")[0]}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setPresetId("");
                      setCustomResolutionOpen(true);
                    }}
                    className={cn(
                      "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                      customResolutionOpen
                        ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                    )}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom Width & Height Inputs */}
                {customResolutionOpen && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min={64}
                        max={7680}
                        value={dimensionDraft.width}
                        onChange={(e) =>
                          setDimensionDraft((cur) => ({ ...cur, width: e.target.value }))
                        }
                        onBlur={() => commitDimension("width")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        className="h-8 pr-6 font-mono text-xs bg-[#141414] border-white/10"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/40">
                        W
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLinked(!linked)}
                      title={linked ? "Proportions locked (click to unlock)" : "Free size (click to lock)"}
                      className={cn(
                        "h-8 w-8 rounded flex items-center justify-center border transition-colors cursor-pointer",
                        linked ? "border-white/20 bg-white/10 text-white" : "border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      {linked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
                    </button>

                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min={64}
                        max={7680}
                        value={dimensionDraft.height}
                        onChange={(e) =>
                          setDimensionDraft((cur) => ({ ...cur, height: e.target.value }))
                        }
                        onBlur={() => commitDimension("height")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        className="h-8 pr-6 font-mono text-xs bg-[#141414] border-white/10"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/40">
                        H
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 5: Background */}
          <div className="py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setBgColorsExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <span>Background</span>
                {bgColorsExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                )}
              </button>
              <ColorPickerPopover
                label="Background Color"
                value={settings.backgroundColor || "#000000"}
                presets={CANVAS_COLOR_SWATCHES.map((s) => s.hex)}
                onChange={(hex) => updateSettings({ backgroundColor: hex.toUpperCase() })}
                align="right"
                triggerClassName="h-6 px-2 gap-1.5 rounded border border-white/10 bg-[#141414] hover:border-white/20 hover:bg-white/[0.04] cursor-pointer text-xs"
              />
            </div>

            {/* Quick Swatches & Preset Styles */}
            {bgColorsExpanded && (
              <div className="mt-3 space-y-2.5 pl-0.5">
                {/* Swatches */}
                <div className="flex flex-wrap gap-1.5">
                  {CANVAS_COLOR_SWATCHES.map((swatch) => {
                    const isSelected =
                      (settings.backgroundColor || "#000000").toUpperCase() ===
                      swatch.hex.toUpperCase();
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => updateSettings({ backgroundColor: swatch.hex })}
                        title={`${swatch.label} (${swatch.hex})`}
                        style={{ backgroundColor: swatch.hex }}
                        className={cn(
                          "relative h-6 w-6 rounded border transition-all cursor-pointer",
                          isSelected
                            ? "border-white ring-2 ring-white/40 scale-105"
                            : "border-white/15 hover:border-white/40"
                        )}
                      >
                        {isSelected && (
                          <Check
                            className={cn(
                              "absolute inset-0 m-auto h-3 w-3 drop-shadow-md",
                              swatch.hex === "#FFFFFF" ? "text-black" : "text-white"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Preset Themes (Light, Medium, Heavy) */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      name: "Light",
                      color: "#18191D",
                      previewClass: "bg-gradient-to-br from-neutral-800 to-neutral-900",
                    },
                    {
                      name: "Medium",
                      color: "#08090A",
                      previewClass: "bg-gradient-to-br from-neutral-900 via-neutral-950 to-black",
                    },
                    {
                      name: "Heavy",
                      color: "#000000",
                      previewClass: "bg-black",
                    },
                  ].map((style) => {
                    const isSelected =
                      (settings.backgroundColor || "#000000").toUpperCase() ===
                      style.color.toUpperCase();
                    return (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => updateSettings({ backgroundColor: style.color })}
                        className={cn(
                          "group flex h-7 items-center justify-center rounded border text-[10px] font-medium transition-all cursor-pointer",
                          style.previewClass,
                          isSelected
                            ? "border-white text-white ring-1 ring-white/40"
                            : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                        )}
                      >
                        <span>{style.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Row 6: Master Audio */}
          <div className="py-2.5 border-b border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-white/40" />
                <span className="text-white/50 font-medium">Master volume</span>
              </div>
              <span className="font-mono text-xs text-white/80">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <Slider
              value={settings.masterVolume}
              min={0}
              max={1}
              step={0.01}
              fillClassName="bg-white/90"
              trackClassName="bg-white/10"
              onValueChange={(val) => updateSettings({ masterVolume: val })}
            />
          </div>

          {/* Row 7: Reset Button */}
          <div className="pt-4">
            <button
              type="button"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] py-2 text-xs font-medium text-white/50 hover:bg-white/[0.06] hover:border-white/20 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to default (1080p 16:9)</span>
            </button>
          </div>
        </div>
    </div>
  );
}
