import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'selection' | 'marketing';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#FF5A36] text-white hover:bg-[#E84928] active:bg-[#d03d1e]',
  secondary: 'bg-[#1D2027] text-[#F4F5F7] hover:bg-[#242832] border border-[#2B2F38]',
  outline: 'border border-[#2B2F38] text-[#F4F5F7] bg-transparent hover:bg-[#1D2027]',
  ghost: 'text-[#9298A3] hover:text-[#F4F5F7] hover:bg-[#1D2027]',
  destructive: 'bg-[#E45858] text-white hover:bg-[#d34545]',
  selection: 'bg-[#F2C94C] text-[#101216] font-semibold hover:bg-[#e0b73b]',
  marketing: 'bg-[#FF5A36] text-white font-medium hover:bg-[#E84928] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101216]',
          'disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
