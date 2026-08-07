'use client';

import React, { useState, useRef } from 'react';
import type { TimelineClip, CropSettings } from '@/modules/editor/types';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Check, X, RotateCcw, Move, ArrowUpDown, ArrowLeftRight, Crop } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface CropOverlayProps {
  clip: TimelineClip;
  stageScale: number;
}

type DragHandleType = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export function CropOverlay({ clip, stageScale }: CropOverlayProps) {
  const { setActiveTool } = useEditorUIStore();
  const { updateClip } = useProjectStore();
  const [activeRatio, setActiveRatio] = useState<string | null>(null);

  // Keep initial crop for cancel functionality
  const initialCropRef = useRef<CropSettings | undefined>(clip.transform.crop);

  const crop = clip.transform.crop || { top: 0, right: 0, bottom: 0, left: 0 };

  const handleApplyCrop = () => {
    setActiveTool('canvas');
  };

  const handleCancelCrop = () => {
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        crop: initialCropRef.current,
      },
    });
    setActiveTool('canvas');
  };

  const handleResetCrop = () => {
    setActiveRatio(null);
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        crop: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    });
  };

  const applyAspectRatio = (rKey: string, ratioVal: number | null) => {
    setActiveRatio(rKey);
    if (!ratioVal) return; // Free crop

    const clipW = clip.transform.width;
    const clipH = clip.transform.height;
    const currentAspect = clipW / clipH;

    let newTop = 0;
    let newBottom = 0;
    let newLeft = 0;
    let newRight = 0;

    if (currentAspect > ratioVal) {
      // Image is wider than target ratio: crop left and right
      const targetW = clipH * ratioVal;
      const cropW = (clipW - targetW) / 2;
      const pct = (cropW / clipW) * 100;
      newLeft = pct;
      newRight = pct;
    } else {
      // Image is taller than target ratio: crop top and bottom
      const targetH = clipW / ratioVal;
      const cropH = (clipH - targetH) / 2;
      const pct = (cropH / clipH) * 100;
      newTop = pct;
      newBottom = pct;
    }

    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        crop: {
          top: Math.max(0, Math.min(45, Number(newTop.toFixed(2)))),
          bottom: Math.max(0, Math.min(45, Number(newBottom.toFixed(2)))),
          left: Math.max(0, Math.min(45, Number(newLeft.toFixed(2)))),
          right: Math.max(0, Math.min(45, Number(newRight.toFixed(2)))),
        },
      },
    });
  };

  // Dimensions of full clip on stage in pixels
  const left = clip.transform.x * stageScale;
  const top = clip.transform.y * stageScale;
  const fullWidth = Math.max(50, clip.transform.width * stageScale);
  const fullHeight = Math.max(50, clip.transform.height * stageScale);

  // Active cropped region coordinates relative to clip
  const cropLeftPx = (crop.left / 100) * fullWidth;
  const cropTopPx = (crop.top / 100) * fullHeight;
  const cropRightPx = (crop.right / 100) * fullWidth;
  const cropBottomPx = (crop.bottom / 100) * fullHeight;
  const cropWidthPx = Math.max(20, fullWidth - cropLeftPx - cropRightPx);
  const cropHeightPx = Math.max(20, fullHeight - cropTopPx - cropBottomPx);

  // Pointer drag handler for crop edge & corner handles
  const handleStartDragHandle = (handleType: DragHandleType, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const startTop = crop.top;
    const startBottom = crop.bottom;
    const startLeft = crop.left;
    const startRight = crop.right;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;

      const deltaLeftPct = (deltaX / fullWidth) * 100;
      const deltaTopPct = (deltaY / fullHeight) * 100;

      let newTop = startTop;
      let newBottom = startBottom;
      let newLeft = startLeft;
      let newRight = startRight;

      if (handleType.includes('n')) {
        newTop = Math.max(0, Math.min(100 - startBottom - 5, startTop + deltaTopPct));
      }
      if (handleType.includes('s')) {
        newBottom = Math.max(0, Math.min(100 - startTop - 5, startBottom - deltaTopPct));
      }
      if (handleType.includes('w')) {
        newLeft = Math.max(0, Math.min(100 - startRight - 5, startLeft + deltaLeftPct));
      }
      if (handleType.includes('e')) {
        newRight = Math.max(0, Math.min(100 - startLeft - 5, startRight - deltaLeftPct));
      }

      updateClip(clip.id, {
        transform: {
          ...clip.transform,
          crop: {
            top: Number(newTop.toFixed(2)),
            bottom: Number(newBottom.toFixed(2)),
            left: Number(newLeft.toFixed(2)),
            right: Number(newRight.toFixed(2)),
          },
        },
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Pan active crop window by dragging inside the box
  const handleStartPanCrop = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.crop-handle')) return;
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = crop.top;
    const startBottom = crop.bottom;
    const startLeft = crop.left;
    const startRight = crop.right;

    const cropW = 100 - startLeft - startRight;
    const cropH = 100 - startTop - startBottom;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;

      const deltaLeftPct = (deltaX / fullWidth) * 100;
      const deltaTopPct = (deltaY / fullHeight) * 100;

      let newLeft = Math.max(0, Math.min(100 - cropW, startLeft + deltaLeftPct));
      let newRight = 100 - newLeft - cropW;

      let newTop = Math.max(0, Math.min(100 - cropH, startTop + deltaTopPct));
      let newBottom = 100 - newTop - cropH;

      updateClip(clip.id, {
        transform: {
          ...clip.transform,
          crop: {
            top: Number(newTop.toFixed(2)),
            bottom: Number(newBottom.toFixed(2)),
            left: Number(newLeft.toFixed(2)),
            right: Number(newRight.toFixed(2)),
          },
        },
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getRatioBtnClass = (rKey: string) =>
    cn(
      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
      activeRatio === rKey
        ? 'bg-brand text-white shadow-md font-bold'
        : 'bg-studio-panel hover:bg-studio-border text-studio-fg border border-studio-border/60'
    );

  const isNearTop = top + cropTopPx < 55;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${fullWidth}px`,
        height: `${fullHeight}px`,
      }}
      className="pointer-events-auto z-50 select-none relative"
    >
      {/* Dimmed Dark Overlay Outside Cropped Area */}
      {/* Top Dim */}
      <div className="absolute left-0 top-0 right-0 bg-black/65" style={{ height: `${cropTopPx}px` }} />
      {/* Bottom Dim */}
      <div className="absolute left-0 bottom-0 right-0 bg-black/65" style={{ height: `${cropBottomPx}px` }} />
      {/* Left Dim */}
      <div className="absolute left-0 bg-black/65" style={{ top: `${cropTopPx}px`, height: `${cropHeightPx}px`, width: `${cropLeftPx}px` }} />
      {/* Right Dim */}
      <div className="absolute right-0 bg-black/65" style={{ top: `${cropTopPx}px`, height: `${cropHeightPx}px`, width: `${cropRightPx}px` }} />

      {/* Active Crop Box Rect */}
      <div
        style={{
          position: 'absolute',
          left: `${cropLeftPx}px`,
          top: `${cropTopPx}px`,
          width: `${cropWidthPx}px`,
          height: `${cropHeightPx}px`,
        }}
        onPointerDown={handleStartPanCrop}
        className="border-2 border-brand pointer-events-auto relative shadow-2xl cursor-move group"
      >
        {/* Top Floating Control Bar - Attached directly to top line of crop selection overlay */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-studio-topbar/95 backdrop-blur-xl border border-studio-border px-4 py-1.5 rounded-2xl shadow-2xl z-50 whitespace-nowrap transition-all select-none pointer-events-auto',
            isNearTop ? 'top-3' : '-top-14'
          )}
        >
          <span className="text-xs font-bold text-brand flex items-center gap-1.5 px-0.5">
            <Crop className="h-4 w-4" /> Crop Mode
          </span>
          <div className="h-4 w-px bg-studio-border" />

          {/* Aspect Ratio Buttons */}
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => applyAspectRatio('16:9', 16 / 9)} className={getRatioBtnClass('16:9')}>16:9</button>
            <button type="button" onClick={() => applyAspectRatio('9:16', 9 / 16)} className={getRatioBtnClass('9:16')}>9:16</button>
            <button type="button" onClick={() => applyAspectRatio('4:3', 4 / 3)} className={getRatioBtnClass('4:3')}>4:3</button>
            <button type="button" onClick={() => applyAspectRatio('1:1', 1)} className={getRatioBtnClass('1:1')}>1:1</button>
          </div>

          <div className="h-4 w-px bg-studio-border" />

          <button
            type="button"
            onClick={handleResetCrop}
            className="flex items-center gap-1 text-xs font-medium text-studio-muted hover:text-white px-2 py-1 rounded-lg hover:bg-studio-panel transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>

          <button
            type="button"
            onClick={handleCancelCrop}
            className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold px-3.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" /> Done
          </button>
        </div>

        {/* Rule of Thirds Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-white" />
          <div className="border-r border-white" />
          <div />
        </div>

        {/* --- CORNER HANDLES & ARROW BRACKETS --- */}

        {/* Top-Left NW Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('nw', e)}
          className="crop-handle absolute -top-3 -left-3 h-6 w-6 cursor-nwse-resize pointer-events-auto flex items-center justify-center group/h"
          title="Drag to crop Top-Left"
        >
          <div className="h-4 w-4 border-t-4 border-l-4 border-brand bg-studio-topbar shadow-md group-hover/h:scale-125 transition-transform" />
        </div>

        {/* Top-Right NE Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('ne', e)}
          className="crop-handle absolute -top-3 -right-3 h-6 w-6 cursor-nesw-resize pointer-events-auto flex items-center justify-center group/h"
          title="Drag to crop Top-Right"
        >
          <div className="h-4 w-4 border-t-4 border-r-4 border-brand bg-studio-topbar shadow-md group-hover/h:scale-125 transition-transform" />
        </div>

        {/* Bottom-Left SW Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('sw', e)}
          className="crop-handle absolute -bottom-3 -left-3 h-6 w-6 cursor-nesw-resize pointer-events-auto flex items-center justify-center group/h"
          title="Drag to crop Bottom-Left"
        >
          <div className="h-4 w-4 border-b-4 border-l-4 border-brand bg-studio-topbar shadow-md group-hover/h:scale-125 transition-transform" />
        </div>

        {/* Bottom-Right SE Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('se', e)}
          className="crop-handle absolute -bottom-3 -right-3 h-6 w-6 cursor-nwse-resize pointer-events-auto flex items-center justify-center group/h"
          title="Drag to crop Bottom-Right"
        >
          <div className="h-4 w-4 border-b-4 border-r-4 border-brand bg-studio-topbar shadow-md group-hover/h:scale-125 transition-transform" />
        </div>

        {/* --- EDGE DRAG HANDLES WITH ARROWS --- */}

        {/* Top Edge N Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('n', e)}
          className="crop-handle absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-10 cursor-ns-resize pointer-events-auto flex items-center justify-center rounded-full bg-brand text-white shadow-md hover:scale-110 transition-transform"
          title="Drag top edge"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>

        {/* Bottom Edge S Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('s', e)}
          className="crop-handle absolute -bottom-3 left-1/2 -translate-x-1/2 h-5 w-10 cursor-ns-resize pointer-events-auto flex items-center justify-center rounded-full bg-brand text-white shadow-md hover:scale-110 transition-transform"
          title="Drag bottom edge"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>

        {/* Left Edge W Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('w', e)}
          className="crop-handle absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-5 cursor-ew-resize pointer-events-auto flex items-center justify-center rounded-full bg-brand text-white shadow-md hover:scale-110 transition-transform"
          title="Drag left edge"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </div>

        {/* Right Edge E Handle */}
        <div
          onPointerDown={(e) => handleStartDragHandle('e', e)}
          className="crop-handle absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-5 cursor-ew-resize pointer-events-auto flex items-center justify-center rounded-full bg-brand text-white shadow-md hover:scale-110 transition-transform"
          title="Drag right edge"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
