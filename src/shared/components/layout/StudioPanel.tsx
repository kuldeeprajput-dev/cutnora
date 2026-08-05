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
        'flex flex-col overflow-hidden border border-[#2B2F38] text-[#F4F5F7]',
        raised ? 'bg-[#1D2027]' : 'bg-[#171A20]',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2B2F38] bg-[#14161B] px-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#9298A3]">
            {title}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
