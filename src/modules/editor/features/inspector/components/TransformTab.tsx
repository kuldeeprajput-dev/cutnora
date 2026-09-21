"use client";

import React, { useState, useEffect } from "react";
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

export interface TransformTabProps {
  clip: TimelineClip;
}

interface TransformDraft {
  sourceClipId: string;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceRotation: number;
  sourceOpacity: number;
  x: string;
  y: string;
  width: string;
  height: string;
  rotation: number;
  opacity: number;
}

function createTransformDraft(
  clipId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  opacity: number,
): TransformDraft {
  return {
    sourceClipId: clipId,
    sourceX: x,
    sourceY: y,
    sourceWidth: width,
    sourceHeight: height,
    sourceRotation: rotation,
    sourceOpacity: opacity,
    x: String(Math.round(x * 10) / 10),
    y: String(Math.round(y * 10) / 10),
    width: String(Math.round(width * 10) / 10),
    height: String(Math.round(height * 10) / 10),
    rotation: Math.round(rotation * 10) / 10,
    opacity,
  };
}

function draftMatchesSource(
  draft: TransformDraft,
  clipId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  opacity: number,
) {
  return (
    draft.sourceClipId === clipId &&
    Object.is(draft.sourceX, x) &&
    Object.is(draft.sourceY, y) &&
    Object.is(draft.sourceWidth, width) &&
    Object.is(draft.sourceHeight, height) &&
    Object.is(draft.sourceRotation, rotation) &&
    Object.is(draft.sourceOpacity, opacity)
  );
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
  const { updateClip, currentProject } = useProjectStore();
  const { activeTool, setActiveTool } = useEditorUIStore();

  const [isAspectLocked, setIsAspectLocked] = useState(true);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [framingExpanded, setFramingExpanded] = useState(false);
  const [dimensionsExpanded, setDimensionsExpanded] = useState(false);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const [flipExpanded, setFlipExpanded] = useState(false);
  const [rotationExpanded, setRotationExpanded] = useState(false);

  const isCropping = activeTool === "crop";
  const crop: CropSettings = clip.transform.crop || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const hasActiveCrop =
    crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0;

  const tX = clip.transform.x;
  const tY = clip.transform.y;
  const tW = clip.transform.width;
  const tH = clip.transform.height;
  const tRot = clip.transform.rotation;
  const tOp = clip.transform.opacity;

  const [draft, setDraft] = useState(() =>
    createTransformDraft(clip.id, tX, tY, tW, tH, tRot, tOp),
  );

  useEffect(() => {
    setDraft((current) =>
      draftMatchesSource(current, clip.id, tX, tY, tW, tH, tRot, tOp)
        ? current
        : createTransformDraft(clip.id, tX, tY, tW, tH, tRot, tOp),
    );
  }, [clip.id, tX, tY, tW, tH, tRot, tOp]);

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

  const commitDimension = (key: "width" | "height") => {
    const raw = draft[key].trim();
    const parsed = Number.parseFloat(raw);

    if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
      setDraft((current) => ({
        ...current,
        width: String(Math.round(clip.transform.width * 10) / 10),
        height: String(Math.round(clip.transform.height * 10) / 10),
      }));
      return;
    }

    const value = Math.max(10, Math.min(7680, Math.round(parsed)));
    let nextW =
      key === "width"
        ? value
        : Number.parseFloat(draft.width) || clip.transform.width;
    let nextH =
      key === "height"
        ? value
        : Number.parseFloat(draft.height) || clip.transform.height;

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

    setDraft((current) => ({
      ...current,
      width: String(nextW),
      height: String(nextH),
    }));
    commitTransform({ width: nextW, height: nextH });
  };

  const commitPosition = (key: "x" | "y") => {
    const raw = draft[key].trim();
    const parsed = Number.parseFloat(raw);

    if (!raw || !Number.isFinite(parsed)) {
      setDraft((current) => ({
        ...current,
        x: String(Math.round(clip.transform.x * 10) / 10),
        y: String(Math.round(clip.transform.y * 10) / 10),
      }));
      return;
    }

    const value = Math.round(parsed * 10) / 10;
    setDraft((current) => ({
      ...current,
      [key]: String(value),
    }));
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

    setDraft((current) => ({
      ...current,
      width: String(newW),
      height: String(newH),
      x: String(newX),
      y: String(newY),
    }));
    commitTransform({
      width: newW,
      height: newH,
      x: newX,
      y: newY,
      fitMode: scale === 1 ? "contain" : undefined,
    });
  };

  const getActiveAnchor = (): AnchorPointConfig | null => {
    const curW = Number.parseFloat(draft.width) || clip.transform.width;
    const curH = Number.parseFloat(draft.height) || clip.transform.height;
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
    const curW = Number.parseFloat(draft.width) || clip.transform.width;
    const curH = Number.parseFloat(draft.height) || clip.transform.height;

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
    const curW = Number.parseFloat(draft.width) || clip.transform.width;
    const curH = Number.parseFloat(draft.height) || clip.transform.height;
    let nextX = Number.parseFloat(draft.x) || 0;
    let nextY = Number.parseFloat(draft.y) || 0;

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

    setDraft((current) => ({
      ...current,
      x: String(nextX),
      y: String(nextY),
    }));
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
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      {/* Row 1: Fit & Framing */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setFramingExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">Framing</span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span>
              {isCropping || hasActiveCrop
                ? "Crop"
                : clip.transform.fitMode === "cover"
                ? "Fill"
                : "Fit"}
            </span>
            {isFramingOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                )}
              >
                <Crop className="h-3 w-3" /> {isCropping ? "Cropping" : "Crop"}
              </button>
            </div>

            {/* Inset Sliders when cropping or has active crop */}
            {(isCropping || hasActiveCrop) && (
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Crop Insets (%)</span>
                  {hasActiveCrop && (
                    <button
                      type="button"
                      onClick={handleResetCrop}
                      className="text-[10px] text-white/40 hover:text-white underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px] text-white/45">
                      <span>Top</span>
                      <span className="font-mono text-white/80">{crop.top}%</span>
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
                    <div className="flex justify-between mb-0.5 text-[10px] text-white/45">
                      <span>Bottom</span>
                      <span className="font-mono text-white/80">{crop.bottom}%</span>
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
                    <div className="flex justify-between mb-0.5 text-[10px] text-white/45">
                      <span>Left</span>
                      <span className="font-mono text-white/80">{crop.left}%</span>
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
                    <div className="flex justify-between mb-0.5 text-[10px] text-white/45">
                      <span>Right</span>
                      <span className="font-mono text-white/80">{crop.right}%</span>
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
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setDimensionsExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">Dimensions</span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span>{activeDimensionLabel}</span>
            {dimensionsExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
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
                const curW = Number.parseFloat(draft.width) || clip.transform.width;
                const curH = Number.parseFloat(draft.height) || clip.transform.height;
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
                        ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom Width & Height Inputs */}
            {customSizeOpen && (
              <div className="flex items-center gap-1.5 pt-1">
                {/* W Input */}
                <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
                  <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                    W
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.width}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((current) => ({ ...current, width: val }));
                    }}
                    onBlur={() => commitDimension("width")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitDimension("width");
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] font-mono text-white/30 select-none">
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
                      ? "border-white/25 bg-white/15 text-white shadow-xs"
                      : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  {isAspectLocked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
                </button>

                {/* H Input */}
                <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
                  <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                    H
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.height}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((current) => ({ ...current, height: val }));
                    }}
                    onBlur={() => commitDimension("height")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitDimension("height");
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] font-mono text-white/30 select-none">
                    px
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Position & Alignment */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setPositionExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">Position</span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span>{activeAnchor ? activeAnchor.label : "Custom"}</span>
            {positionExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {/* Expanded Position Controls */}
        {positionExpanded && (
          <div className="mt-2.5 flex items-center gap-2">
            {/* 3x3 Canvas Anchor Pinpad */}
            <div
              className="relative w-[64px] h-[64px] p-1 rounded-md bg-white/[0.03] border border-white/10 select-none shrink-0 shadow-xs"
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
                          ? "bg-white/15 border border-white/25 shadow-xs"
                          : "border border-transparent hover:bg-white/[0.06]"
                      )}
                    >
                      <span
                        className={cn(
                          "rounded-full transition-all duration-150",
                          isActive
                            ? "w-2 h-2 bg-white"
                            : "w-1.5 h-1.5 bg-white/30 group-hover/pt:bg-white/70"
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
              <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
                <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                  X
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.x}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft((current) => ({ ...current, x: val }));
                  }}
                  onBlur={() => commitPosition("x")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitPosition("x");
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                />
                <span className="text-[10px] font-mono text-white/30 select-none">
                  px
                </span>
              </div>

              {/* Y Input */}
              <div className="flex-1 flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
                <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                  Y
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.y}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft((current) => ({ ...current, y: val }));
                  }}
                  onBlur={() => commitPosition("y")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitPosition("y");
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                />
                <span className="text-[10px] font-mono text-white/30 select-none">
                  px
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Flip */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setFlipExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">Flip</span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span>{activeFlipLabel}</span>
            {flipExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
                    ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setRotationExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">Rotation</span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span className="font-mono">{draft.rotation}°</span>
            {rotationExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {/* Expanded Rotation Controls */}
        {rotationExpanded && (
          <div className="mt-2.5 space-y-1.5">
            <Slider
              value={draft.rotation}
              min={0}
              max={360}
              step={1}
              onValueChange={(val) => {
                setDraft((current) => ({ ...current, rotation: val }));
                commitTransform({ rotation: val });
              }}
            />
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {[0, 90, 180, 270].map((angle) => {
                const isActive = draft.rotation === angle;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => {
                      setDraft((current) => ({ ...current, rotation: angle }));
                      commitTransform({ rotation: angle });
                    }}
                    className={cn(
                      "py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-white/15 text-white font-semibold border border-white/25 shadow-xs"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
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
      <div className="py-2.5 border-b border-white/[0.06] space-y-2 group select-none">
        <div className="flex items-center justify-between">
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Opacity
          </span>
          <span className="font-mono text-xs text-white/80 group-hover:text-white transition-colors font-medium">
            {Math.round(draft.opacity * 100)}%
          </span>
        </div>
        <Slider
          value={draft.opacity}
          min={0}
          max={1}
          step={0.01}
          fillClassName="bg-white/90 group-hover:bg-white"
          trackClassName="bg-white/10"
          onValueChange={(val) => {
            setDraft((current) => ({ ...current, opacity: val }));
            commitTransform({ opacity: val });
          }}
        />
      </div>

      {/* Row 6: Reset Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleReset}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-white/40" /> Reset Transform
        </button>
      </div>
    </div>
  );
}
