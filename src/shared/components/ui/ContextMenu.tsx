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

  const handleContextMenu = (e: React.MouseEvent) => {
    if (children) {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClose = React.useCallback(() => {
    setPosition(null);
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

  return (
    <div onContextMenu={children ? handleContextMenu : undefined} className={cn(children && 'relative', className)}>
      {children}
      {position && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
          className="fixed z-50 min-w-[170px] rounded-lg border border-[#2B2F38] bg-[#171A20] p-1.5 text-[#F4F5F7] shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          onClick={handleClose}
        >
          {items ? (
            <div className="flex flex-col gap-0.5">
              {items.map((item, idx) => {
                if (item.isDivider) {
                  return <div key={item.id || idx} className="my-1 h-px bg-[#2B2F38]" />;
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
                          ? 'text-[#E45858] hover:bg-[#E45858]/10'
                          : 'text-[#F4F5F7] hover:bg-[#242832]')
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="font-mono text-[10px] text-[#9298A3] shrink-0">{item.shortcut}</span>
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
        'focus-visible:outline-none focus-visible:bg-[#242832]',
        destructive ? 'text-[#E45858] hover:bg-[#E45858]/10' : 'text-[#F4F5F7] hover:bg-[#242832]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
