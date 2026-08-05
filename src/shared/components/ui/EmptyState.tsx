import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  title,
  description,
  icon,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#2B2F38] bg-[#14161B]/50',
        className
      )}
      {...props}
    >
      {icon && <div className="mb-3 text-[#9298A3]">{icon}</div>}
      <h3 className="text-sm font-semibold text-[#F4F5F7]">{title}</h3>
      {description && <p className="mt-1 text-xs text-[#9298A3] max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
