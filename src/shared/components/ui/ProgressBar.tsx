import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  barClassName?: string;
}

export function ProgressBar({
  className,
  value,
  max = 100,
  showValue = false,
  label,
  barClassName,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs text-white/50">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className={cn(
            "h-full rounded-full bg-white transition-all duration-300 ease-out",
            barClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
