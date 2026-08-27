import React from "react";
import { cn } from "@/shared/utils/cn";

export interface ResizableDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  onResize?: (delta: number) => void;
}

export function ResizableDivider({
  className,
  orientation = "vertical",
  onResize,
  ...props
}: ResizableDividerProps) {
  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta =
        orientation === "vertical"
          ? moveEvent.clientX - startX
          : moveEvent.clientY - startY;
      onResize?.(delta);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
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
          ? "h-full w-2 cursor-col-resize"
          : "h-2 w-full cursor-row-resize",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block bg-studio-border transition-[background-color,transform] group-hover:bg-brand group-focus-visible:bg-brand",
          orientation === "vertical"
            ? "h-full w-px group-hover:scale-x-[2]"
            : "h-px w-full group-hover:scale-y-[2]",
        )}
      />
    </div>
  );
}
