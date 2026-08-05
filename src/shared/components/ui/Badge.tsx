import React from 'react';
import { cn } from '@/shared/utils/cn';

export type BadgeVariant = 'default' | 'success' | 'info' | 'warning' | 'selection' | 'studio';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-studio-panel-raised text-studio-muted border-studio-border',
  success: 'bg-mkt-success/15 text-mkt-success border-mkt-success/30',
  info: 'bg-mkt-info/15 text-mkt-info border-mkt-info/30',
  warning: 'bg-selection/15 text-selection border-selection/30',
  selection: 'bg-selection text-studio-bg border-selection font-semibold',
  studio: 'bg-brand/15 text-brand border-brand/30',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-tight select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
