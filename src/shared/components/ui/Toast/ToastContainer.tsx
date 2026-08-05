'use client';

import React from 'react';
import { useToastStore } from './useToastStore';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-mkt-success shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-selection shrink-0" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-mkt-info shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-studio-border bg-studio-panel p-3 text-xs text-studio-fg shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            {renderIcon(toast.type)}
            <span className="truncate">{toast.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-studio-muted hover:text-studio-fg transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
