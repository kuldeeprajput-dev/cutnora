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
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-studio-border bg-studio-topbar/50',
        className
      )}
      {...props}
    >
      {icon && <div className="mb-3 text-studio-muted">{icon}</div>}
      <h3 className="text-sm font-semibold text-studio-fg">{title}</h3>
      {description && <p className="mt-1 text-xs text-studio-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
