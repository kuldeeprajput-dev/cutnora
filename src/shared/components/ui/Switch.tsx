import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, label, ...props }, ref) => {
    return (
      <label className={cn('inline-flex items-center gap-2.5 select-none cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}>
        <button
          type="button"
          role="switch"
          ref={ref}
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101216]',
            checked ? 'bg-[#FF5A36]' : 'bg-[#2B2F38]',
            className
          )}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </button>
        {label && <span className="text-sm font-medium text-[#F4F5F7]">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
