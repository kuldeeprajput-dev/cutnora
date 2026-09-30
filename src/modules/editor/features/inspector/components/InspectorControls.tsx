"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { ColorPickerPopover } from "@/shared/components/ui/ColorPicker";
import { cn } from "@/shared/utils/cn";

export function InspectorSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-2.5 border-b border-studio-border", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-studio-muted font-medium text-xs flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-studio-muted" />}
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function InspectorValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="min-w-10 rounded-md border border-studio-border bg-studio-panel-raised px-1.5 py-0.5 text-right font-mono text-[10px] font-semibold text-studio-fg">
      {children}
    </span>
  );
}

export function InspectorControlLabel({
  children,
  htmlFor,
  onDoubleClick,
  title,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  onDoubleClick?: () => void;
  title?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      onDoubleClick={onDoubleClick}
      title={title}
      className={cn(
        "block text-[10px] font-medium uppercase tracking-wide text-studio-muted",
        onDoubleClick && "cursor-pointer hover:text-studio-fg",
      )}
    >
      {children}
    </label>
  );
}

export function InspectorSliderHeader({
  label,
  value,
  onReset,
}: {
  label: string;
  value: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <button
        type="button"
        onDoubleClick={onReset}
        disabled={!onReset}
        title={onReset ? "Double-click to reset" : undefined}
        className={cn(
          "text-[10px] font-medium text-studio-muted",
          onReset && "cursor-pointer hover:text-studio-fg",
        )}
      >
        {label}
      </button>
      <InspectorValue>{value}</InspectorValue>
    </div>
  );
}

export function InspectorColorControl({
  label,
  value,
  onChange,
  onChangeEnd,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onChangeEnd?: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <InspectorControlLabel>{label}</InspectorControlLabel>
      <div className="mt-1.5">
        <ColorPickerPopover
          label={label}
          value={value}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          triggerClassName="w-full justify-start text-studio-fg"
        />
      </div>
    </div>
  );
}

export function InspectorResetButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-studio-border bg-studio-panel-raised/50 text-xs font-medium text-studio-muted hover:bg-studio-hover hover:text-studio-fg transition-colors cursor-pointer"
    >
      <RotateCcw className="h-3.5 w-3.5 text-studio-muted" /> {children}
    </button>
  );
}

export const inspectorActionClass =
  "h-8 justify-start gap-2 rounded-lg border border-studio-border bg-studio-panel-raised/50 px-2.5 text-[11px] font-medium text-studio-fg shadow-none hover:border-studio-border-strong hover:bg-studio-hover disabled:opacity-40 cursor-pointer";
