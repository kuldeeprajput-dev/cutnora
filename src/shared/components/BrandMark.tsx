import React from "react";
import { cn } from "@/shared/utils/cn";

interface BrandMarkProps {
  className?: string;
  size?: number;
  inverted?: boolean;
  variant?: "default" | "marketing";
}

export function BrandMark({
  className,
  size = 32,
  inverted = false,
}: BrandMarkProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("relative inline-flex shrink-0 items-center justify-center transition-transform duration-200", className)}
      aria-hidden="true"
    >
      {/* Light mode logo */}
      <img
        src="/brand/cutnora-logo.svg"
        alt="Cutnora"
        width={size}
        height={size}
        className={cn(
          "w-full h-full object-contain pointer-events-none select-none",
          inverted ? "hidden dark:block" : "block dark:hidden"
        )}
      />
      {/* Dark mode logo */}
      <img
        src="/brand/cutnora-logo-dark.svg"
        alt="Cutnora"
        width={size}
        height={size}
        className={cn(
          "w-full h-full object-contain pointer-events-none select-none",
          inverted ? "block dark:hidden" : "hidden dark:block"
        )}
      />
    </span>
  );
}
