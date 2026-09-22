import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/shared/utils/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant?: 'pill' | 'line';
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'pill' | 'line';
}

export function Tabs({ defaultValue, value, onValueChange, variant = 'pill', children, className, ...props }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalTab;
  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(TabsContext);
  const isLine = context?.variant === 'line';

  return (
    <div
      role="tablist"
      className={cn(
        isLine
          ? 'flex w-full items-center gap-1 border-b border-white/[0.08] bg-transparent p-0'
          : 'inline-flex items-center gap-1 rounded-lg bg-studio-topbar p-1 border border-studio-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabTrigger({ value, className, children, ...props }: TabTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');

  const isActive = context.activeTab === value;
  const isLine = context.variant === 'line';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center transition-colors select-none focus-visible:outline-none',
        isLine
          ? cn(
              'relative min-h-8 flex-1 cursor-pointer justify-center gap-1.5 whitespace-nowrap bg-transparent shadow-none border-0 px-2 py-1.5 text-[11px]',
              isActive
                ? 'text-white font-semibold after:absolute after:bottom-0 after:inset-x-2 after:h-0.5 after:bg-white after:rounded-full'
                : 'text-white/50 hover:text-white/80'
            )
          : cn(
              'px-3 py-1 text-xs font-medium rounded-md',
              isActive
                ? 'bg-studio-panel-raised text-studio-fg font-semibold'
                : 'text-studio-muted hover:text-studio-fg hover:bg-studio-panel'
            ),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export function TabContent({ value, className, children, forceMount = false, ...props }: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  const isActive = context.activeTab === value;
  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      hidden={!isActive}
      className={cn('mt-2 focus-visible:outline-none', !isActive && 'hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}
