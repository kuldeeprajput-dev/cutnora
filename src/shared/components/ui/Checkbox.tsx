import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, disabled, label, id, onChange, ...props }, ref) => {
    const inputId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label className={cn('inline-flex items-center gap-2 select-none cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}>
        <div className="relative inline-flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-4 w-4 rounded border border-white/20 bg-white/5 transition-all flex items-center justify-center',
              'peer-checked:bg-white peer-checked:border-white',
              'peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-white/40',
              className
            )}
          >
            {checked && <Check className="h-3 w-3 text-black stroke-[3]" />}
          </div>
        </div>
        {label && <span className="text-sm font-medium text-studio-fg">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
