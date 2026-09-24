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
  variant = "default",
}: BrandMarkProps) {
  const isMarketing = variant === "marketing";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200", className)}
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill="currentColor"
        className={cn(
          inverted
            ? "text-zinc-200 dark:text-zinc-800"
            : isMarketing
              ? "text-zinc-950 dark:text-[#DEDEDE]"
              : "text-zinc-950 dark:text-white"
        )}
      />
      <path
        d="M9.5 10.5H18.25C20.5972 10.5 22.5 12.4028 22.5 14.75V21.5H13.75C11.4028 21.5 9.5 19.5972 9.5 17.25V10.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        className={cn(
          inverted
            ? isMarketing
              ? "text-zinc-950 dark:text-[#DEDEDE]"
              : "text-zinc-950 dark:text-white"
            : isMarketing
              ? "text-white dark:text-[#0d0d0d]"
              : "text-white dark:text-zinc-950"
        )}
      />
      <path
        d="M14.25 13.25L19.25 16L14.25 18.75V13.25Z"
        fill="currentColor"
        className={cn(
          inverted
            ? isMarketing
              ? "text-zinc-950 dark:text-[#DEDEDE]"
              : "text-zinc-950 dark:text-white"
            : isMarketing
              ? "text-white dark:text-[#0d0d0d]"
              : "text-white dark:text-zinc-950"
        )}
      />
    </svg>
  );
}
