'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cutframe ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#14161B] text-[#F4F5F7] rounded-xl border border-[#2B2F38]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E45858]/15 text-[#E45858] mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F7]">
            {this.props.fallbackTitle || 'Component Error'}
          </h4>
          <p className="mt-1 text-xs text-[#9298A3] max-w-sm">
            {this.props.fallbackMessage ||
              this.state.error?.message ||
              'An isolated rendering error occurred.'}
          </p>
          <div className="mt-4">
            <Button size="sm" variant="secondary" onClick={this.handleReset} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Retry Component
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
