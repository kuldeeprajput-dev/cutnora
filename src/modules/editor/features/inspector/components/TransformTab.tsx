"use client";

import React, { useState } from "react";
import type { TimelineClip, CropSettings } from "@/modules/editor/types";
import { useProjectStore } from "@/modules/projects";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Slider } from "@/shared/components/ui/Slider";
import {
  Maximize2,
  RotateCcw,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Link2,
  Link2Off,
  Move,
  SlidersHorizontal,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useInspectorExpanded } from "../hooks/useInspectorAccordion";

export interface TransformTabProps {
  clip: TimelineClip;
}

const SIZE_PRESETS = [
  { label: "100% Full", sub: "Full canvas", scale: 1 },
  { label: "75% Large", sub: "Three quarter", scale: 0.75 },
  { label: "50% Half", sub: "Half screen", scale: 0.5 },
  { label: "25% PiP", sub: "Corner mini", scale: 0.25 },
];

type AnchorPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left-center"
  | "center"
  | "right-center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface AnchorPointConfig {
  id: AnchorPosition;
  label: string;
}

const ANCHOR_CONFIG: AnchorPointConfig[] = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "left-center", label: "Center Left" },
  { id: "center", label: "Center" },
  { id: "right-center", label: "Center Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
];

export function TransformTab({ clip }: TransformTabProps) {
  const updateClip = useProjectStore((state) => state.updateClip);
  const currentProject = useProjectStore((state) => state.currentProject);
  const { activeTool, setActiveTool } = useEditorUIStore();

  const [isAspectLocked, setIsAspectLocked] = useState(true);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [editingField, setEditingField] = useState<"width" | "height" | "x" | "y" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const [framingExpanded, toggleFramingExpanded] = useInspectorExpanded("transform.framing", false);
  const [dimensionsExpanded, toggleDimensionsExpanded] = useInspectorExpanded("transform.dimensions", false);
  const [positionExpanded, togglePositionExpanded] = useInspectorExpanded("transform.position", false);
  const [flipExpanded, toggleFlipExpanded] = useInspectorExpanded("transform.flip", false);
  const [rotationExpanded, toggleRotationExpanded] = useInspectorExpanded("transform.rotation", false);

  const isCropping = activeTool === "crop";
  const crop: CropSettings = clip.transform.crop || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const hasActiveCrop =
    crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0;

  const commitTransform = (updates: Partial<TimelineClip["transform"]>) => {
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        ...updates,
      },
    });
  };

  const projW = currentProject?.settings.width || 1920;
  const projH = currentProject?.settings.height || 1080;

  const commitDimension = (key: "width" | "height", explicitVal?: string) => {
    const raw = (explicitVal !== undefined ? explicitVal : inputValue).trim();
    const parsed = Number.parseFloat(raw);

    if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    const value = Math.max(10, Math.min(7680, Math.round(parsed)));
    let nextW = key === "width" ? value : clip.transform.width;
    let nextH = key === "height" ? value : clip.transform.height;

    if (
      isAspectLocked &&
      clip.transform.width > 0 &&
      clip.transform.height > 0
    ) {
      const ratio = clip.transform.width / clip.transform.height;
      if (key === "width") {
        nextH = Math.round(value / ratio);
      } else {
        nextW = Math.round(value * ratio);
      }
    }

    commitTransform({ width: nextW, height: nextH });
  };

  const commitPosition = (key: "x" | "y", explicitVal?: string) => {
    const raw = (explicitVal !== undefined ? explicitVal : inputValue).trim();
    const parsed = Number.parseFloat(raw);

    if (!raw || !Number.isFinite(parsed)) {
      return;
    }

    const value = Math.round(parsed * 10) / 10;
    commitTransform({ [key]: value });
  };

  const handleApplySizePreset = (scale: number) => {
    setCustomSizeOpen(false);
    const newW = Math.round(projW * scale);
    const newH = Math.round(projH * scale);
    let newX = Math.round((projW - newW) / 2);
    let newY = Math.round((projH - newH) / 2);

    if (scale === 0.25) {
      newX = Math.max(0, projW - newW - 40);
      newY = Math.max(0, projH - newH - 40);
    }

    commitTransform({
      width: newW,
      height: newH,
      x: newX,
      y: newY,
      fitMode: scale === 1 ? "contain" : undefined,
    });
  };

  const getActiveAnchor = (): AnchorPointConfig | null => {
    const curW = clip.transform.width;
    const curH = clip.transform.height;
    const x = Math.round(clip.transform.x);
    const y = Math.round(clip.transform.y);

    const leftX = 0;
    const centerX = Math.round((projW - curW) / 2);
    const rightX = Math.max(0, projW - curW);

    const topY = 0;
    const centerY = Math.round((projH - curH) / 2);
    const bottomY = Math.max(0, projH - curH);

    const isClose = (a: number, b: number) => Math.abs(a - b) <= 2;

    // Center has top priority (especially for full-size / centered clips)
    if (isClose(x, centerX) && isClose(y, centerY)) return ANCHOR_CONFIG[4];

    // Other anchor positions
    if (isClose(x, leftX) && isClose(y, topY)) return ANCHOR_CONFIG[0];
    if (isClose(x, centerX) && isClose(y, topY)) return ANCHOR_CONFIG[1];
    if (isClose(x, rightX) && isClose(y, topY)) return ANCHOR_CONFIG[2];
    if (isClose(x, leftX) && isClose(y, centerY)) return ANCHOR_CONFIG[3];
    if (isClose(x, rightX) && isClose(y, centerY)) return ANCHOR_CONFIG[5];
    if (isClose(x, leftX) && isClose(y, bottomY)) return ANCHOR_CONFIG[6];
    if (isClose(x, centerX) && isClose(y, bottomY)) return ANCHOR_CONFIG[7];
    if (isClose(x, rightX) && isClose(y, bottomY)) return ANCHOR_CONFIG[8];

    return null;
  };

  const activeAnchor = getActiveAnchor();

  const getActiveDimensionLabel = (): string => {
    if (customSizeOpen) return "Custom";
    const curW = clip.transform.width;
    const curH = clip.transform.height;

    for (const p of SIZE_PRESETS) {
      const targetW = Math.round(projW * p.scale);
      const targetH = Math.round(projH * p.scale);
      if (Math.abs(curW - targetW) <= 2 && Math.abs(curH - targetH) <= 2) {
        return p.label.split(" ")[0];
      }
    }

    if (projW > 0 && projH > 0) {
      const scaleW = curW / projW;
      const scaleH = curH / projH;
      if (Math.abs(scaleW - scaleH) < 0.02) {
        const pct = Math.round(scaleW * 100);
        return `${pct}%`;
      }
    }

    return "Custom";
  };

  const activeDimensionLabel = getActiveDimensionLabel();

  const getFlipLabel = (): string => {
    const isH = clip.transform.scaleX === -1;
    const isV = clip.transform.scaleY === -1;
    if (isH && isV) return "Both";
    if (isH) return "Horizontal";
    if (isV) return "Vertical";
    return "None";
  };

  const activeFlipLabel = getFlipLabel();

  const handleAlign = (position: AnchorPosition) => {
    const curW = clip.transform.width;
    const curH = clip.transform.height;
    let nextX = clip.transform.x;
    let nextY = clip.transform.y;

    switch (position) {
      case "center":
        nextX = Math.round((projW - curW) / 2);
        nextY = Math.round((projH - curH) / 2);
        break;
      case "top-left":
        nextX = 0;
        nextY = 0;
        break;
      case "top-center":
        nextX = Math.round((projW - curW) / 2);
        nextY = 0;
        break;
      case "top-right":
        nextX = Math.max(0, projW - curW);
        nextY = 0;
        break;
      case "left-center":
        nextX = 0;
        nextY = Math.round((projH - curH) / 2);
        break;
      case "right-center":
        nextX = Math.max(0, projW - curW);
        nextY = Math.round((projH - curH) / 2);
        break;
      case "bottom-left":
        nextX = 0;
        nextY = Math.max(0, projH - curH);
        break;
      case "bottom-center":
        nextX = Math.round((projW - curW) / 2);
        nextY = Math.max(0, projH - curH);
        break;
      case "bottom-right":
        nextX = Math.max(0, projW - curW);
        nextY = Math.max(0, projH - curH);
        break;
    }

    commitTransform({ x: nextX, y: nextY });
  };

  const handleFit = () => {
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: "contain",
    });
  };

  const handleFill = () => {
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: "cover",
    });
  };

  const handleToggleCrop = () => {
    setActiveTool(isCropping ? "canvas" : "crop");
  };

  const handleCropChange = (side: keyof CropSettings, value: number) => {
    commitTransform({
      crop: {
        ...crop,
        [side]: Math.max(0, Math.min(80, value)),
      },
    });
  };

  const handleResetCrop = () => {
    commitTransform({ crop: { top: 0, right: 0, bottom: 0, left: 0 } });
    if (isCropping) setActiveTool("canvas");
  };

  const handleFlipH = () => {
    commitTransform({ scaleX: clip.transform.scaleX === -1 ? 1 : -1 });
  };

  const handleFlipV = () => {
    commitTransform({ scaleY: clip.transform.scaleY === -1 ? 1 : -1 });
  };

  const handleReset = () => {
    updateClip(clip.id, {
      transform: {
        x: 0,
        y: 0,
        width: projW,
        height: projH,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        crop: { top: 0, right: 0, bottom: 0, left: 0 },
        fitMode: "contain",
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    });
    setCustomSizeOpen(false);
    if (isCropping) setActiveTool("canvas");
  };

  const isFramingOpen = framingExpanded || isCropping;

  return (
    <div className="flex flex-col text-xs text-studio-fg pb-3 select-none">
      {/* Row 1: Fit & Framing */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={toggleFramingExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">Framing</span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            <span>
              {isCropping || hasActiveCrop
                ? "Crop"
                : clip.transform.fitMode === "cover"
                ? "Fill"
                : "Fit"}
            </span>
            {isFramingOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Framing Controls */}
        {isFramingOpen && (
          <div className="mt-2.5 space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleFit}
                className={cn(
                  "py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-medium transition-all cursor-pointer",
                  clip.transform.fitMode === "contain" && !isCropping && !hasActiveCrop
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                <Maximize2 className="h-3 w-3" /> Fit
              </button>
              <button
                type="button"
                onClick={handleFill}
                className={cn(
                  "py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-medium transition-all cursor-pointer",
                  clip.transform.fitMode === "cover" && !isCropping && !hasActiveCrop
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                Fill
              </button>
              <button
                type="button"
                onClick={handleToggleCrop}
                className={cn(
                  "py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-medium transition-all cursor-pointer",
                  isCropping || hasActiveCrop
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                <Crop className="h-3 w-3" /> {isCropping ? "Cropping" : "Crop"}
              </button>
            </div>

            {/* Inset Sliders when cropping or has active crop */}
            {(isCropping || hasActiveCrop) && (
              <div className="space-y-2 pt-2 border-t border-studio-border">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-studio-muted">Crop Insets (%)</span>
                  {hasActiveCrop && (
                    <button
                      type="button"
                      onClick={handleResetCrop}
                      className="text-[10px] text-studio-muted hover:text-studio-fg underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px] text-studio-muted">
                      <span>Top</span>
                      <span className="font-mono text-studio-fg">{crop.top}%</span>
                    </div>
                    <Slider
                      value={crop.top}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(val) => handleCropChange("top", val)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px] text-studio-muted">
                      <span>Bottom</span>
                      <span className="font-mono text-studio-fg">{crop.bottom}%</span>
                    </div>
                    <Slider
                      value={crop.bottom}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(val) => handleCropChange("bottom", val)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px] text-studio-muted">
                      <span>Left</span>
                      <span className="font-mono text-studio-fg">{crop.left}%</span>
                    </div>
                    <Slider
                      value={crop.left}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(val) => handleCropChange("left", val)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px] text-studio-muted">
                      <span>Right</span>
                      <span className="font-mono text-studio-fg">{crop.right}%</span>
                    </div>
                    <Slider
                      value={crop.right}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(val) => handleCropChange("right", val)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Dimensions & Scale */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={toggleDimensionsExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">Dimensions</span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            <span>{activeDimensionLabel}</span>
            {dimensionsExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Dimensions Controls */}
        {dimensionsExpanded && (
          <div className="mt-2.5 space-y-2">
            <div className="grid grid-cols-5 gap-1">
              {SIZE_PRESETS.map((p) => {
                const targetW = Math.round(projW * p.scale);
                const targetH = Math.round(projH * p.scale);
                const curW = clip.transform.width;
                const curH = clip.transform.height;
                const isActive =
                  !customSizeOpen &&
                  Math.abs(curW - targetW) <= 2 &&
                  Math.abs(curH - targetH) <= 2;

                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplySizePreset(p.scale)}
                    className={cn(
                      "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                        : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                    )}
                  >
                    {p.label.split(" ")[0]}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCustomSizeOpen((prev) => !prev)}
                className={cn(
                  "py-1.5 rounded-md text-center text-[10px] font-medium transition-all cursor-pointer",
                  customSizeOpen
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom Width & Height Inputs */}
            {customSizeOpen && (
              <div className="flex items-center gap-1.5 pt-1">
                {/* W Input */}
                <div className="flex-1 flex items-center h-[30px] rounded-md bg-studio-panel-raised/60 border border-studio-border hover:border-studio-border-strong focus-within:border-studio-fg/40 focus-within:ring-1 focus-within:ring-studio-fg/20 transition-all px-2.5 gap-2">
                  <span className="text-[10px] font-mono font-medium text-studio-muted select-none">
                    W
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      editingField === "width"
                        ? inputValue
                        : String(Math.round(clip.transform.width * 10) / 10)
                    }
                    onFocus={() => {
                      setEditingField("width");
                      setInputValue(String(Math.round(clip.transform.width * 10) / 10));
                    }}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                    }}
                    onBlur={() => {
                      commitDimension("width", inputValue);
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitDimension("width", inputValue);
                        setEditingField(null);
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-transparent text-xs font-mono text-studio-fg outline-none border-none p-0 focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] font-mono text-studio-muted select-none">
                    px
                  </span>
                </div>

                {/* Aspect Ratio Lock Button */}
                <button
                  type="button"
                  onClick={() => setIsAspectLocked(!isAspectLocked)}
                  title={isAspectLocked ? "Proportions locked (click to unlock)" : "Free size (click to lock)"}
                  className={cn(
                    "h-[30px] w-[30px] rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0",
                    isAspectLocked
                      ? "border-studio-border bg-studio-hover text-studio-fg shadow-xs"
                      : "border-studio-border bg-studio-panel-raised/50 text-studio-muted hover:text-studio-fg hover:bg-studio-hover"
                  )}
                >
                  {isAspectLocked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
                </button>

                {/* H Input */}
                <div className="flex-1 flex items-center h-[30px] rounded-md bg-studio-panel-raised/60 border border-studio-border hover:border-studio-border-strong focus-within:border-studio-fg/40 focus-within:ring-1 focus-within:ring-studio-fg/20 transition-all px-2.5 gap-2">
                  <span className="text-[10px] font-mono font-medium text-studio-muted select-none">
                    H
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      editingField === "height"
                        ? inputValue
                        : String(Math.round(clip.transform.height * 10) / 10)
                    }
                    onFocus={() => {
                      setEditingField("height");
                      setInputValue(String(Math.round(clip.transform.height * 10) / 10));
                    }}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                    }}
                    onBlur={() => {
                      commitDimension("height", inputValue);
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitDimension("height", inputValue);
                        setEditingField(null);
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-transparent text-xs font-mono text-studio-fg outline-none border-none p-0 focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] font-mono text-studio-muted select-none">
                    px
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Position & Alignment */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={togglePositionExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">Position</span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            <span>{activeAnchor ? activeAnchor.label : "Custom"}</span>
            {positionExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Position Controls */}
        {positionExpanded && (
          <div className="mt-2.5 flex items-center gap-2">
            {/* 3x3 Canvas Anchor Pinpad */}
            <div
              className="relative w-[64px] h-[64px] p-1 rounded-md bg-studio-panel-raised/60 border border-studio-border select-none shrink-0 shadow-xs"
              title="Canvas Alignment Anchor"
            >
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
                {ANCHOR_CONFIG.map((pt) => {
                  const isActive = activeAnchor?.id === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleAlign(pt.id)}
                      title={pt.label}
                      className={cn(
                        "group/pt flex items-center justify-center rounded-sm transition-all cursor-pointer",
                        isActive
                          ? "bg-studio-hover border border-studio-border shadow-xs"
                          : "border border-transparent hover:bg-studio-hover"
                      )}
                    >
                      <span
                        className={cn(
                          "rounded-full transition-all duration-150",
                          isActive
                            ? "w-2 h-2 bg-studio-fg"
                            : "w-1.5 h-1.5 bg-studio-muted/40 group-hover/pt:bg-studio-fg"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stacked X & Y Coordinate Inputs */}
            <div className="flex-1 flex flex-col justify-between h-[64px] gap-1">
              {/* X Input */}
              <div className="flex-1 flex items-center h-[30px] rounded-md bg-studio-panel-raised/60 border border-studio-border hover:border-studio-border-strong focus-within:border-studio-fg/40 focus-within:ring-1 focus-within:ring-studio-fg/20 transition-all px-2.5 gap-2">
                <span className="text-[10px] font-mono font-medium text-studio-muted select-none">
                  X
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    editingField === "x"
                      ? inputValue
                      : String(Math.round(clip.transform.x * 10) / 10)
                  }
                  onFocus={() => {
                    setEditingField("x");
                    setInputValue(String(Math.round(clip.transform.x * 10) / 10));
                  }}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  onBlur={() => {
                    commitPosition("x", inputValue);
                    setEditingField(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitPosition("x", inputValue);
                      setEditingField(null);
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono text-studio-fg outline-none border-none p-0 focus:outline-none focus:ring-0"
                />
                <span className="text-[10px] font-mono text-studio-muted select-none">
                  px
                </span>
              </div>

              {/* Y Input */}
              <div className="flex-1 flex items-center h-[30px] rounded-md bg-studio-panel-raised/60 border border-studio-border hover:border-studio-border-strong focus-within:border-studio-fg/40 focus-within:ring-1 focus-within:ring-studio-fg/20 transition-all px-2.5 gap-2">
                <span className="text-[10px] font-mono font-medium text-studio-muted select-none">
                  Y
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    editingField === "y"
                      ? inputValue
                      : String(Math.round(clip.transform.y * 10) / 10)
                  }
                  onFocus={() => {
                    setEditingField("y");
                    setInputValue(String(Math.round(clip.transform.y * 10) / 10));
                  }}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  onBlur={() => {
                    commitPosition("y", inputValue);
                    setEditingField(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitPosition("y", inputValue);
                      setEditingField(null);
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono text-studio-fg outline-none border-none p-0 focus:outline-none focus:ring-0"
                />
                <span className="text-[10px] font-mono text-studio-muted select-none">
                  px
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Flip */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={toggleFlipExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">Flip</span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            <span>{activeFlipLabel}</span>
            {flipExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Flip Controls */}
        {flipExpanded && (
          <div className="mt-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleFlipH}
                className={cn(
                  "py-2 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer",
                  clip.transform.scaleX === -1
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span>Horizontal</span>
              </button>
              <button
                type="button"
                onClick={handleFlipV}
                className={cn(
                  "py-2 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer",
                  clip.transform.scaleY === -1
                    ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                    : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                )}
              >
                <FlipVertical className="h-3.5 w-3.5" />
                <span>Vertical</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 5: Rotation */}
      <div className="py-2.5 border-b border-studio-border">
        <div
          onClick={toggleRotationExpanded}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">Rotation</span>
          <div className="flex items-center gap-1.5 font-medium text-studio-fg transition-colors text-xs">
            <span className="font-mono">{clip.transform.rotation ?? 0}°</span>
            {rotationExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-studio-muted group-hover:text-studio-fg" />
            )}
          </div>
        </div>

        {/* Expanded Rotation Controls */}
        {rotationExpanded && (
          <div className="mt-2.5 space-y-1.5">
            <Slider
              value={clip.transform.rotation ?? 0}
              min={0}
              max={360}
              step={1}
              onValueChange={(val) => {
                commitTransform({ rotation: val });
              }}
            />
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {[0, 90, 180, 270].map((angle) => {
                const isActive = (clip.transform.rotation ?? 0) === angle;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => {
                      commitTransform({ rotation: angle });
                    }}
                    className={cn(
                      "py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-studio-hover text-studio-fg font-semibold border border-studio-border shadow-xs"
                        : "bg-studio-panel-raised/50 text-studio-muted hover:bg-studio-hover hover:text-studio-fg border border-studio-border"
                    )}
                  >
                    {angle}°
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 6: Opacity */}
      <div className="py-2.5 border-b border-studio-border space-y-2 group select-none">
        <div className="flex items-center justify-between">
          <span className="text-studio-muted group-hover:text-studio-fg font-medium transition-colors">
            Opacity
          </span>
          <span className="font-mono text-xs text-studio-fg transition-colors font-medium">
            {Math.round((clip.transform.opacity ?? 1) * 100)}%
          </span>
        </div>
        <Slider
          value={clip.transform.opacity ?? 1}
          min={0}
          max={1}
          step={0.01}
          fillClassName="bg-studio-fg group-hover:bg-studio-fg"
          trackClassName="bg-studio-hover"
          onValueChange={(val) => {
            commitTransform({ opacity: val });
          }}
        />
      </div>

      {/* Row 6: Reset Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleReset}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-studio-border bg-studio-panel-raised/40 text-xs text-studio-muted hover:border-studio-border-strong hover:bg-studio-hover hover:text-studio-fg cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-studio-muted" /> Reset Transform
        </button>
      </div>
    </div>
  );
}
