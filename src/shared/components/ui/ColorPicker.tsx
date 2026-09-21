"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Check, ClipboardPaste, Pipette, RotateCcw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { Tooltip } from "@/shared/components/ui/Tooltip";

export interface HSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
}

export interface RGB {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "").trim();
  let r = 0;
  let g = 0;
  let b = 0;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }

  return { r, g, b };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 10000) / 100,
    v: Math.round(v * 10000) / 100,
  };
}

/**
 * Normalizes hex strings (e.g. '#fff' -> '#FFFFFF', '#121316' -> '#121316', 'transparent' -> 'transparent')
 */
export function normalizeHexColor(hex: string): string {
  const trimmed = hex.trim().toLowerCase();
  if (trimmed === "transparent") return "transparent";
  const clean = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  if (clean.length >= 6) {
    return `#${clean.substring(0, 6)}`.toUpperCase();
  }
  return `#${clean}`.toUpperCase();
}

export function hsvToRgb(hsv: HSV): RGB {
  const h = (hsv.h % 360) / 60;
  const s = Math.max(0, Math.min(100, hsv.s)) / 100;
  const v = Math.max(0, Math.min(100, hsv.v)) / 100;

  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}

/**
 * Universal color string parser that handles:
 * - Hex: "#FFF", "#FFFFFF", "FFFFFF", "FFF", "211111", etc.
 * - RGB: "rgb(255, 100, 50)", "255, 100, 50", "255 100 50"
 */
export function parseAnyColorString(str: string): RGB | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Hex format check (3 or 6 hex digits)
  if (/^#?[0-9a-f]{3}$/i.test(trimmed) || /^#?[0-9a-f]{6}$/i.test(trimmed)) {
    const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return hexToRgb(hex);
  }

  // RGB format check (e.g. rgb(255, 100, 50) or 255, 100, 50)
  const rgbMatch = trimmed.match(
    /(?:rgb\s*\(\s*)?(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i,
  );
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    return { r, g, b };
  }

  return null;
}

