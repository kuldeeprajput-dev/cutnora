import React from 'react';
import { cn } from '@/shared/utils/cn';

export type KbdProps = React.HTMLAttributes<HTMLElement>;

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#9298A3] bg-[#1D2027] border border-[#2B2F38] rounded shadow-2xs select-none',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
