import React from "react";
import { cn } from "@/shared/utils/cn";

export interface ResizableDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  onResize?: (delta: number) => void;
  hasCornerHandle?: boolean;
  onCornerResize?: (deltaX: number, deltaY: number) => void;
}

export function ResizableDivider({
  className,
  orientation = "vertical",
  onResize,
  hasCornerHandle = false,
  onCornerResize,
  ...props
}: ResizableDividerProps) {
  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    let lastX = event.clientX;
    let lastY = event.clientY;

    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = orientation === "vertical" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta =
        orientation === "vertical"
          ? moveEvent.clientX - lastX
          : moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      onResize?.(delta);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  };

  const handleCornerPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    let lastX = event.clientX;
    let lastY = event.clientY;

    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "all-scroll";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - lastX;
      const deltaY = moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      onCornerResize?.(deltaX, deltaY);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 24 : 8;
    const negativeKey = orientation === "vertical" ? "ArrowLeft" : "ArrowUp";
    const positiveKey = orientation === "vertical" ? "ArrowRight" : "ArrowDown";
    if (event.key !== negativeKey && event.key !== positiveKey) return;
    event.preventDefault();
    onResize?.(event.key === negativeKey ? -step : step);
  };

  const handleCornerKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 24 : 8;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onCornerResize?.(-step, 0);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onCornerResize?.(step, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      onCornerResize?.(0, -step);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onCornerResize?.(0, step);
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
          className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 z-30 h-5 w-5 cursor-all-scroll bg-transparent select-none touch-none outline-none focus-visible:ring-1 focus-visible:ring-brand"
        />
      )}
    </div>
  );
}
