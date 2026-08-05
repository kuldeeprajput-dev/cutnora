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
              ? 'bg-[#FFF0EB] text-[#FF5A36] border border-[#FF5A36]/20'
              : 'bg-[#1D2027] text-[#F2C94C] border border-[#2B2F38]'
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          'text-2xl font-bold tracking-tight sm:text-3xl',
          theme === 'marketing' ? 'text-[#151619]' : 'text-[#F4F5F7]'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-sm max-w-2xl',
            theme === 'marketing' ? 'text-[#6F716F]' : 'text-[#9298A3]'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
