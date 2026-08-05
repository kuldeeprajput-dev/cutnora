import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { ButtonVariant, ButtonSize } from './Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 text-xs rounded-md',
  md: 'h-9 w-9 text-sm rounded-lg',
  lg: 'h-11 w-11 text-base rounded-xl',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#FF5A36] text-white hover:bg-[#E84928]',
  secondary: 'bg-[#1D2027] text-[#F4F5F7] hover:bg-[#242832] border border-[#2B2F38]',
  outline: 'border border-[#2B2F38] text-[#F4F5F7] bg-transparent hover:bg-[#1D2027]',
  ghost: 'text-[#9298A3] hover:text-[#F4F5F7] hover:bg-[#1D2027]',
  destructive: 'bg-[#E45858] text-white hover:bg-[#d34545]',
  selection: 'bg-[#F2C94C] text-[#101216] hover:bg-[#e0b73b]',
  marketing: 'bg-[#FF5A36] text-white hover:bg-[#E84928]',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, variant = 'ghost', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors select-none shrink-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101216]',
          'disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
