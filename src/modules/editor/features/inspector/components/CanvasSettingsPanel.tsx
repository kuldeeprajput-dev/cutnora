"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  HelpCircle,
  Link2,
  Link2Off,
  Maximize,
  Pipette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useProjectStore } from "@/modules/projects";
import type { AspectRatio } from "@/modules/projects/types";
import {
  ColorPickerPopover,
  PRESET_COLORS,
  parseAnyColorString,
  rgbToHex,
} from "@/shared/components/ui/ColorPicker";
import { Input } from "@/shared/components/ui/Input";
import { Slider } from "@/shared/components/ui/Slider";
import { Tooltip } from "@/shared/components/ui/Tooltip";
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

function isLightColor(hex: string): boolean {
  if (!hex || hex === "transparent") return false;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  }
  return false;
}

export type { SocialPreset };

const CANVAS_PRESETS_SWATCHES = PRESET_COLORS;

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

  const [isBgInputFocused, setIsBgInputFocused] = useState(false);
  const [bgHexDraft, setBgHexDraft] = useState("");

  const displayedBgHex = isBgInputFocused
    ? bgHexDraft
    : (settings?.backgroundColor || "#000000").toUpperCase();

  const handleColorChange = useCallback(
    (hex: string) => {
      const stageBox = document.getElementById("stage-canvas-box");
      if (stageBox) {
        if (hex.toLowerCase() === "transparent") {
          stageBox.style.backgroundColor = "transparent";
          stageBox.style.backgroundImage =
            "repeating-conic-gradient(#23242a 0% 25%, #141519 0% 50%)";
          stageBox.style.backgroundSize = "16px 16px";
        } else {
          stageBox.style.backgroundColor = hex;
          stageBox.style.backgroundImage = "none";
        }
      }
      updateSettings(
        { backgroundColor: hex.toUpperCase() },
        { recordHistory: false },
      );
    },
    [updateSettings],
  );

  const handleColorChangeEnd = useCallback(
    (hex: string) => {
      updateSettings(
        { backgroundColor: hex.toUpperCase() },
        { recordHistory: true },
      );
    },
    [updateSettings],
  );

  const previewBgColor = useMemo(() => {
    const raw = isBgInputFocused ? bgHexDraft : settings?.backgroundColor || "#000000";
    const trimmed = raw.trim();
    if (trimmed.toLowerCase() === "transparent" || trimmed.toLowerCase() === "alpha") {
      return "transparent";
    }
    const parsed = parseAnyColorString(trimmed);
    if (parsed) {
      return rgbToHex(parsed);
    }
    return settings?.backgroundColor || "#000000";
  }, [isBgInputFocused, bgHexDraft, settings?.backgroundColor]);

  const applyColorFromInput = (inputVal: string) => {
    const trimmed = inputVal.trim();
    if (trimmed.toLowerCase() === "transparent" || trimmed.toLowerCase() === "alpha") {
      updateSettings({ backgroundColor: "transparent" });
      return true;
    }
    const parsed = parseAnyColorString(trimmed);
    if (parsed) {
      const hex = rgbToHex(parsed);
      updateSettings({ backgroundColor: hex });
      return true;
    }
    return false;
  };

  const handleBgHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setBgHexDraft(raw);
    applyColorFromInput(raw);
  };

  const handleBgHexBlur = () => {
    setIsBgInputFocused(false);
    const trimmed = bgHexDraft.trim();
    if (trimmed.toLowerCase() === "transparent" || trimmed.toLowerCase() === "alpha") {
      updateSettings({ backgroundColor: "transparent" });
      return;
    }
    const parsed = parseAnyColorString(trimmed);
    if (parsed) {
      const hex = rgbToHex(parsed);
      updateSettings({ backgroundColor: hex });
    }
  };

  const handleBgHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setIsBgInputFocused(false);
      e.currentTarget.blur();
    }
  };

  const handleBgHexPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    const parsed = parseAnyColorString(pasted.trim());
    if (parsed) {
      e.preventDefault();
      const hex = rgbToHex(parsed);
      setBgHexDraft(hex);
      updateSettings({ backgroundColor: hex });
    }
  };

  const supportsEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  const handleEyeDropper = async (e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      (e.currentTarget as HTMLElement).blur();
    }
    if (supportsEyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          updateSettings({ backgroundColor: result.sRGBHex.toUpperCase() });
        }
      } catch {
        // Eyedropper dismissed or aborted by user
      } finally {
        if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }
  };

  const hasBgReset = Boolean(
    settings?.backgroundColor &&
    settings.backgroundColor.toLowerCase() !== "#000000" &&
    settings.backgroundColor.toLowerCase() !== "#000"
  );

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

  const resolutionLabel = useMemo(() => {
    if (customResolutionOpen || !settings) return "Custom";
    const { width, height } = settings;
    if (
      (width === 1920 && height === 1080) ||
      (width === 1080 && height === 1920) ||
      (width === 1080 && height === 1080) ||
      (width === 1080 && height === 1350)
    ) {
      return "1080p";
    }
    if (
      (width === 3840 && height === 2160) ||
      (width === 2160 && height === 3840)
    ) {
      return "4K";
    }
    if (
      (width === 1280 && height === 720) ||
      (width === 720 && height === 1280)
    ) {
      return "720p";
    }
    const matchedQuality = QUALITY_PRESETS.find((q) => {
      const targetW = Math.round(1920 * q.scale);
      const targetH = Math.round(1080 * q.scale);
      return (
        (width === targetW && height === targetH) ||
        (width === targetH && height === targetW)
      );
    });
    if (matchedQuality) {
      return matchedQuality.label.split(" ")[0];
    }
    return "Custom";
  }, [settings?.width, settings?.height, customResolutionOpen]);

  return (
    <div className="flex flex-col gap-3 text-white pb-3 select-none">
      <div className="flex flex-col text-xs">
          {/* Row 1: Project Name */}
          <div className="py-2.5 border-b border-white/[0.06]">
            {isEditingName ? (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-medium">Name</span>
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
                  className="h-7 w-48 rounded-md border border-white/20 bg-white/[0.04] px-2.5 text-right font-medium text-white outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all text-xs"
                />
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                title="Click to rename"
              >
                <span className="text-white/50 group-hover:text-white font-medium transition-colors">
                  Name
                </span>
                <span className="max-w-[200px] truncate text-right font-medium text-white/90 group-hover:text-white transition-colors">
                  {nameDraft || "Untitled project"}
                </span>
              </div>
            )}
          </div>

          {/* Row 2: Frame rate */}
          <div className="py-2.5 border-b border-white/[0.06]">
            <DropdownMenu
              align="right"
              matchTriggerWidth={false}
              triggerClassName="w-full"
              className="w-36 min-w-[130px] rounded-2xl border border-white/10 bg-[#141416] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-md"
              trigger={(isOpen) => (
                <div className="flex items-center justify-between w-full cursor-pointer group py-0.5">
                  <span className="text-white/50 group-hover:text-white font-medium transition-colors">Frame rate</span>
                  <div className="flex items-center gap-1 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
                    <span>{settings?.fps ?? 30} fps</span>
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-white/50 group-hover:text-white" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white" />
                    )}
                  </div>
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
            <div
              onClick={() => setAspectRatioExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer group select-none"
            >
              <span className="text-white/50 group-hover:text-white font-medium transition-colors">Aspect ratio</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                  {getRatioLabel(settings.aspectRatio)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwapOrientation();
                  }}
                  title="Swap orientation (Rotate ⇄)"
                  className="flex h-6 w-6 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center justify-center text-white/40 group-hover:text-white transition-colors p-0.5">
                  {aspectRatioExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </div>
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
            <div
              onClick={() => setResolutionExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer group select-none"
            >
              <span className="text-white/50 group-hover:text-white font-medium transition-colors">Resolution</span>
              <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors">
                <span className="font-mono text-xs">
                  {resolutionLabel}
                </span>
                {resolutionExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
                )}
              </div>
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
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {/* W Input */}
                    <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-1.5">
                      <span className="text-[10px] font-mono font-medium text-white/40 select-none shrink-0">
                        W
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dimensionDraft.width}
                        onChange={(e) =>
                          setDimensionDraft((cur) => ({ ...cur, width: e.target.value }))
                        }
                        onBlur={() => commitDimension("width")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitDimension("width");
                            e.currentTarget.blur();
                          }
                        }}
                        className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                      />
                      <span className="text-[10px] font-mono text-white/30 select-none shrink-0">
                        px
                      </span>
                    </div>

                    {/* Aspect Ratio Lock Button */}
                    <button
                      type="button"
                      onClick={() => setLinked(!linked)}
                      title={linked ? "Proportions locked (click to unlock)" : "Free size (click to lock)"}
                      className={cn(
                        "h-[30px] w-[30px] rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0",
                        linked
                          ? "border-white/25 bg-white/15 text-white shadow-xs"
                          : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      {linked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
                    </button>

                    {/* H Input */}
                    <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-1.5">
                      <span className="text-[10px] font-mono font-medium text-white/40 select-none shrink-0">
                        H
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dimensionDraft.height}
                        onChange={(e) =>
                          setDimensionDraft((cur) => ({ ...cur, height: e.target.value }))
                        }
                        onBlur={() => commitDimension("height")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitDimension("height");
                            e.currentTarget.blur();
                          }
                        }}
                        className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                      />
                      <span className="text-[10px] font-mono text-white/30 select-none shrink-0">
                        px
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 5: Background */}
          <div className="py-2.5 border-b border-white/[0.06]">
            <div
              onClick={() => setBgColorsExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer group select-none"
            >
              <span className="text-white/50 group-hover:text-white font-medium transition-colors">
                Background
              </span>
              <div className="flex items-center gap-1.5">
                <div onClick={(e) => e.stopPropagation()}>
                  <ColorPickerPopover
                    label="Background Color"
                    value={settings.backgroundColor || "#000000"}
                    defaultValue="#000000"
                    onReset={() => updateSettings({ backgroundColor: "#000000" })}
                    presets={CANVAS_PRESETS_SWATCHES}
                    onChange={handleColorChange}
                    onChangeEnd={handleColorChangeEnd}
                    align="right"
                    triggerClassName="h-7 px-2.5 justify-center"
                  />
                </div>
                <div className="flex items-center justify-center text-white/40 group-hover:text-white transition-colors p-0.5">
                  {bgColorsExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Swatches & Controls */}
            {bgColorsExpanded && (
              <div className="mt-3 space-y-2.5 pl-0.5">
                {/* 16-Swatch Palette Grid (8 cols x 2 rows) */}
                <div className="grid grid-cols-8 gap-1.5">
                  {CANVAS_COLOR_SWATCHES.map((swatch) => {
                    const isTransparent = swatch.hex === "transparent";
                    const isSelected =
                      (settings.backgroundColor || "#000000").toLowerCase() ===
                      swatch.hex.toLowerCase();
                    const isLight = isLightColor(swatch.hex);

                    return (
                      <button
                        key={swatch.label}
                        type="button"
                        onClick={() => {
                          handleColorChange(swatch.hex);
                          handleColorChangeEnd(swatch.hex);
                        }}
                        aria-label={`${swatch.label} (${swatch.hex})`}
                        style={
                          isTransparent
                            ? {
                                backgroundImage:
                                  "repeating-conic-gradient(#3e4149 0% 25%, #232428 0% 50%)",
                                backgroundSize: "8px 8px",
                              }
                            : { backgroundColor: swatch.hex }
                        }
                        className={cn(
                          "group relative flex aspect-square w-full items-center justify-center rounded-lg border transition-all cursor-pointer",
                          isSelected
                            ? "border-transparent ring-2 ring-white ring-offset-2 ring-offset-[#141416]"
                            : "border-white/10 hover:border-white/40 hover:scale-105 active:scale-95"
                        )}
                      >
                        {isSelected && (
                          <Check
                            className={cn(
                              "h-3.5 w-3.5 stroke-[2.5]",
                              isLight ? "text-black" : "text-white"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Custom Color & Tools Row */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="relative flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all">
                    <div
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-sm border border-white/20 shrink-0 pointer-events-none"
                      style={
                        previewBgColor === "transparent"
                          ? {
                              backgroundImage:
                                "repeating-conic-gradient(#4a4d55 0% 25%, #2a2b30 0% 50%)",
                              backgroundSize: "6px 6px",
                            }
                          : { backgroundColor: previewBgColor }
                      }
                    />
                    <input
                      type="text"
                      value={displayedBgHex}
                      onFocus={() => {
                        setIsBgInputFocused(true);
                        setBgHexDraft(settings?.backgroundColor || "#000000");
                      }}
                      onChange={handleBgHexChange}
                      onBlur={handleBgHexBlur}
                      onKeyDown={handleBgHexKeyDown}
                      onPaste={handleBgHexPaste}
                      placeholder="#000000"
                      spellCheck={false}
                      className="h-full w-full rounded-md border-0 bg-transparent pl-8 pr-2 font-mono text-xs uppercase text-white/90 placeholder-white/30 outline-none transition-colors p-0 focus:outline-none focus:ring-0 shadow-none"
                    />
                  </div>

                  {supportsEyeDropper && (
                    <Tooltip
                      content={
                        <div className="flex flex-col items-center text-center gap-0.5 py-0.5">
                          <span className="font-semibold text-white text-[11px]">Pick color from screen</span>
                          <span className="text-[10px] text-white/60">Click anywhere to sample color</span>
                        </div>
                      }
                      position="top"
                      align={hasBgReset ? "center" : "right"}
                      delayMs={120}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.currentTarget.blur();
                          handleEyeDropper(e);
                        }}
                        aria-label="Pick color from screen"
                        className="flex h-7 w-7 items-center justify-center rounded border-0 bg-transparent text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 shadow-none"
                      >
                        <Pipette className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  )}

                  {hasBgReset && (
                    <button
                      type="button"
                      onClick={() => updateSettings({ backgroundColor: "#000000" })}
                      aria-label="Reset to black"
                      className="flex h-7 items-center gap-1 px-2 rounded border-0 bg-transparent text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 shadow-none"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 6: Master Audio */}
          <div className="py-2.5 border-b border-white/[0.06] space-y-2 group select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-white/50 group-hover:text-white font-medium transition-colors">
                  Master volume
                </span>
              </div>
              <span className="font-mono text-xs text-white/80 group-hover:text-white transition-colors">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <Slider
              value={settings.masterVolume}
              min={0}
              max={1}
              step={0.01}
              fillClassName="bg-white/90 group-hover:bg-white"
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
