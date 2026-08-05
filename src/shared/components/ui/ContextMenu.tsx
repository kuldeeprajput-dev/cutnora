import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface ContextMenuProps {
  children: React.ReactNode;
  menu: React.ReactNode;
  className?: string;
}

export function ContextMenu({ children, menu, className }: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPosition(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPosition(null);
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position]);

  return (
    <div onContextMenu={handleContextMenu} className={cn('relative', className)}>
      {children}
      {position && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
          className="fixed z-50 min-w-[160px] rounded-lg border border-[#2B2F38] bg-[#171A20] p-1 text-[#F4F5F7] shadow-xl"
          onClick={() => setPosition(null)}
        >
          {menu}
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
        destructive
          ? 'text-[#E45858] hover:bg-[#E45858]/10'
          : 'text-[#F4F5F7] hover:bg-[#242832]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
