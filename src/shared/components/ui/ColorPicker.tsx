"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Check, ClipboardPaste, Pipette } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";

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
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
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
  "#1E1F24",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#FFFFFF",
  "#F97316", // Brand orange
  "#EF4444", // Crimson red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  onChangeEnd?: (hex: string) => void;
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
  presets = PRESET_COLORS,
  className,
  showEyeDropper = true,
  showSwatches = true,
  isCompact = false,
}: ColorPickerProps) {
  const currentHex = (value || "#000000").toUpperCase();
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(currentHex));
  const [hexInput, setHexInput] = useState<string>(currentHex);

  const currentRgb = useMemo(() => hsvToRgb(hsv), [hsv]);
  const [rInput, setRInput] = useState<string>(() => String(currentRgb.r));
  const [gInput, setGInput] = useState<string>(() => String(currentRgb.g));
  const [bInput, setBInput] = useState<string>(() => String(currentRgb.b));

  const [pasted, setPasted] = useState(false);

  const hsvRef = useRef<HSV>(hsv);
  hsvRef.current = hsv;

  // Track if user is actively typing in an input field so external updates don't revert typing
  const isTypingRef = useRef<"hex" | "r" | "g" | "b" | null>(null);

  const isDraggingRef = useRef(false);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Synchronize internal state when external value changes (unless currently dragging or typing)
  useEffect(() => {
    if (!isDraggingRef.current && !isTypingRef.current) {
      const nextHsv = hexToHsv(currentHex);
      setHsv(nextHsv);
      hsvRef.current = nextHsv;
      setHexInput(currentHex);
      const rgb = hsvToRgb(nextHsv);
      setRInput(String(rgb.r));
      setGInput(String(rgb.g));
      setBInput(String(rgb.b));
    }
  }, [currentHex]);

  // Clean up any pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const emitColor = useCallback(
    (
      newHsv: HSV,
      isFinal = false,
      source?: "hex" | "r" | "g" | "b" | "visual",
    ) => {
      const hex = hsvToHex(newHsv);
      const rgb = hsvToRgb(newHsv);

      if (source !== "hex" && isTypingRef.current !== "hex") {
        setHexInput(hex);
      }
      if (source !== "r" && isTypingRef.current !== "r") {
        setRInput(String(rgb.r));
      }
      if (source !== "g" && isTypingRef.current !== "g") {
        setGInput(String(rgb.g));
      }
      if (source !== "b" && isTypingRef.current !== "b") {
        setBInput(String(rgb.b));
      }

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
    isDraggingRef.current = true;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const updateFromPointer = (
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

      const next = { ...hsvRef.current, s, v };
      hsvRef.current = next;
      setHsv(next);

      if (isFinal) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        emitColor(next, true, "visual");
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          emitColor(next, false, "visual");
        });
      }
    };

    updateFromPointer(e.clientX, e.clientY, false);

    const handlePointerMove = (moveEv: PointerEvent) => {
      updateFromPointer(moveEv.clientX, moveEv.clientY, false);
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      updateFromPointer(upEv.clientX, upEv.clientY, true);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Hue 1D Slider Pointer Handler
  const handleHuePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const updateHue = (clientX: number, isFinal: boolean) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = Math.round((x / rect.width) * 360) % 360;

      const next = { ...hsvRef.current, h };
      hsvRef.current = next;
      setHsv(next);

      if (isFinal) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        emitColor(next, true, "visual");
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          emitColor(next, false, "visual");
        });
      }
    };

    updateHue(e.clientX, false);

    const handlePointerMove = (moveEv: PointerEvent) => {
      updateHue(moveEv.clientX, false);
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      updateHue(upEv.clientX, true);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const applyRgb = (
    r: number,
    g: number,
    b: number,
    source?: "r" | "g" | "b",
  ) => {
    const clampedR = Math.max(0, Math.min(255, Math.round(r) || 0));
    const clampedG = Math.max(0, Math.min(255, Math.round(g) || 0));
    const clampedB = Math.max(0, Math.min(255, Math.round(b) || 0));
    const nextHsv = rgbToHsv({ r: clampedR, g: clampedG, b: clampedB });
    hsvRef.current = nextHsv;
    setHsv(nextHsv);
    emitColor(nextHsv, true, source);
  };

  // Editable RGB input change handlers
  const handleRChange = (val: string) => {
    setRInput(val);
    if (val.trim() === "") return;
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(255, num));
      applyRgb(clamped, currentRgb.g, currentRgb.b, "r");
    }
  };

  const handleGChange = (val: string) => {
    setGInput(val);
    if (val.trim() === "") return;
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(255, num));
      applyRgb(currentRgb.r, clamped, currentRgb.b, "g");
    }
  };

  const handleBChange = (val: string) => {
    setBInput(val);
    if (val.trim() === "") return;
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(255, num));
      applyRgb(currentRgb.r, currentRgb.g, clamped, "b");
    }
  };

  const handleRgbFocus = (channel: "r" | "g" | "b") => {
    isTypingRef.current = channel;
  };

  const handleRgbBlur = () => {
    isTypingRef.current = null;
    setRInput(String(currentRgb.r));
    setGInput(String(currentRgb.g));
    setBInput(String(currentRgb.b));
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setHexInput(raw);
    const parsed = parseAnyColorString(raw);
    if (parsed) {
      const nextHsv = rgbToHsv(parsed);
      hsvRef.current = nextHsv;
      setHsv(nextHsv);
      emitColor(nextHsv, true, "hex");
    }
  };

  const handleHexInputFocus = () => {
    isTypingRef.current = "hex";
  };

  const handleHexInputBlur = () => {
    isTypingRef.current = null;
    const parsed = parseAnyColorString(hexInput);
    if (parsed) {
      const formatted = rgbToHex(parsed);
      setHexInput(formatted);
      const nextHsv = rgbToHsv(parsed);
      hsvRef.current = nextHsv;
      setHsv(nextHsv);
      emitColor(nextHsv, true);
    } else {
      setHexInput(currentHex);
    }
  };

  // Universal Paste Handler (Handles both Hex and RGB from Clipboard)
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

  // Render Visual 2D Canvas + 1D Hue Bar
  const renderVisualPicker = (canvasHeight = "h-32") => (
    <div className="flex flex-col gap-2 w-full">
      {/* 2D Saturation / Value Area */}
      <div
        ref={satValRef}
        onPointerDown={handleSatValPointerDown}
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}
        className={cn(
          "relative w-full cursor-crosshair overflow-hidden rounded-xl shadow-inner ring-1 ring-white/10",
          canvasHeight,
        )}
      >
        {/* Horizontal White-to-transparent gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        {/* Vertical Black-to-transparent gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        {/* Draggable Crosshair Handle */}
        <div
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
          }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_5px_rgba(0,0,0,0.8)] ring-1 ring-black/50" />
        </div>
      </div>

      {/* 1D Rainbow Hue Slider & Color Swatch */}
      <div className="flex items-center gap-2">
        <div
          ref={hueRef}
          onPointerDown={handleHuePointerDown}
          className="relative h-4 flex-1 cursor-pointer rounded-full shadow-inner ring-1 ring-white/10"
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
            <div className="h-4.5 w-4.5 rounded-full border-2 border-white bg-studio-panel shadow-md ring-1 ring-black/40" />
          </div>
        </div>

        {/* Live Color Preview Swatch */}
        <div
          className="h-6 w-6 shrink-0 rounded-full border-2 border-white/20 shadow-md ring-1 ring-black/50"
          style={{ backgroundColor: currentHex }}
          title={`Current: ${currentHex}`}
        />
      </div>
    </div>
  );

  // Render Hex and RGB Input controls
  const renderInputs = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Hex Input & Paste Controls */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex flex-1 items-center min-w-0">
          <span className="absolute left-2 font-mono text-[9px] font-bold text-studio-muted">
            HEX
          </span>
          <input
            type="text"
            value={hexInput}
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
            className="h-8 w-full rounded-lg border border-studio-border bg-studio-bg pl-8 pr-1 font-mono text-xs font-semibold uppercase tracking-wider text-studio-fg transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Paste Button */}
        <button
          type="button"
          onClick={handlePasteAny}
          aria-label="Paste HEX or RGB color from clipboard"
          title={pasted ? "Pasted color!" : "Paste HEX/RGB code"}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1 rounded-lg border border-studio-border bg-studio-bg px-2 text-[10px] font-medium transition-all hover:border-brand/40 hover:bg-studio-hover active:scale-95",
            pasted
              ? "border-mkt-success text-mkt-success bg-mkt-success/10"
              : "text-studio-muted hover:text-studio-fg",
          )}
        >
          {pasted ? (
            <Check className="h-3 w-3 text-mkt-success" />
          ) : (
            <ClipboardPaste className="h-3 w-3" />
          )}
          <span>Paste</span>
        </button>

        {supportsEyeDropper ? (
          <button
            type="button"
            onClick={handleEyeDropper}
            aria-label="Sample color from screen"
            title="Eyedropper tool"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-bg text-studio-muted transition-colors hover:border-brand/40 hover:bg-studio-hover hover:text-studio-fg active:scale-95"
          >
            <Pipette className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Editable Interactive RGB Inputs */}
      <div className="grid grid-cols-3 gap-1">
        <div className="flex items-center rounded-lg border border-studio-border bg-studio-bg px-1.5 py-0.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <span className="mr-1 text-[9px] font-bold text-studio-muted">R</span>
          <input
            type="number"
            min={0}
            max={255}
            value={rInput}
            onFocus={() => handleRgbFocus("r")}
            onChange={(e) => handleRChange(e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Red value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-studio-fg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div className="flex items-center rounded-lg border border-studio-border bg-studio-bg px-1.5 py-0.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <span className="mr-1 text-[9px] font-bold text-studio-muted">G</span>
          <input
            type="number"
            min={0}
            max={255}
            value={gInput}
            onFocus={() => handleRgbFocus("g")}
            onChange={(e) => handleGChange(e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Green value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-studio-fg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div className="flex items-center rounded-lg border border-studio-border bg-studio-bg px-1.5 py-0.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <span className="mr-1 text-[9px] font-bold text-studio-muted">B</span>
          <input
            type="number"
            min={0}
            max={255}
            value={bInput}
            onFocus={() => handleRgbFocus("b")}
            onChange={(e) => handleBChange(e.target.value)}
            onBlur={handleRgbBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRgbBlur();
            }}
            aria-label="Blue value 0-255"
            className="w-full bg-transparent font-mono text-xs font-semibold text-studio-fg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );

  // Render Preset Swatches
  const renderSwatches = () => (
    <div className="border-t border-studio-border/60 pt-2 w-full">
      <div className="mb-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-studio-muted">
        Swatches
      </div>
      <div className="grid grid-cols-5 gap-1">
        {presets.map((preset) => {
          const isSelected = preset.toUpperCase() === currentHex;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const clean = preset.toUpperCase();
                const nextHsv = hexToHsv(clean);
                hsvRef.current = nextHsv;
                setHsv(nextHsv);
                emitColor(nextHsv, true);
              }}
              title={preset}
              aria-label={`Select ${preset}`}
              style={{ backgroundColor: preset }}
              className={cn(
                "relative h-5 w-full rounded border transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                isSelected
                  ? "border-brand ring-1 ring-brand/60 shadow-sm scale-105"
                  : "border-white/10 hover:border-white/30",
              )}
            />
          );
        })}
      </div>
    </div>
  );

  // If compact (small sidebar), stack vertically and hide swatches
  if (isCompact || !showSwatches) {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-2.5 rounded-xl border border-studio-border/90 bg-studio-panel p-3 text-studio-fg shadow-2xl backdrop-blur-xl select-none",
          className,
        )}
      >
        {renderVisualPicker("h-28")}
        {renderInputs()}
      </div>
    );
  }

  // Horizontal wide layout (for wider sidebars)
  return (
    <div
      className={cn(
        "flex w-full items-stretch gap-3 rounded-xl border border-studio-border/90 bg-studio-panel p-3 text-studio-fg shadow-2xl backdrop-blur-xl select-none",
        className,
      )}
    >
      {/* LEFT COLUMN: Visual picker */}
      <div className="flex w-[180px] shrink-0 flex-col gap-2">
        {renderVisualPicker("h-[120px]")}
      </div>

      {/* RIGHT COLUMN: Controls & Swatches */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
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
  label,
  presets,
  className,
  triggerClassName,
}: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentHex = (value || "#000000").toUpperCase();

  const leftPanelWidth = useEditorUIStore((state) => state.leftPanelWidth);
  const timelineHeight = useEditorUIStore((state) => state.timelineHeight);

  // If sidebar is small (< 480px), use compact mode (hide swatches and fit card)
  const isSmallSidebar = (leftPanelWidth || 350) < 480;

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Find the parent settings card (section) for exact alignment with the other items
    const parentSection =
      triggerRef.current.closest("section") ||
      triggerRef.current.closest("[data-studio-sidebar]")?.querySelector("section");
    const cardRect = parentSection ? parentSection.getBoundingClientRect() : null;

    // Detect actual sidebar element bounds from the DOM if inside sidebar
    const sidebarElement =
      triggerRef.current.closest("[data-studio-sidebar]") ||
      triggerRef.current.closest(".overflow-y-auto")?.parentElement;
    const sidebarRect = sidebarElement ? sidebarElement.getBoundingClientRect() : null;

    // Left boundary: Match the card's exact left position or sidebar padded left
    const sidebarLeft = sidebarRect ? sidebarRect.left + 12 : 64 + 12;
    const sidebarRight = sidebarRect
      ? sidebarRect.right - 12
      : 64 + (leftPanelWidth || 350) - 12;
    const fallbackWidth = Math.max(260, sidebarRight - sidebarLeft);

    // Align exactly with the settings card in canvas settings
    const popoverWidth = cardRect ? cardRect.width : fallbackWidth;
    const left = cardRect ? cardRect.left : sidebarLeft;

    const isSmall = (leftPanelWidth || 350) < 480;
    const popoverHeight = isSmall ? 220 : 180;

    // Timeline top boundary (bottom edge of the upper workspace)
    const tlHeight = timelineHeight || 220;
    const maxBottom = viewportHeight - tlHeight - 10;

    // Vertical placement:
    // If opening downwards would cross into the bottom timeline, open UPWARDS!
    const wouldOverlapTimeline = rect.bottom + popoverHeight > maxBottom;
    const canOpenUpwards = rect.top - popoverHeight > 56; // 56px top bar

    let top: number;
    if (wouldOverlapTimeline && canOpenUpwards) {
      top = rect.top - popoverHeight - 6;
    } else {
      top = rect.bottom + 6;
    }

    // Strict boundary clamps:
    // 1. Never go above top bar (56px)
    // 2. Never go below timeline (maxBottom)
    top = Math.max(60, Math.min(top, maxBottom - popoverHeight));

    setCoords({ top, left, width: popoverWidth });
  }, [leftPanelWidth, timelineHeight]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  // Close color palette when adjusting / resizing the sidebar or bottom timeline bar
  const prevWidthRef = useRef(leftPanelWidth);
  const prevTimelineHeightRef = useRef(timelineHeight);

  useEffect(() => {
    if (
      prevWidthRef.current !== leftPanelWidth ||
      prevTimelineHeightRef.current !== timelineHeight
    ) {
      prevWidthRef.current = leftPanelWidth;
      prevTimelineHeightRef.current = timelineHeight;
      if (isOpen) {
        setIsOpen(false);
      }
    }
  }, [leftPanelWidth, timelineHeight, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Close on window resize or divider resizing
    const handleResize = () => setIsOpen(false);
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
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
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-label={label || `Choose color, current ${currentHex}`}
        className={cn(
          "group flex h-9 items-center gap-2 rounded-lg border border-studio-border bg-studio-bg/60 px-2 text-left transition-all hover:border-brand/40 hover:bg-studio-hover focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
          isOpen && "border-brand ring-1 ring-brand/30",
          triggerClassName,
        )}
      >
        <span
          className="h-5 w-6 shrink-0 rounded border border-white/10 shadow-sm ring-1 ring-black/30"
          style={{ backgroundColor: currentHex }}
        />
        <span className="font-mono text-xs font-semibold uppercase text-studio-fg">
          {currentHex}
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
                width: coords.width ? `${coords.width}px` : undefined,
                zIndex: 99999,
              }}
              className="animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <ColorPicker
                value={currentHex}
                onChange={onChange}
                onChangeEnd={onChangeEnd}
                presets={presets}
                className={className}
                isCompact={isSmallSidebar}
                showSwatches={!isSmallSidebar}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