export const PRESET_COLORS = [
  "#000000",
  "#121316",
  "#1E293B",
  "#94A3B8",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#00FF00",
  "#0066FF",
  "#8B5CF6",
];

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  onChangeEnd?: (hex: string) => void;
  defaultValue?: string;
  onReset?: () => void;
  showReset?: boolean;
  presets?: string[];
  className?: string;
  showEyeDropper?: boolean;
  showSwatches?: boolean;
  isCompact?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  onChangeEnd,
  defaultValue = "#000000",
  onReset,
  showReset = true,
  presets = PRESET_COLORS,
  className,
  showEyeDropper = true,
  showSwatches = true,
  isCompact = false,
}: ColorPickerProps) {
  const currentHex = (value || "#000000").toUpperCase();
  const defaultHex = (defaultValue || "#000000").toUpperCase();
  const canReset =
    normalizeHexColor(currentHex) !== normalizeHexColor(defaultHex);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(currentHex));

  const currentRgb = useMemo(() => hsvToRgb(hsv), [hsv]);

  // Single draft state for active text input editing:
  const [typingState, setTypingState] = useState<{
    field: "hex" | "r" | "g" | "b";
    value: string;
  } | null>(null);

  const [pasted, setPasted] = useState(false);

  const hsvRef = useRef<HSV>(hsv);
  hsvRef.current = hsv;

  const isTypingRef = useRef<"hex" | "r" | "g" | "b" | null>(null);
  const isDraggingRef = useRef(false);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Synchronize internal state when external value changes (unless currently dragging or typing)
  useEffect(() => {
    if (!isDraggingRef.current && isTypingRef.current === null) {
      if (currentHex === "TRANSPARENT") return;
      const internalHex = hsvToHex(hsvRef.current);
      if (normalizeHexColor(internalHex) === normalizeHexColor(currentHex)) return;
      const nextHsv = hexToHsv(currentHex);
      hsvRef.current = nextHsv;
      setHsv(nextHsv);
    }
  }, [currentHex]);

  // Clean up any pending drag listeners on unmount
  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        dragCleanupRef.current = null;
      }
    };
  }, []);

  const emitColor = useCallback(
    (newHsv: HSV, isFinal = false) => {
      const hex = hsvToHex(newHsv);
      onChange(hex);
      if (isFinal && onChangeEnd) {
        onChangeEnd(hex);
      }
    },
    [onChange, onChangeEnd],
  );

  // Saturation / Value 2D Area Pointer Handler
  const handleSatValPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragCleanupRef.current) {
      dragCleanupRef.current();
      dragCleanupRef.current = null;
    }

    isDraggingRef.current = true;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // Safe to ignore
    }

    const applyCoords = (
      clientX: number,
      clientY: number,
      isFinal: boolean,
    ) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);

      if (!isFinal && hsvRef.current.s === s && hsvRef.current.v === v) {
        return;
      }

      const next = { ...hsvRef.current, s, v };
      hsvRef.current = next;
      setHsv(next);
      emitColor(next, isFinal);
    };

    applyCoords(e.clientX, e.clientY, false);

    let pendingRaf: number | null = null;
    let lastClientX = e.clientX;
    let lastClientY = e.clientY;

    const handlePointerMove = (moveEv: PointerEvent) => {
      lastClientX = moveEv.clientX;
      lastClientY = moveEv.clientY;

      if (pendingRaf !== null) return;
      pendingRaf = requestAnimationFrame(() => {
        pendingRaf = null;
        applyCoords(lastClientX, lastClientY, false);
      });
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      if (pendingRaf !== null) {
        cancelAnimationFrame(pendingRaf);
        pendingRaf = null;
      }
      dragCleanupRef.current = null;
      isDraggingRef.current = false;
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      try {
        target.releasePointerCapture(upEv.pointerId);
      } catch {
        // Safe to ignore
      }
      cleanup();
      applyCoords(upEv.clientX, upEv.clientY, true);
    };

    dragCleanupRef.current = cleanup;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  // Hue 1D Slider Pointer Handler
  const handleHuePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragCleanupRef.current) {
      dragCleanupRef.current();
      dragCleanupRef.current = null;
    }

    isDraggingRef.current = true;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // Safe to ignore
    }

    const applyHue = (clientX: number, isFinal: boolean) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = Math.round((x / rect.width) * 360) % 360;

      if (!isFinal && hsvRef.current.h === h) {
        return;
      }

      const next = { ...hsvRef.current, h };
      hsvRef.current = next;
      setHsv(next);
      emitColor(next, isFinal);
    };

    applyHue(e.clientX, false);

    let pendingRaf: number | null = null;
    let lastClientX = e.clientX;

    const handlePointerMove = (moveEv: PointerEvent) => {
      lastClientX = moveEv.clientX;

      if (pendingRaf !== null) return;
      pendingRaf = requestAnimationFrame(() => {
        pendingRaf = null;
        applyHue(lastClientX, false);
      });
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      if (pendingRaf !== null) {
        cancelAnimationFrame(pendingRaf);
        pendingRaf = null;
      }
      dragCleanupRef.current = null;
      isDraggingRef.current = false;
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      try {
        target.releasePointerCapture(upEv.pointerId);
      } catch {
        // Safe to ignore
      }
      cleanup();
      applyHue(upEv.clientX, true);
    };

    dragCleanupRef.current = cleanup;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const applyRgb = (r: number, g: number, b: number) => {
    const clampedR = Math.max(0, Math.min(255, Math.round(r) || 0));
    const clampedG = Math.max(0, Math.min(255, Math.round(g) || 0));
    const clampedB = Math.max(0, Math.min(255, Math.round(b) || 0));
    const nextHsv = rgbToHsv({ r: clampedR, g: clampedG, b: clampedB });
    hsvRef.current = nextHsv;
    setHsv(nextHsv);
    emitColor(nextHsv, true);
  };

  const handleRgbFocus = (channel: "r" | "g" | "b") => {
    isTypingRef.current = channel;
    const initialVal =
      channel === "r"
        ? String(currentRgb.r)
        : channel === "g"
          ? String(currentRgb.g)
          : String(currentRgb.b);
    setTypingState({ field: channel, value: initialVal });
  };

  const handleRgbChange = (channel: "r" | "g" | "b", val: string) => {
    setTypingState({ field: channel, value: val });
    if (val.trim() === "") return;
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(255, num));
      const r = channel === "r" ? clamped : currentRgb.r;
      const g = channel === "g" ? clamped : currentRgb.g;
      const b = channel === "b" ? clamped : currentRgb.b;
      applyRgb(r, g, b);
    }
  };

  const handleRgbBlur = () => {
    isTypingRef.current = null;
    setTypingState(null);
  };

  const handleHexInputFocus = () => {
    isTypingRef.current = "hex";
    setTypingState({ field: "hex", value: currentHex });
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setTypingState({ field: "hex", value: raw });
    const parsed = parseAnyColorString(raw);
    if (parsed) {
      const nextHsv = rgbToHsv(parsed);
      hsvRef.current = nextHsv;
      setHsv(nextHsv);
      emitColor(nextHsv, true);
    }
  };

  const handleHexInputBlur = () => {
    isTypingRef.current = null;
    const draft = typingState?.value || "";
    const parsed = parseAnyColorString(draft);
    if (parsed) {
      const nextHsv = rgbToHsv(parsed);
      hsvRef.current = nextHsv;
      setHsv(nextHsv);
      emitColor(nextHsv, true);
    }
    setTypingState(null);
  };

  const handlePasteAny = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseAnyColorString(text);
      if (parsed) {
        const nextHsv = rgbToHsv(parsed);
        hsvRef.current = nextHsv;
        setHsv(nextHsv);
        emitColor(nextHsv, true);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch {
      // Clipboard access denied or empty
    }
  };

  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropper = new (window as any).EyeDropper();
        const result = await dropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const nextHsv = hexToHsv(hex);
          hsvRef.current = nextHsv;
          setHsv(nextHsv);
          emitColor(nextHsv, true);
        }
      } catch {
        // User cancelled eyedropper
      }
    }
  };

  const supportsEyeDropper =
    showEyeDropper && typeof window !== "undefined" && "EyeDropper" in window;

  const handleReset = () => {
    const nextHsv = hexToHsv(defaultHex);
    hsvRef.current = nextHsv;
    setHsv(nextHsv);
    emitColor(nextHsv, true);
    if (onReset) {
      onReset();
    }
  };

  const displayedHex =
    typingState?.field === "hex" ? typingState.value : currentHex;
  const displayedR =
    typingState?.field === "r" ? typingState.value : String(currentRgb.r);
  const displayedG =
    typingState?.field === "g" ? typingState.value : String(currentRgb.g);
  const displayedB =
    typingState?.field === "b" ? typingState.value : String(currentRgb.b);

  // Render Visual 2D Canvas + 1D Hue Bar
  const renderVisualPicker = (canvasHeight = "h-32") => (
    <div className="flex flex-col gap-2.5 w-full">
      {/* 2D Saturation / Value Area */}
      <div
        ref={satValRef}
        onPointerDown={handleSatValPointerDown}
        style={{
          backgroundColor: "#000000",
          backgroundImage: `linear-gradient(to top, #000000 0%, transparent 100%), linear-gradient(to right, #ffffff 0%, hsl(${hsv.h}, 100%, 50%) 100%)`,
        }}
        className={cn(
          "relative w-full cursor-crosshair overflow-hidden rounded-md shadow-inner select-none",
          canvasHeight,
        )}
      >

        {/* Draggable Crosshair Handle */}
        <div
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
          }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-4 w-4 rounded-full border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.8)] ring-1 ring-black/40" />
        </div>
      </div>

      {/* 1D Rainbow Hue Slider & Color Swatch */}
      <div className="flex items-center gap-2">
        <div
          ref={hueRef}
          onPointerDown={handleHuePointerDown}
          className="relative h-3.5 flex-1 cursor-pointer rounded-full shadow-inner border border-white/15"
          style={{
            background:
              "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          }}
        >
          {/* Draggable Hue Knob */}
          <div
            style={{
              left: `${(hsv.h / 360) * 100}%`,
            }}
            className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="h-4.5 w-4.5 rounded-full border-2 border-white bg-white/95 shadow-md ring-1 ring-black/40" />
          </div>
        </div>

        {/* Live Color Preview Swatch */}
        <div
          className="h-3.5 w-3.5 shrink-0 rounded-sm border border-white/20 shadow-sm"
          style={
            currentHex === "TRANSPARENT"
              ? {
                  backgroundImage:
                    "repeating-conic-gradient(#3a3d45 0% 25%, #222327 0% 50%)",
                  backgroundSize: "6px 6px",
                }
              : { backgroundColor: currentHex }
          }
          title={`Current: ${currentHex}`}
        />
      </div>
    </div>
  );

  // Render Hex and RGB Input controls
  const renderInputs = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Hex Input & Action Buttons */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex flex-1 items-center min-w-0 rounded-lg border border-white/10 bg-white/[0.04] transition-all hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20">
          <input
            type="text"
            value={displayedHex}
            maxLength={9}
            spellCheck={false}
            onFocus={handleHexInputFocus}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleHexInputBlur();
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData("text");
              const parsed = parseAnyColorString(pastedText);
              if (parsed) {
                e.preventDefault();
                const nextHsv = rgbToHsv(parsed);
                hsvRef.current = nextHsv;
                setHsv(nextHsv);
                emitColor(nextHsv, true);
              }
            }}
            aria-label="Hex color value"
            placeholder="#000000"
            className="h-8 w-full bg-transparent px-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white/90 placeholder-white/30 outline-none"
          />
        </div>

        {/* Paste Button */}
        <button
          type="button"
          onClick={handlePasteAny}
          aria-label="Paste HEX or RGB color from clipboard"
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all active:scale-95 cursor-pointer",
            pasted
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
          )}
        >
          {pasted ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <ClipboardPaste className="h-3.5 w-3.5" />
          )}
          <span className="text-[11px]">{pasted ? "Pasted!" : "Paste"}</span>
        </button>

        {/* Eyedropper Tool */}
        {supportsEyeDropper ? (
          <Tooltip content="Pick color" position="bottom" align="center" delayMs={100}>
            <button
              type="button"
              onClick={handleEyeDropper}
              aria-label="Sample color from screen"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95 cursor-pointer"
            >
              <Pipette className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        ) : null}

        {/* Reset Button */}
        {showReset && (
          <Tooltip
            content={canReset ? "Reset" : "Default"}
            position="bottom"
            align="right"
            delayMs={100}
          >
            <button
              type="button"
              onClick={handleReset}
              disabled={!canReset}
              aria-label="Reset color to default"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-all",
                canReset
                  ? "text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95 cursor-pointer"
                  : "text-white/25 opacity-35 cursor-not-allowed",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Editable Interactive RGB Inputs */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 transition-all hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20">
          <span className="mr-1.5 font-mono text-[9px] font-bold text-white/40 select-none">R</span>
          <input
            type="number"
            min={0}
            max={255}
            value={displayedR}
            onFocus={() => handleRgbFocus("r")}
            onChange={(e) => handleRgbChange("r", e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Red value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-white/90 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 transition-all hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20">
          <span className="mr-1.5 font-mono text-[9px] font-bold text-white/40 select-none">G</span>
          <input
            type="number"
            min={0}
            max={255}
            value={displayedG}
            onFocus={() => handleRgbFocus("g")}
            onChange={(e) => handleRgbChange("g", e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Green value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-white/90 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 transition-all hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20">
          <span className="mr-1.5 font-mono text-[9px] font-bold text-white/40 select-none">B</span>
          <input
            type="number"
            min={0}
            max={255}
            value={displayedB}
            onFocus={() => handleRgbFocus("b")}
            onChange={(e) => handleRgbChange("b", e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Blue value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-white/90 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );

  // Render Preset Swatches
  const renderSwatches = () => (
    <div className="border-t border-white/[0.08] pt-2.5 w-full">
      <div className="mb-1.5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
        <span>Swatches</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {presets.map((preset) => {
          const isTransparent = preset.toLowerCase() === "transparent";
          const cleanPreset = isTransparent
            ? "transparent"
            : normalizeHexColor(preset);
          const cleanCurrent =
            currentHex === "TRANSPARENT"
              ? "transparent"
              : normalizeHexColor(currentHex);
          const isSelected = cleanPreset === cleanCurrent;

          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const targetColor = isTransparent ? "transparent" : cleanPreset;
                if (!isTransparent) {
                  const nextHsv = hexToHsv(cleanPreset);
                  hsvRef.current = nextHsv;
                  setHsv(nextHsv);
                }
                onChange(targetColor);
                if (onChangeEnd) {
                  onChangeEnd(targetColor);
                }
              }}
              title={preset}
              aria-label={`Select ${preset}`}
              style={
                isTransparent
                  ? {
                      backgroundImage:
                        "repeating-conic-gradient(#3a3d45 0% 25%, #222327 0% 50%)",
                      backgroundSize: "6px 6px",
                    }
                  : { backgroundColor: preset }
              }
              className={cn(
                "relative h-5 w-full rounded-md border transition-all hover:scale-105 active:scale-95 focus-visible:outline-none cursor-pointer",
                isSelected
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#18181b] border-transparent scale-105 z-10 shadow-sm"
                  : "border-white/10 hover:border-white/30",
              )}
            />
          );
        })}
      </div>
    </div>
  );

  // If compact (small sidebar or popover), stack vertically and include swatches
  if (isCompact) {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-3 rounded-2xl border border-white/12 bg-[#18181b] p-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] select-none",
          className,
        )}
      >
        {renderVisualPicker("h-28")}
        {renderInputs()}
        {showSwatches && renderSwatches()}
      </div>
    );
  }

  // Horizontal wide layout (for wider sidebars)
  return (
    <div
      className={cn(
        "flex w-full items-stretch gap-3.5 rounded-2xl border border-white/12 bg-[#18181b] p-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] select-none",
        className,
      )}
    >
      {/* LEFT COLUMN: Visual picker */}
      <div className="flex w-[185px] shrink-0 flex-col gap-2">
        {renderVisualPicker("h-[124px]")}
      </div>

      {/* RIGHT COLUMN: Controls & Swatches */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5">
        {renderInputs()}
        {showSwatches && renderSwatches()}
      </div>
    </div>
  );
}

export interface ColorPickerPopoverProps extends ColorPickerProps {
  label?: string;
  triggerClassName?: string;
  align?: "left" | "right";
}

export function ColorPickerPopover({
  value,
  onChange,
  onChangeEnd,
  defaultValue = "#000000",
  onReset,
  showReset = true,
  label,
  presets,
  className,
  triggerClassName,
  align = "right",
  showEyeDropper = true,
  showSwatches = true,
}: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentHex = (value || "#000000").toUpperCase();

  const leftPanelWidth = useEditorUIStore((state) => state.leftPanelWidth);
  const timelineHeight = useEditorUIStore((state) => state.timelineHeight);

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Detect boundaries of the canvas / inspector panel in the studio
    const studioSidebar = document.querySelector("[data-studio-sidebar]");
    const scrollContainer = triggerRef.current.closest(".overflow-y-auto");

    let minLeft = 10;
    let maxRight = viewportWidth - 10;

    if (studioSidebar) {
      const sbRect = studioSidebar.getBoundingClientRect();
      // Keep strictly within the contextual panel area (after the 64px tool rail, before canvas stage)
      minLeft = sbRect.left + 64 + 6;
      maxRight = sbRect.right - 6;
    }

    if (scrollContainer) {
      const sRect = scrollContainer.getBoundingClientRect();
      minLeft = Math.max(minLeft, sRect.left + 6);
      maxRight = Math.min(maxRight, sRect.right - 6);
    }

    const availablePanelWidth = Math.max(260, maxRight - minLeft);

    // Responsive mode:
    // When width is long (>= 460px), color picker is HORIZONTAL.
    // When width is less (< 460px), color picker is VERTICAL.
    const horizontalMode = availablePanelWidth >= 460;
    setIsHorizontal((prev) => (prev === horizontalMode ? prev : horizontalMode));

    let popoverWidth = horizontalMode
      ? Math.min(456, availablePanelWidth)
      : Math.min(272, availablePanelWidth);

    const popoverHeight = horizontalMode ? 190 : 320;

    // Horizontal placement based on align
    let left = align === "left" ? rect.left : rect.right - popoverWidth;

    // Strict boundary clamping to stay within the canvas section and never overflow or come out
    if (left + popoverWidth > maxRight) {
      left = maxRight - popoverWidth;
    }
    if (left < minLeft) {
      left = minLeft;
    }
    if (popoverWidth > availablePanelWidth) {
      popoverWidth = availablePanelWidth;
      left = minLeft;
    }
    // Absolute viewport safety
    left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8));

    // Vertical placement:
    const tlHeight = timelineHeight || 220;
    const maxBottom = viewportHeight - tlHeight - 10;
    const wouldOverlapTimeline = rect.bottom + popoverHeight > maxBottom;
    const canOpenUpwards = rect.top - popoverHeight > 56;

    let top: number;
    if (wouldOverlapTimeline && canOpenUpwards) {
      top = rect.top - popoverHeight - 6;
    } else {
      top = rect.bottom + 6;
    }

    top = Math.max(60, Math.min(top, maxBottom - popoverHeight));

    setCoords((prev) => {
      if (
        prev.top === top &&
        prev.left === left &&
        prev.width === popoverWidth
      ) {
        return prev;
      }
      return { top, left, width: popoverWidth };
    });
  }, [align, timelineHeight]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  // Re-adjust coords when sidebar or timeline sizes change while open
  useEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [leftPanelWidth, timelineHeight, isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;

    // Update position on window resize and external scroll
    const handleReposition = (e?: Event) => {
      if (e?.target instanceof Node && popoverRef.current?.contains(e.target)) {
        return;
      }
      updateCoords();
    };
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-label={label || `Choose color, current ${currentHex}`}
        className={cn(
          "group flex h-7 items-center justify-center gap-2 rounded-lg px-2 text-center text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20",
          triggerClassName,
          isOpen
            ? "border border-white/25 bg-white/[0.08] ring-1 ring-white/15 text-white shadow-none"
            : "border border-transparent bg-transparent text-white/85 shadow-none hover:bg-white/[0.06] hover:text-white hover:border-transparent",
        )}
      >
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-sm border border-white/20"
          style={
            currentHex === "TRANSPARENT"
              ? {
                  backgroundImage: "repeating-conic-gradient(#3a3d45 0% 25%, #222327 0% 50%)",
                  backgroundSize: "6px 6px",
                }
              : { backgroundColor: currentHex }
          }
        />
        <span className="font-mono text-xs font-semibold uppercase text-white/90">
          {currentHex === "TRANSPARENT" ? "Alpha" : currentHex}
        </span>
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              style={{
                position: "fixed",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width || 272}px`,
                maxWidth: `${coords.width || 272}px`,
                zIndex: 99999,
              }}
              className="animate-in fade-in-0 zoom-in-95 duration-100 rounded-2xl bg-transparent"
            >
              <ColorPicker
                value={currentHex}
                onChange={onChange}
                onChangeEnd={onChangeEnd}
                defaultValue={defaultValue}
                onReset={onReset}
                showReset={showReset}
                presets={presets}
                className={className}
                isCompact={!isHorizontal}
                showSwatches={showSwatches}
                showEyeDropper={showEyeDropper}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
