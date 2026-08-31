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
  Lock,
  Unlock,
  Move,
  SlidersHorizontal,
} from "lucide-react";

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
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

const formatNum = (num: number) => Math.round(num * 10) / 10;

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
    x: formatNum(x),
    y: formatNum(y),
    width: formatNum(width),
    height: formatNum(height),
    rotation: formatNum(rotation),
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

export function TransformTab({ clip }: TransformTabProps) {
  const { updateClip, currentProject } = useProjectStore();
  const { activeTool, setActiveTool } = useEditorUIStore();

  const [isAspectLocked, setIsAspectLocked] = useState(true);

  const isCropping = activeTool === "crop";
  const crop: CropSettings = clip.transform.crop || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const hasActiveCrop =
    crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0;

  // IMPORTANT: depend on individual primitives, NOT the object reference.
  // Depending on clip.transform (object) causes an infinite update loop because
  // every updateClip() call creates a new object reference.
  const tX = clip.transform.x;
  const tY = clip.transform.y;
  const tW = clip.transform.width;
  const tH = clip.transform.height;
  const tRot = clip.transform.rotation;
  const tOp = clip.transform.opacity;

  const [draft, setDraft] = useState(() =>
    createTransformDraft(clip.id, tX, tY, tW, tH, tRot, tOp),
  );
  const { x, y, width, height, rotation, opacity } = draft;

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

  const handleFit = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: "contain",
    });
  };

  const handleFill = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    commitTransform({
      x: 0,
      y: 0,
      width: projW,
      height: projH,
      fitMode: "cover",
    });
  };

  const handleCenter = () => {
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
    const nextX = Math.round((projW - clip.transform.width) / 2);
    const nextY = Math.round((projH - clip.transform.height) / 2);
    setDraft((current) => ({ ...current, x: nextX, y: nextY }));
    commitTransform({ x: nextX, y: nextY });
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
    const projW = currentProject?.settings.width || 1920;
    const projH = currentProject?.settings.height || 1080;
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
    if (isCropping) setActiveTool("canvas");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentVal: number,
    field: keyof TimelineClip["transform"],
  ) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const newVal = Math.round((currentVal + delta) * 10) / 10;
    setDraft((current) => ({ ...current, [field]: newVal }));
    commitTransform({ [field]: newVal });
  };

  return (
    <div className="flex flex-col gap-4 text-studio-fg">
      {/* Quick Layout Actions */}
      <div className="grid grid-cols-4 gap-0.5 rounded-lg border border-studio-border bg-studio-bg/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        <button
          type="button"
          onClick={handleFit}
          className={`flex h-9 items-center justify-center gap-1 rounded-md text-[11px] transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            clip.transform.fitMode === "contain"
              ? "bg-brand text-white font-bold shadow-sm"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised font-medium"
          }`}
        >
          <Maximize2 className="h-3 w-3" /> Fit
        </button>
        <button
          type="button"
          onClick={handleFill}
          className={`flex h-9 items-center justify-center gap-1 rounded-md text-[11px] transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            clip.transform.fitMode === "cover"
              ? "bg-brand text-white font-bold shadow-sm"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised font-medium"
          }`}
        >
          Fill
        </button>
        <button
          type="button"
          onClick={handleCenter}
          className="flex h-9 items-center justify-center gap-1 rounded-md text-[11px] text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised font-medium transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Center
        </button>
        <button
          type="button"
          onClick={handleToggleCrop}
          className={`flex h-9 items-center justify-center gap-1 rounded-md text-[11px] transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            isCropping || hasActiveCrop
              ? "bg-brand text-white font-bold shadow-sm"
              : "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised font-medium"
          }`}
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

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleFlipH}
          className={`flex h-9 items-center justify-center gap-1.5 rounded-md text-xs transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            clip.transform.scaleX === -1
              ? "bg-brand text-white font-bold shadow-sm"
              : "border border-studio-border bg-studio-bg/45 text-studio-fg hover:border-brand/40 hover:bg-studio-panel-raised font-medium"
          }`}
        >
          <FlipHorizontal className="h-3 w-3" /> Flip H
        </button>
        <button
          type="button"
          onClick={handleFlipV}
          className={`flex h-9 items-center justify-center gap-1.5 rounded-md text-xs transition-[background-color,color,box-shadow] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            clip.transform.scaleY === -1
              ? "bg-brand text-white font-bold shadow-sm"
              : "border border-studio-border bg-studio-bg/45 text-studio-fg hover:border-brand/40 hover:bg-studio-panel-raised font-medium"
          }`}
        >
          <FlipVertical className="h-3 w-3" /> Flip V
        </button>
      </div>

      {/* Position & Dimensions */}
      <section className="border-t border-studio-border/80 pt-4">
        <div className="mb-3 flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised text-brand">
            <Move className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-semibold text-studio-fg">
              Position & size
            </h3>
            <p className="mt-0.5 text-[10px] leading-4 text-studio-muted">
              Place and size this layer on the canvas.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-studio-muted block mb-1">
              X Position (px)
            </label>
            <Input
              type="number"
              value={x}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  x: parseFloat(e.target.value) || 0,
                }))
              }
              onBlur={() => commitTransform({ x })}
              onKeyDown={(e) => handleKeyDown(e, x, "x")}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-studio-muted block mb-1">
              Y Position (px)
            </label>
            <Input
              type="number"
              value={y}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  y: parseFloat(e.target.value) || 0,
                }))
              }
              onBlur={() => commitTransform({ y })}
              onKeyDown={(e) => handleKeyDown(e, y, "y")}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-studio-muted">
                Width (px)
              </label>
              <button
                type="button"
                onClick={() => setIsAspectLocked(!isAspectLocked)}
                className="text-studio-muted hover:text-brand transition-colors"
                title={
                  isAspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"
                }
              >
                {isAspectLocked ? (
                  <Lock className="h-3 w-3 text-brand" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </button>
            </div>
            <Input
              type="number"
              value={width}
              onChange={(e) => {
                const newW = parseFloat(e.target.value) || 20;
                setDraft((current) => {
                  const next = { ...current, width: newW };
                  if (isAspectLocked && clip.transform.width > 0) {
                    const ratio = clip.transform.height / clip.transform.width;
                    next.height = Math.round(newW * ratio);
                  }
                  return next;
                });
              }}
              onBlur={() => commitTransform({ width, height })}
              onKeyDown={(e) => handleKeyDown(e, width, "width")}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-studio-muted block mb-1">
              Height (px)
            </label>
            <Input
              type="number"
              value={height}
              onChange={(e) => {
                const newH = parseFloat(e.target.value) || 20;
                setDraft((current) => {
                  const next = { ...current, height: newH };
                  if (isAspectLocked && clip.transform.height > 0) {
                    const ratio = clip.transform.width / clip.transform.height;
                    next.width = Math.round(newH * ratio);
                  }
                  return next;
                });
              }}
              onBlur={() => commitTransform({ width, height })}
              onKeyDown={(e) => handleKeyDown(e, height, "height")}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>
      </section>

      {/* Rotation & Opacity */}
      <section className="border-t border-studio-border/80 pt-4">
        <div className="mb-3 flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised text-brand">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-semibold text-studio-fg">Appearance</h3>
            <p className="mt-0.5 text-[10px] leading-4 text-studio-muted">
              Refine rotation and layer visibility.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-studio-muted">
                Rotation (°)
              </label>
              <span className="font-mono text-xs text-studio-fg">
                {rotation}°
              </span>
            </div>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              onValueChange={(val) => {
                setDraft((current) => ({ ...current, rotation: val }));
                commitTransform({ rotation: val });
              }}
            />
            <div className="mt-2 flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const nextRot = (Math.round(rotation - 90) + 360) % 360;
                  setDraft((current) => ({ ...current, rotation: nextRot }));
                  commitTransform({ rotation: nextRot });
                }}
                className="h-6 flex-1 text-[10px] font-mono"
                title="Rotate -90°"
              >
                -90°
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setDraft((current) => ({ ...current, rotation: 0 }));
                  commitTransform({ rotation: 0 });
                }}
                disabled={rotation === 0}
                className="h-6 flex-1 text-[10px] font-mono"
                title="Reset angle to 0°"
              >
                0°
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const nextRot = Math.round(rotation + 90) % 360;
                  setDraft((current) => ({ ...current, rotation: nextRot }));
                  commitTransform({ rotation: nextRot });
                }}
                className="h-6 flex-1 text-[10px] font-mono"
                title="Rotate +90°"
              >
                +90°
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-studio-muted">
                Opacity
              </label>
              <span className="font-mono text-xs text-studio-fg">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(val) => {
                setDraft((current) => ({ ...current, opacity: val }));
                commitTransform({ opacity: val });
              }}
            />
          </div>
        </div>
      </section>

      {/* Reset Action */}
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
