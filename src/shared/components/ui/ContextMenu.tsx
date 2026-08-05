'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface ContextMenuItemData {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  isDivider?: boolean;
  onClick: () => void;
}

export interface ContextMenuProps {
  children?: React.ReactNode;
  menu?: React.ReactNode;
  items?: ContextMenuItemData[];
  x?: number;
  y?: number;
  onClose?: () => void;
  className?: string;
}

export function ContextMenu({ children, menu, items, x, y, onClose, className }: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    x !== undefined && y !== undefined ? { x, y } : null
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (x !== undefined && y !== undefined) {
      setPosition({ x, y });
    }
  }, [x, y]);

  const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number } | null>(null);

  React.useLayoutEffect(() => {
    if (position && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let y = position.y;
      let x = position.x;

      // Prefer positioning above the click point when in lower half of screen / timeline area
      if (y + rect.height > windowHeight - 20 || y > windowHeight * 0.35) {
        y = Math.max(10, position.y - rect.height - 4);
      } else {
        y = Math.min(windowHeight - rect.height - 10, y);
      }

      if (x + rect.width > windowWidth - 10) {
        x = Math.max(10, windowWidth - rect.width - 10);
      }

      setAdjustedPos({ x, y });
    }
  }, [position]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (children) {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClose = React.useCallback(() => {
    setPosition(null);
    setAdjustedPos(null);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, handleClose]);

  const renderPos = adjustedPos || position;

  return (
    <div onContextMenu={children ? handleContextMenu : undefined} className={cn(children && 'relative', className)}>
      {children}
      {position && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            top: `${renderPos?.y ?? position.y}px`,
            left: `${renderPos?.x ?? position.x}px`,
            visibility: adjustedPos ? 'visible' : 'hidden',
          }}
          className="fixed z-[9999] min-w-[180px] rounded-lg border border-studio-border bg-studio-panel p-1.5 text-studio-fg shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          onClick={handleClose}
        >
          {items ? (
            <div className="flex flex-col gap-0.5">
              {items.map((item, idx) => {
                if (item.isDivider) {
                  return <div key={item.id || idx} className="my-1 h-px bg-studio-border" />;
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.disabled) {
                        item.onClick();
                        handleClose();
                      }
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs font-medium text-left transition-colors select-none',
                      item.disabled && 'opacity-40 cursor-not-allowed',
                      !item.disabled &&
                        (item.destructive
                          ? 'text-destructive hover:bg-destructive/10'
                          : 'text-studio-fg hover:bg-studio-hover')
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="font-mono text-[10px] text-studio-muted shrink-0">{item.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            menu
          )}
        </div>
      )}
    </div>
  );
}

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function ContextMenuItem({ className, children, destructive, ...props }: ContextMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-left transition-colors select-none',
        'focus-visible:outline-none focus-visible:bg-studio-hover',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'text-studio-fg hover:bg-studio-hover',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
