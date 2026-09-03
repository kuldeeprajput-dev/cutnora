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
  { label: "50% Half", sub: "Half screen", scale: 0.5 },
  { label: "25% PiP", sub: "Corner mini", scale: 0.25 },
];

export function TransformTab({ clip }: TransformTabProps) {
  const { updateClip, currentProject } = useProjectStore();
  const { activeTool, setActiveTool } = useEditorUIStore();

  const [isAspectLocked, setIsAspectLocked] = useState(true);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);

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

  const handleAlign = (
    position:
      | "center"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right",
  ) => {
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
      case "top-right":
        nextX = Math.max(0, projW - curW);
        nextY = 0;
        break;
      case "bottom-left":
        nextX = 0;
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

  return (
    <div className="flex flex-col gap-3 text-studio-fg pb-2">
      {/* 1. Quick Layout Actions */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-studio-border/80 bg-studio-bg/35 p-1.5">
        <button
          type="button"
          onClick={handleFit}
          className={cn(
            "flex h-8 items-center justify-center gap-1 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all",
            clip.transform.fitMode === "contain"
              ? "bg-brand text-white shadow-xs font-bold"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel",
          )}
        >
          <Maximize2 className="h-3 w-3" /> Fit
        </button>
        <button
          type="button"
          onClick={handleFill}
          className={cn(
            "flex h-8 items-center justify-center gap-1 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all",
            clip.transform.fitMode === "cover"
              ? "bg-brand text-white shadow-xs font-bold"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel",
          )}
        >
          Fill
        </button>
        <button
          type="button"
          onClick={handleToggleCrop}
          className={cn(
            "flex h-8 items-center justify-center gap-1 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all",
            isCropping || hasActiveCrop
              ? "bg-brand text-white shadow-xs font-bold"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel",
          )}
        >
          <Crop className="h-3 w-3" /> {isCropping ? "Cropping" : "Crop"}
        </button>
      </div>

      {/* Crop Controls Section (Visible when cropping or crop exists) */}
      {(isCropping || hasActiveCrop) && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand/40 bg-brand/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand flex items-center gap-1.5">
              <Crop className="h-3.5 w-3.5" /> Clip Crop Offsets (%)
            </span>
            {hasActiveCrop && (
              <button
                type="button"
                onClick={handleResetCrop}
                className="text-[10px] text-studio-muted hover:text-brand underline cursor-pointer"
              >
                Reset Crop
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Top</span>
                <span className="font-mono">{crop.top}%</span>
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
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Bottom</span>
                <span className="font-mono">{crop.bottom}%</span>
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
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Left</span>
                <span className="font-mono">{crop.left}%</span>
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
              <div className="flex justify-between mb-0.5 text-studio-muted">
                <span>Right</span>
                <span className="font-mono">{crop.right}%</span>
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

      {/* 2. Layer Size & Presets (Beginner Friendly like Canvas Settings) */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Move className="h-3.5 w-3.5 text-brand" /> Clip Size & Scale
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Choose a quick size or enter custom dimensions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAspectLocked((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer",
              isAspectLocked
                ? "border-brand/40 bg-brand/10 text-brand font-semibold"
                : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg",
            )}
          >
            {isAspectLocked ? (
              <Link2 className="h-3 w-3" />
            ) : (
              <Link2Off className="h-3 w-3" />
            )}
            <span>{isAspectLocked ? "Proportions Locked" : "Free Size"}</span>
          </button>
        </div>

        {/* Quick Size Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {SIZE_PRESETS.map((p) => {
            const targetW = Math.round(projW * p.scale);
            const targetH = Math.round(projH * p.scale);
            const curW = Number.parseFloat(draft.width) || clip.transform.width;
            const curH =
              Number.parseFloat(draft.height) || clip.transform.height;
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
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none",
                  isActive
                    ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                    : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-bold",
                    isActive ? "text-brand" : "text-studio-fg",
                  )}
                >
                  {p.label}
                </span>
                <span
                  className={cn(
                    "text-[9px] mt-0.5",
                    isActive
                      ? "text-brand/80 font-medium"
                      : "text-studio-muted",
                  )}
                >
                  {p.sub}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={customSizeOpen}
            onClick={() => setCustomSizeOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border p-2 transition-all cursor-pointer select-none",
              customSizeOpen
                ? "border-brand bg-brand/15 text-brand shadow-xs ring-1 ring-brand/50 scale-[1.01]"
                : "border-studio-border bg-studio-panel text-studio-muted hover:border-brand/40 hover:bg-studio-panel-raised hover:text-studio-fg",
            )}
          >
            <span
              className={cn(
                "text-xs font-bold",
                customSizeOpen ? "text-brand" : "text-studio-fg",
              )}
            >
              Custom
            </span>
            <span
              className={cn(
                "mt-0.5 text-[9px]",
                customSizeOpen
                  ? "text-brand/80 font-medium"
                  : "text-studio-muted",
              )}
            >
              Enter size
            </span>
          </button>
        </div>

        {/* Width & Height Custom Inputs (Visible when Custom is chosen) */}
        {customSizeOpen ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-studio-border bg-studio-panel/50 p-2.5">
            <div>
              <label className="text-[10px] font-medium text-studio-muted block mb-1">
                Width (px)
              </label>
              <div className="relative">
                <Input
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
                onClick={() => setIsAspectLocked(!isAspectLocked)}
                title={
                  isAspectLocked
                    ? "Click to unlock aspect ratio"
                    : "Click to lock aspect ratio"
                }
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer",
                  isAspectLocked
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-studio-border bg-studio-panel text-studio-muted",
                )}
              >
                {isAspectLocked ? (
                  <Link2 className="h-3.5 w-3.5" />
                ) : (
                  <Link2Off className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div>
              <label className="text-[10px] font-medium text-studio-muted block mb-1">
                Height (px)
              </label>
              <div className="relative">
                <Input
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

      {/* 3. Position & Alignment */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-brand" /> Position &
              Alignment
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Snap to canvas corners or fine-tune coordinates
            </p>
          </div>
        </div>

        {/* Quick Position Snap Buttons */}
        <div className="grid grid-cols-5 gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAlign("top-left")}
            className="h-7 text-[10px] px-1 font-medium cursor-pointer"
            title="Top Left"
          >
            ↖ Top-L
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAlign("top-right")}
            className="h-7 text-[10px] px-1 font-medium cursor-pointer"
            title="Top Right"
          >
            ↗ Top-R
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAlign("center")}
            className="h-7 text-[10px] px-1 font-bold text-brand cursor-pointer"
            title="Center Canvas"
          >
            ⊙ Center
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAlign("bottom-left")}
            className="h-7 text-[10px] px-1 font-medium cursor-pointer"
            title="Bottom Left"
          >
            ↙ Btm-L
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAlign("bottom-right")}
            className="h-7 text-[10px] px-1 font-medium cursor-pointer"
            title="Bottom Right"
          >
            ↘ Btm-R
          </Button>
        </div>

        {/* Exact Coordinates Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              X Position (px)
            </label>
            <div className="relative">
              <Input
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
                className="h-8 text-xs font-mono pr-7"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              Y Position (px)
            </label>
            <div className="relative">
              <Input
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
                className="h-8 text-xs font-mono pr-7"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                px
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Appearance: Rotation, Opacity & Flipping */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-brand" /> Rotation
              & Appearance
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Rotate, flip, or adjust layer transparency
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
            {draft.rotation}°
          </span>
        </div>

        {/* Flip Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleFlipH}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer border",
              clip.transform.scaleX === -1
                ? "border-brand bg-brand text-white shadow-xs font-bold"
                : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg hover:border-brand/40",
            )}
          >
            <FlipHorizontal className="h-3.5 w-3.5" /> Flip Horizontal
          </button>
          <button
            type="button"
            onClick={handleFlipV}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer border",
              clip.transform.scaleY === -1
                ? "border-brand bg-brand text-white shadow-xs font-bold"
                : "border-studio-border bg-studio-panel text-studio-muted hover:text-studio-fg hover:border-brand/40",
            )}
          >
            <FlipVertical className="h-3.5 w-3.5" /> Flip Vertical
          </button>
        </div>

        {/* Rotation Slider & Quick Angles */}
        <div className="space-y-2">
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
          <div className="grid grid-cols-4 gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft((current) => ({ ...current, rotation: 0 }));
                commitTransform({ rotation: 0 });
              }}
              disabled={draft.rotation === 0}
              className="h-6 text-[10px] font-mono"
              title="Reset angle to 0°"
            >
              0°
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft((current) => ({ ...current, rotation: 90 }));
                commitTransform({ rotation: 90 });
              }}
              className="h-6 text-[10px] font-mono"
              title="Rotate 90°"
            >
              90°
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft((current) => ({ ...current, rotation: 180 }));
                commitTransform({ rotation: 180 });
              }}
              className="h-6 text-[10px] font-mono"
              title="Rotate 180°"
            >
              180°
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft((current) => ({ ...current, rotation: 270 }));
                commitTransform({ rotation: 270 });
              }}
              className="h-6 text-[10px] font-mono"
              title="Rotate 270°"
            >
              270°
            </Button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-studio-muted">
              Layer Opacity
            </label>
            <span className="font-mono text-xs font-bold text-studio-fg">
              {Math.round(draft.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={draft.opacity}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => {
              setDraft((current) => ({ ...current, opacity: val }));
              commitTransform({ opacity: val });
            }}
          />
        </div>
      </section>

      {/* 5. Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReset}
        className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Transform & Properties
      </Button>
    </div>
  );
}
