import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'left', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: align === 'right' ? rect.right : rect.left,
      });
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, align]);

  return (
    <>
      <div ref={triggerRef} onClick={toggleOpen} className="inline-flex cursor-pointer select-none">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: align === 'right' ? undefined : `${coords.left}px`,
              right: align === 'right' ? `${window.innerWidth - coords.left}px` : undefined,
              zIndex: 99999,
            }}
            className={cn(
              'min-w-[160px] rounded-lg border border-studio-border bg-studio-panel p-1 text-studio-fg shadow-xl animate-in fade-in-80',
              className
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownMenuItem({ className, children, destructive, onClick, ...props }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-left transition-colors select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:bg-studio-hover',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-studio-fg hover:bg-studio-hover',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
