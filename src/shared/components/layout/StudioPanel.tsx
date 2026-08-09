import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface StudioPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  collapsible?: boolean;
  raised?: boolean;
}

export function StudioPanel({
  className,
  title,
  actions,
  children,
  raised = false,
  ...props
}: StudioPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden border border-studio-border text-studio-fg min-w-[310px]',
        raised ? 'bg-studio-panel-raised' : 'bg-studio-panel',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-studio-border bg-studio-topbar px-3 gap-2">
          <div
            className="text-xs font-semibold uppercase tracking-wider text-studio-muted truncate min-w-0 flex-1"
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </div>
          {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
