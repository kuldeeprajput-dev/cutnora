import React, { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";
import { ButtonVariant, ButtonSize } from "./Button";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shortcut?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  tooltipAlign?: "center" | "left" | "right";
  tooltipDelayMs?: number;
  showTooltip?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 w-8 text-xs rounded-md",
  md: "h-9 w-9 text-sm rounded-lg",
  lg: "h-11 w-11 text-base rounded-xl",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-contrast hover:bg-brand-hover",
  secondary:
    "bg-studio-panel-raised text-studio-fg hover:bg-studio-hover border border-studio-border",
  outline:
    "border border-studio-border text-studio-fg bg-transparent hover:bg-studio-panel-raised",
  ghost: "text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised",
  destructive: "bg-destructive text-white hover:bg-destructive-hover",
  selection: "bg-selection text-studio-bg hover:bg-selection-hover",
  marketing: "bg-brand text-brand-contrast hover:bg-brand-hover",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      label,
      variant = "ghost",
      size = "md",
      shortcut,
      tooltipPosition = "top",
      tooltipAlign = "center",
      tooltipDelayMs = 150,
      showTooltip = true,
      children,
      title,
      ...props
    },
    ref,
  ) => {
    const button = (
      <button
        ref={ref}
        aria-label={label}
        title={title}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors select-none shrink-0 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg",
          "disabled:opacity-40 disabled:cursor-not-allowed motion-reduce:transition-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );

    if (!showTooltip || !label) {
      return button;
    }

    return (
      <Tooltip
        content={label}
        shortcut={shortcut}
        position={tooltipPosition}
        align={tooltipAlign}
        delayMs={tooltipDelayMs}
      >
        {button}
      </Tooltip>
    );
  },
);

IconButton.displayName = "IconButton";
