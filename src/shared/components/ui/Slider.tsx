import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, label, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      let newValue = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(max, value + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(min, value - step);
      } else if (e.key === 'Home') {
        newValue = min;
      } else if (e.key === 'End') {
        newValue = max;
      } else if (e.key === 'PageUp') {
        newValue = Math.min(max, value + step * 10);
      } else if (e.key === 'PageDown') {
        newValue = Math.max(min, value - step * 10);
      } else {
        return;
      }
      e.preventDefault();
      onValueChange(newValue);
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center justify-between text-xs text-[#9298A3]">
            <span>{label}</span>
            <span className="font-mono">{value}</span>
          </div>
        )}
        <div className="relative flex items-center w-full h-5 touch-none select-none">
          <div className="relative w-full h-1.5 rounded-full bg-[#2B2F38] overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#FF5A36] rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onValueChange(parseFloat(e.target.value))}
            onKeyDown={handleKeyDown}
            className={cn(
              'absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed',
              'focus-visible:outline-none',
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
