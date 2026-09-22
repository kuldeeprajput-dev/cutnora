'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: boolean;
  placeholder?: string;
}

interface ParsedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      error,
      value,
      defaultValue,
      onChange,
      disabled = false,
      id,
      name,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
      top: 0,
      left: 0,
      width: 0,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const internalSelectRef = useRef<HTMLSelectElement | null>(null);

    useImperativeHandle(ref, () => internalSelectRef.current as HTMLSelectElement);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Extract options from children (handles <option> tags and nested structures)
    const options = useMemo(() => {
      const list: ParsedOption[] = [];
      const parseNodes = (nodes: React.ReactNode) => {
        React.Children.forEach(nodes, (child) => {
          if (!React.isValidElement(child)) return;
          const props = child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean };
          if (child.type === 'option' || (props && 'value' in props)) {
            list.push({
              value: String(props.value ?? ''),
              label: props.children ?? String(props.value ?? ''),
              disabled: Boolean(props.disabled),
            });
          } else if (props && props.children) {
            parseNodes(props.children);
          }
        });
      };
      parseNodes(children);
      return list;
    }, [children]);

    // Handle controlled vs uncontrolled state
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
      if (defaultValue !== undefined) return String(defaultValue);
      return options[0]?.value ?? '';
    });

    const currentValue = isControlled ? String(value ?? '') : uncontrolledValue;
    const currentOption = options.find((opt) => opt.value === currentValue) || options[0];
    const displayLabel = currentOption ? currentOption.label : (placeholder || 'Select...');

    const updateCoords = useCallback(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = menuRef.current?.offsetHeight || Math.min(240, options.length * 36 + 12);
        const viewportHeight = window.innerHeight;

        const openUpwards = rect.bottom + menuHeight > viewportHeight - 12 && rect.top > menuHeight;

        let top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
        top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));

        setCoords({
          top,
          left: rect.left,
          width: rect.width,
        });
      }
    }, [options.length]);

    const handleSelectOption = (opt: ParsedOption) => {
      if (opt.disabled || disabled) return;

      if (!isControlled) {
        setUncontrolledValue(opt.value);
      }

      if (internalSelectRef.current) {
        internalSelectRef.current.value = opt.value;
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: opt.value, name: name || '' },
          currentTarget: { value: opt.value, name: name || '' },
          preventDefault: () => {},
          stopPropagation: () => {},
          persist: () => {},
          nativeEvent: new Event('change'),
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const toggleOpen = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || options.length === 0) return;
      if (!isOpen) {
        updateCoords();
      }
      setIsOpen((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) {
          updateCoords();
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          updateCoords();
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === currentValue);
          const nextIndex =
            e.key === 'ArrowDown'
              ? (currentIndex + 1) % options.length
              : (currentIndex - 1 + options.length) % options.length;
          const nextOpt = options[nextIndex];
          if (nextOpt && !nextOpt.disabled) {
            handleSelectOption(nextOpt);
          }
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      if (!isOpen) return;

      updateCoords();
      const rafId = requestAnimationFrame(updateCoords);

      const handleClickOutside = (e: MouseEvent | PointerEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          menuRef.current &&
          !menuRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };

      const handleScroll = () => {
        setIsOpen(false);
      };

      document.addEventListener('pointerdown', handleClickOutside, true);
      document.addEventListener('keydown', handleKey);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);

      return () => {
        cancelAnimationFrame(rafId);
        document.removeEventListener('pointerdown', handleClickOutside, true);
        document.removeEventListener('keydown', handleKey);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }, [isOpen, updateCoords]);

    return (
      <div className="relative w-full">
        {/* Hidden native select for form integration and ref access */}
        <select
          ref={internalSelectRef}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
          value={currentValue}
          name={name}
          disabled={disabled}
          onChange={onChange}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {typeof opt.label === 'string' ? opt.label : opt.value}
            </option>
          ))}
        </select>

        {/* Studio Themed Trigger Button */}
        <button
          type="button"
          id={id}
          ref={triggerRef}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] pl-3 pr-2.5 py-1 text-xs text-white transition-all select-none cursor-pointer',
            'hover:bg-white/[0.06] hover:border-white/20',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:border-white/30',
            isOpen && 'border-white/30 ring-1 ring-white/30 bg-white/[0.06]',
            disabled && 'cursor-not-allowed opacity-50 hover:bg-white/[0.03] hover:border-white/10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
        >
          <span className="truncate text-left font-medium">{displayLabel}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-studio-muted transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'rotate-180 text-white'
            )}
          />
        </button>

        {/* Studio Themed Popup Menu */}
        {isOpen &&
          mounted &&
          createPortal(
            <div
              ref={menuRef}
              role="listbox"
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 9999,
              }}
              className="max-h-60 overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-[#141416]/95 backdrop-blur-xl p-1 text-studio-fg shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-xs text-studio-muted text-center">No options available</div>
              ) : (
                options.map((opt) => {
                  const isSelected = opt.value === currentValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors select-none cursor-pointer',
                        isSelected
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-studio-fg/90 hover:bg-white/5 hover:text-white',
                        opt.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[2.5] shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>,
            document.body
          )}
      </div>
    );
  }
);

Select.displayName = 'Select';
