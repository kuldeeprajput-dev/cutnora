import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[#2B2F38] bg-[#171A20] px-3 py-1 text-sm text-[#F4F5F7]',
          'placeholder:text-[#9298A3]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#E45858] focus-visible:ring-[#E45858]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
