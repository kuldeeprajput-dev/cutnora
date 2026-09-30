import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  children: React.ReactElement;
  delayMs?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
  hideOnClick?: boolean;
  className?: string;
  disabled?: boolean;
}

interface Coords {
  top: number;
  left: number;
  arrowLeft?: number;
  arrowTop?: number;
  actualPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({
  content,
  shortcut,
  children,
  delayMs = 120,
  position = 'top',
  align = 'center',
  hideOnClick = true,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;

    // Exact measured dimensions or realistic fallbacks
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 80;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 26;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;

    let computedPosition = position;

    // Vertical boundary flipping
    if (computedPosition === 'top' && triggerRect.top - tooltipHeight - 8 < padding) {
      computedPosition = 'bottom';
    } else if (
      computedPosition === 'bottom' &&
      triggerRect.bottom + tooltipHeight + 8 > viewportHeight - padding
    ) {
      computedPosition = 'top';
    }

    let top = 0;
    let left = 0;
    let arrowLeft: number | undefined = undefined;
    let arrowTop: number | undefined = undefined;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    if (computedPosition === 'top' || computedPosition === 'bottom') {
      top = computedPosition === 'top' 
        ? triggerRect.top - tooltipHeight - 7 
        : triggerRect.bottom + 7;

      let rawLeft = triggerCenterX - tooltipWidth / 2;
      if (align === 'left') rawLeft = triggerRect.left;
      if (align === 'right') rawLeft = triggerRect.right - tooltipWidth;

      // Ensure tooltip never extends off-screen on the left or right
      left = Math.max(padding, Math.min(viewportWidth - tooltipWidth - padding, rawLeft));

      // Arrow accurately points directly to the center of the trigger button
      const relativeArrowX = triggerCenterX - left;
      arrowLeft = Math.max(10, Math.min(tooltipWidth - 10, relativeArrowX));
    } else if (computedPosition === 'left' || computedPosition === 'right') {
      left = computedPosition === 'left' 
        ? triggerRect.left - tooltipWidth - 7 
        : triggerRect.right + 7;

      const rawTop = triggerCenterY - tooltipHeight / 2;
      top = Math.max(padding, Math.min(viewportHeight - tooltipHeight - padding, rawTop));

      const relativeArrowY = triggerCenterY - top;
      arrowTop = Math.max(8, Math.min(tooltipHeight - 8, relativeArrowY));
    }

    setCoords({ top, left, arrowLeft, arrowTop, actualPosition: computedPosition });
  }, [position, align]);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    setCoords(null);
  };

  const handleClick = () => {
    if (hideOnClick) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
      setCoords(null);
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    try {
      if ((e.target as HTMLElement)?.matches?.(':focus-visible')) {
        handleMouseEnter();
      }
    } catch {
      // Ignore
    }
  };

  // Recalculate position when visible or when window resizes/scrolls
  useEffect(() => {
    if (!isVisible) return;
    updatePosition();

    // Re-check after DOM render has measured exact dimensions
    const rafId = requestAnimationFrame(updatePosition);

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible, updatePosition]);

  // Extract shortcut from content string formatted like "Action (Ctrl+Z)"
  let displayContent = content;
  let displayShortcut = shortcut;

  if (typeof content === 'string' && !displayShortcut) {
    const match = content.match(/^(.*?)(?:\s*\(([^)]+)\))$/);
    if (match) {
      displayContent = match[1].trim();
      displayShortcut = match[2].trim();
    }
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleMouseLeave}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      {children}
      {isVisible && mounted && coords && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className={cn(
              'pointer-events-none flex items-center rounded-md border border-zinc-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-md whitespace-nowrap select-none',
              'dark:border-white/[0.12] dark:bg-[#141416] dark:text-zinc-200 dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.4)]',
              className
            )}
          >
            {/* Dynamic arrow tracking the button center */}
            <span
              aria-hidden="true"
              style={{
                left: coords.arrowLeft !== undefined ? `${coords.arrowLeft}px` : undefined,
                top: coords.arrowTop !== undefined ? `${coords.arrowTop}px` : undefined,
              }}
              className={cn(
                'absolute h-1.5 w-1.5 rotate-45 bg-white border-zinc-200/90 dark:bg-[#141416] dark:border-white/[0.12]',
                coords.actualPosition === 'top' &&
                  '-bottom-[3.5px] -translate-x-1/2 border-b border-r',
                coords.actualPosition === 'bottom' &&
                  '-top-[3.5px] -translate-x-1/2 border-t border-l',
                coords.actualPosition === 'left' &&
                  '-right-[3.5px] -translate-y-1/2 border-t border-r',
                coords.actualPosition === 'right' &&
                  '-left-[3.5px] -translate-y-1/2 border-b border-l'
              )}
            />

            <span className="relative z-10 text-[11px] font-medium text-zinc-900 dark:text-zinc-200 tracking-normal select-none">
              {displayContent}
            </span>
            {displayShortcut && (
              <span className="relative z-10 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 font-normal tracking-wider ml-1.5 select-none">
                {displayShortcut.toUpperCase()}
              </span>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
