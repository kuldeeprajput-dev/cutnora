"use client";

import React, { useEffect, useId, useRef } from "react";
import { AlertTriangle, AlertCircle, Info, Trash2, X } from "lucide-react";
import { usePopupStore, type PopupVariant } from "./usePopupStore";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { cn } from "@/shared/utils/cn";

const iconMap: Record<PopupVariant, React.ComponentType<{ className?: string }>> = {
  destructive: Trash2,
  warning: AlertTriangle,
  info: Info,
  primary: AlertCircle,
};

function renderFormattedMessage(message: React.ReactNode | string) {
  if (typeof message !== "string") return message;
  const parts = message.split(/(".*?")/g);
  if (parts.length === 1) return message;

  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('"') && part.endsWith('"') ? (
          <span
            key={i}
            className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-brand/12 border border-brand/25 text-brand select-all"
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export function PopupModal() {
  const { isOpen, options, close } = usePopupStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const isConfirm = options.type === "confirm";
  const IconComponent = iconMap[options.variant || "primary"] || AlertCircle;

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      (options.variant === "destructive" ? cancelBtnRef : confirmBtnRef).current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close, options.variant]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (options.closeOnBackdropClick && e.target === e.currentTarget) close(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md transition-opacity duration-200 animate-in fade-in sm:items-center sm:p-4"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-t-3xl border border-studio-border bg-studio-panel/95 p-6 text-studio-fg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-200 animate-in zoom-in-95 sm:rounded-2xl sm:p-6",
          "focus-visible:outline-none",
        )}
      >
        <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand/35 bg-gradient-to-b from-brand/20 to-brand/10 text-brand shadow-[0_0_18px_rgba(255,90,54,0.18)]">
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 id={titleId} className="text-base font-bold leading-snug tracking-tight text-studio-fg sm:text-lg">
                {options.title || (isConfirm ? "Confirm Action" : "Notice")}
              </h3>
            </div>
          </div>
          <IconButton
            label="Close popup"
            size="sm"
            variant="ghost"
            onClick={() => close(false)}
            className="text-studio-muted hover:text-studio-fg -mr-1.5 -mt-1.5"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="relative mt-3.5 pl-0 text-xs leading-relaxed text-studio-muted sm:pl-[58px] sm:text-sm">
          <div id={descriptionId}>{renderFormattedMessage(options.message)}</div>
        </div>

        <div className="relative mt-6 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
          {isConfirm && (
            <Button
              ref={cancelBtnRef}
              type="button"
              variant="secondary"
              size="md"
              onClick={() => close(false)}
              className="h-10 w-full touch-manipulation text-xs font-semibold sm:h-9 sm:w-auto sm:text-sm active:scale-[0.98] transition-all"
            >
              {options.cancelText || "Cancel"}
            </Button>
          )}
          <Button
            ref={confirmBtnRef}
            type="button"
            variant="primary"
            size="md"
            onClick={() => close(true)}
            className="h-10 w-full touch-manipulation text-xs font-semibold sm:h-9 sm:w-auto sm:text-sm shadow-[0_2px_12px_rgba(255,90,54,0.35)] hover:shadow-[0_4px_16px_rgba(255,90,54,0.45)] active:scale-[0.98] transition-all"
          >
            {options.confirmText || (isConfirm ? "Confirm" : "OK")}
          </Button>
        </div>
      </div>
    </div>
  );
}
