import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delayMs?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
  hideOnClick?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  delayMs = 300,
  position = 'top',
  align = 'center',
  hideOnClick = true,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAlign, setCurrentAlign] = useState<'center' | 'left' | 'right'>(align);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentAlign(align);
  }, [align]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (hideOnClick) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    // Only display tooltip on focus if navigated via keyboard (:focus-visible), never on mouse clicks
    try {
      if ((e.target as HTMLElement)?.matches?.(':focus-visible')) {
        handleMouseEnter();
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      let minLeft = 8;
      let maxRight = window.innerWidth - 8;

      let parent = tooltipRef.current.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        const isClipping =
          overflowX === 'hidden' || overflowX === 'auto' || overflowX === 'scroll' ||
          overflowY === 'hidden' || overflowY === 'auto' || overflowY === 'scroll';

        if (isClipping) {
          const parentRect = parent.getBoundingClientRect();
          maxRight = Math.min(maxRight, parentRect.right - 8);
          minLeft = Math.max(minLeft, parentRect.left + 8);
        }
        parent = parent.parentElement;
      }

      if (rect.right > maxRight) {
        setCurrentAlign('right');
      } else if (rect.left < minLeft) {
        setCurrentAlign('left');
      }
    }
  }, [isVisible]);

  const positionClasses = {
    top: {
      center: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
      left: 'bottom-full left-0 mb-2.5',
      right: 'bottom-full right-0 mb-2.5',
    },
    bottom: {
      center: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
      left: 'top-full left-0 mt-2.5',
      right: 'top-full right-0 mt-2.5',
    },
    left: {
      center: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
      left: 'right-full top-0 mr-2.5',
      right: 'right-full bottom-0 mr-2.5',
    },
    right: {
      center: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
      left: 'left-full top-0 ml-2.5',
      right: 'left-full bottom-0 ml-2.5',
    },
  };

  const arrowClasses = {
    top: {
      center: 'bottom-[-4px] left-1/2 -translate-x-1/2',
      left: 'bottom-[-4px] left-2.5',
      right: 'bottom-[-4px] right-2.5',
    },
    bottom: {
      center: 'top-[-4px] left-1/2 -translate-x-1/2',
      left: 'top-[-4px] left-2.5',
      right: 'top-[-4px] right-2.5',
    },
    left: {
      center: 'right-[-4px] top-1/2 -translate-y-1/2',
      left: 'right-[-4px] top-2.5',
      right: 'right-[-4px] bottom-2.5',
    },
    right: {
      center: 'left-[-4px] top-1/2 -translate-y-1/2',
      left: 'left-[-4px] top-2.5',
      right: 'left-[-4px] bottom-2.5',
    },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleMouseLeave}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 flex items-center px-2 py-0.5 text-[10px] font-medium text-white/90 bg-[#1c1c20] border border-white/10 rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150 animate-in fade-in-0 zoom-in-95',
            positionClasses[position][currentAlign],
            className
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute h-1.5 w-1.5 rotate-45 bg-[#1c1c20]',
              arrowClasses[position][currentAlign]
            )}
          />
          <span className="relative z-10">{content}</span>
        </div>
      )}
    </div>
  );
}
