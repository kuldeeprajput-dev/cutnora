import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { IconButton } from "./IconButton";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  mobileBottomSheet?: boolean;
  closeOnBackdropClick?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  mobileBottomSheet = false,
  closeOnBackdropClick = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }

        if (e.key === "Tab" && dialogRef.current) {
          const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      const focusTimer = window.setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);

      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener("keydown", handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-xs",
        mobileBottomSheet
          ? "items-end p-0 sm:items-center sm:p-4"
          : "items-center p-2 sm:p-4",
      )}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative max-h-[calc(100dvh-16px)] w-full max-w-lg overflow-y-auto rounded-xl border border-studio-border bg-studio-panel p-4 text-studio-fg shadow-xl transition-all studio-scrollbar sm:max-h-[calc(100dvh-32px)] sm:p-6",
          mobileBottomSheet &&
            "max-h-[calc(100dvh-8px)] rounded-b-none rounded-t-2xl border-b-0 sm:max-h-[calc(100dvh-32px)] sm:rounded-xl sm:border-b",
          "focus-visible:outline-none",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-studio-fg"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-xs text-studio-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Close dialog"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
