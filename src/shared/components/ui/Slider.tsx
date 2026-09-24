import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  fillClassName?: string;
  trackClassName?: string;
  thumbClassName?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, label, fillClassName, trackClassName, thumbClassName, ...props }, ref) => {
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
          <div className="flex items-center justify-between text-xs text-studio-muted">
            <span>{label}</span>
            <span className="font-mono">{value}</span>
          </div>
        )}
        <div className="group/slider relative flex items-center w-full h-5 touch-none select-none">
          <div className={cn("relative w-full h-1 rounded-full overflow-hidden bg-studio-border dark:bg-white/10", trackClassName)}>
            <div
              className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-75 bg-studio-fg dark:bg-white", fillClassName)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Draggable visual thumb handle */}
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white dark:bg-white border border-studio-border-strong dark:border-white shadow-md dark:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-transform group-hover/slider:scale-125",
              thumbClassName
            )}
            style={{ left: `${percentage}%` }}
          />
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
