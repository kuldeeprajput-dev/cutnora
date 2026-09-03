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
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]",
        className,
      )}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised text-brand">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-studio-fg">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-[10px] leading-4 text-studio-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function InspectorValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="min-w-12 rounded-md border border-studio-border bg-studio-bg/70 px-1.5 py-0.5 text-right font-mono text-[10px] text-studio-fg">
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
          triggerClassName="w-full justify-start"
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
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:text-studio-fg"
    >
      <RotateCcw className="h-3.5 w-3.5" /> {children}
    </Button>
  );
}

export const inspectorActionClass =
  "h-9 justify-start gap-2 rounded-lg border border-studio-border bg-studio-bg/45 px-2.5 text-[11px] font-medium text-studio-fg shadow-none hover:border-brand/40 hover:bg-studio-panel-raised disabled:border-studio-border/60 disabled:bg-studio-bg/20 disabled:text-studio-muted/55 disabled:opacity-100";
