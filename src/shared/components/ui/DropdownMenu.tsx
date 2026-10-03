import React, { useState, useRef, useEffect, useEffectEvent, useLayoutEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';

interface DropdownContextType {
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType>({
  close: () => {},
});

export interface DropdownMenuProps {
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  triggerClassName?: string;
  matchTriggerWidth?: boolean;
  animated?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  trigger,
  children,
  align = 'left',
  className,
  triggerClassName,
  matchTriggerWidth = false,
  animated = true,
  onOpenChange,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const notifyOpenChange = useEffectEvent((open: boolean) => {
    onOpenChange?.(open);
  });

  useEffect(() => {
    notifyOpenChange(isOpen);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  // Subscribe only while open; mounting or unrelated store updates must not close it.
  useEffect(() => {
    if (!isOpen) return;
    return useEditorUIStore.subscribe((state, previous) => {
      if (state.timelineHeight !== previous.timelineHeight || state.leftPanelWidth !== previous.leftPanelWidth) {
        setIsOpen(false);
      }
    });
  }, [isOpen]);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || 130;
      const viewportHeight = window.innerHeight;

      // Determine if menu would be cut off at bottom of viewport
      const openUpwards = rect.bottom + menuHeight > viewportHeight - 12 && rect.top > menuHeight;

      let top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
      top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));

      const left = align === 'right' ? rect.right : rect.left;
      setCoords((previous) =>
        previous.top === top && previous.left === left && previous.width === rect.width
          ? previous
          : { top, left, width: rect.width }
      );
    }
  }, [align]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  // Measure before paint so the menu opens directly at its final position.
  useLayoutEffect(() => {
    if (isOpen) updateCoords();
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
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

    document.addEventListener('pointerdown', handleClickOutside, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, updateCoords]);

  return (
    <DropdownContext.Provider value={{ close }}>
      <div ref={triggerRef} onClick={toggleOpen} className={cn("inline-flex cursor-pointer select-none", triggerClassName)}>
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={close}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: align === 'right' ? undefined : `${coords.left}px`,
              right: align === 'right' ? `${window.innerWidth - coords.left}px` : undefined,
              width: matchTriggerWidth && coords.width ? `${coords.width}px` : undefined,
              zIndex: 9000,
            }}
            className={cn(
              matchTriggerWidth || className?.includes('min-w-') || className?.includes('w-')
                ? 'min-w-0'
                : 'min-w-[160px]',
              'rounded-xl border border-studio-border bg-studio-panel/95 backdrop-blur-md p-1.5 text-studio-fg shadow-2xl',
              animated && 'animate-in fade-in-80 zoom-in-95 duration-150',
              className
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </DropdownContext.Provider>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownMenuItem({ className, children, destructive, onClick, ...props }: DropdownMenuItemProps) {
  const { close } = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    close();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:bg-studio-hover',
        destructive
          ? 'text-destructive hover:bg-destructive/12'
          : 'text-studio-fg hover:bg-studio-hover',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
