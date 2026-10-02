import React from "react";
import { flushSync } from "react-dom";
import { cn } from "@/shared/utils/cn";

export interface ResizableDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  onResize?: (delta: number) => void;
  onResizeEnd?: () => void;
  hasCornerHandle?: boolean;
  onCornerResize?: (deltaX: number, deltaY: number) => void;
}

export function ResizableDivider({
  className,
  orientation = "vertical",
  onResize,
  onResizeEnd,
  hasCornerHandle = false,
  onCornerResize,
  ...props
}: ResizableDividerProps) {
  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {}

    const bounds = target.getBoundingClientRect();
    const grabOffsetX = event.clientX - (bounds.left + bounds.width / 2);
    const grabOffsetY = event.clientY - (bounds.top + bounds.height / 2);

    const originalCursor = document.body.style.cursor;
    const originalRootCursor = document.documentElement.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    const activeCursor = orientation === "vertical" ? "col-resize" : "row-resize";
    document.body.style.cursor = activeCursor;
    document.documentElement.style.cursor = activeCursor;
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const currentBounds = target.getBoundingClientRect();
      const delta =
        orientation === "vertical"
          ? moveEvent.clientX - grabOffsetX -
            (currentBounds.left + currentBounds.width / 2)
          : moveEvent.clientY - grabOffsetY -
            (currentBounds.top + currentBounds.height / 2);
      if (delta !== 0) flushSync(() => onResize?.(delta));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {}
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = originalCursor;
      document.documentElement.style.cursor = originalRootCursor;
      document.body.style.userSelect = originalUserSelect;
      onResizeEnd?.();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleCornerPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {}

    const bounds = target.getBoundingClientRect();
    const grabOffsetX = event.clientX - (bounds.left + bounds.width / 2);
    const grabOffsetY = event.clientY - (bounds.top + bounds.height / 2);

    const originalCursor = document.body.style.cursor;
    const originalRootCursor = document.documentElement.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "move";
    document.documentElement.style.cursor = "move";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const currentBounds = target.getBoundingClientRect();
      const deltaX = moveEvent.clientX - grabOffsetX -
        (currentBounds.left + currentBounds.width / 2);
      const deltaY = moveEvent.clientY - grabOffsetY -
        (currentBounds.top + currentBounds.height / 2);
      if (deltaX !== 0 || deltaY !== 0) {
        flushSync(() => onCornerResize?.(deltaX, deltaY));
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {}
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = originalCursor;
      document.documentElement.style.cursor = originalRootCursor;
      document.body.style.userSelect = originalUserSelect;
      onResizeEnd?.();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 24 : 8;
    const negativeKey = orientation === "vertical" ? "ArrowLeft" : "ArrowUp";
    const positiveKey = orientation === "vertical" ? "ArrowRight" : "ArrowDown";
    if (event.key !== negativeKey && event.key !== positiveKey) return;
    event.preventDefault();
    event.stopPropagation();
    onResize?.(event.key === negativeKey ? -step : step);
    onResizeEnd?.();
  };

  const handleCornerKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 24 : 8;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.stopPropagation();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onCornerResize?.(-step, 0);
      onResizeEnd?.();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onCornerResize?.(step, 0);
      onResizeEnd?.();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      onCornerResize?.(0, -step);
      onResizeEnd?.();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onCornerResize?.(0, step);
      onResizeEnd?.();
    }
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={`Resize ${orientation === "vertical" ? "side panel" : "timeline"}`}
      aria-orientation={orientation}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative z-20 flex shrink-0 items-center justify-center bg-transparent outline-none select-none touch-none",
        "focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-inset",
        orientation === "vertical"
          ? "h-full w-[6px] cursor-col-resize before:absolute before:inset-y-0 before:-inset-x-1.5"
          : "h-[6px] w-full cursor-row-resize before:absolute before:inset-x-0 before:-inset-y-1.5",
        className,
      )}
      {...props}
    >
      {hasCornerHandle && (
        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize layout in all directions"
          onPointerDown={handleCornerPointerDown}
          onKeyDown={handleCornerKeyDown}
          style={{
            top: "calc(100% + 3px)",
            left: "50%",
            transform: "translate(-50%, -50%)",
            cursor: "move",
          }}
          className="absolute z-50 h-4 w-4 cursor-move rounded-sm bg-transparent select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      )}
    </div>
  );
}
