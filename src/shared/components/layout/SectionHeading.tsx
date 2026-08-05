import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'marketing' | 'studio';
}

export function SectionHeading({
  className,
  title,
  subtitle,
  badge,
  align = 'left',
  theme = 'studio',
  ...props
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', alignmentClasses[align], className)} {...props}>
      {badge && (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight mb-1',
            theme === 'marketing'
              ? 'bg-brand-soft text-brand border border-brand/20'
              : 'bg-studio-panel-raised text-selection border border-studio-border'
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          'text-2xl font-bold tracking-tight sm:text-3xl',
          theme === 'marketing' ? 'text-mkt-fg' : 'text-studio-fg'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-sm max-w-2xl',
            theme === 'marketing' ? 'text-mkt-muted' : 'text-studio-muted'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
