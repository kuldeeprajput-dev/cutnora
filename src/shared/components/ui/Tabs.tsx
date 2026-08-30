import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/shared/utils/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalTab;
  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-1 rounded-lg bg-studio-topbar p-1 border border-studio-border', className)}
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

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        isActive
          ? 'bg-studio-panel-raised text-studio-fg shadow-sm font-semibold'
          : 'text-studio-muted hover:text-studio-fg hover:bg-studio-panel',
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
}

export function TabContent({ value, className, children, ...props }: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-2 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
}
