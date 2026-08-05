import React from 'react';
import { cn } from '@/shared/utils/cn';

export type BadgeVariant = 'default' | 'success' | 'info' | 'warning' | 'selection' | 'studio';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#1D2027] text-[#9298A3] border-[#2B2F38]',
  success: 'bg-[#248A5A]/15 text-[#248A5A] border-[#248A5A]/30',
  info: 'bg-[#3478D4]/15 text-[#3478D4] border-[#3478D4]/30',
  warning: 'bg-[#F2C94C]/15 text-[#F2C94C] border-[#F2C94C]/30',
  selection: 'bg-[#F2C94C] text-[#101216] border-[#F2C94C] font-semibold',
  studio: 'bg-[#FF5A36]/15 text-[#FF5A36] border-[#FF5A36]/30',
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
