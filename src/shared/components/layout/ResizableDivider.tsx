import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface ResizableDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  onResize?: (delta: number) => void;
}

export function ResizableDivider({
  className,
  orientation = 'vertical',
  onResize,
  ...props
}: ResizableDividerProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = orientation === 'vertical' ? moveEvent.clientX - startX : moveEvent.clientY - startY;
      onResize?.(delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      className={cn(
        'relative flex shrink-0 items-center justify-center bg-[#2B2F38] transition-colors hover:bg-[#FF5A36] select-none',
        orientation === 'vertical'
          ? 'h-full w-1 cursor-col-resize hover:w-1.5'
          : 'w-full h-1 cursor-row-resize hover:h-1.5',
        className
      )}
      {...props}
    />
  );
}
