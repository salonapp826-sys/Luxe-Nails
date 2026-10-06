import React, { ReactNode } from 'react';
import { RefreshCw, AlertCircle, Inbox, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AsyncStateViewProps<T = any> {
  loading?: boolean;
  error?: string | null;
  data?: T | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode | ((data: T) => ReactNode);
  className?: string;
}

export function AsyncStateView<T = any>({
  loading,
  error,
  data,
  isEmpty,
  onRetry,
  loadingMessage = 'Loading salon details...',
  emptyTitle = 'No records found',
  emptyDescription = 'There are no active items at this time. Please check back shortly.',
  children,
  className = '',
}: AsyncStateViewProps<T>) {
  // 1. Loading State
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[160px] ${className}`}>
        <div className="relative w-10 h-10 mb-3">
          <div className="absolute inset-0 rounded-full border-2 border-pink-100 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-medium text-slate-500 animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className={`p-6 rounded-2xl bg-rose-50/60 border border-rose-100 text-center my-4 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-serif font-bold text-slate-900 mb-1">Temporary Service Notice</h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">{error}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-semibold gap-1.5 h-8 px-4 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Request
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State
  const calculatedIsEmpty =
    isEmpty ??
    (data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0));

  if (calculatedIsEmpty) {
    return (
      <div className={`p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-4 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-serif font-bold text-slate-800 mb-1">{emptyTitle}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  // 4. Render Content safely
  if (typeof children === 'function' && data !== null && data !== undefined) {
    return <div className={className}>{children(data)}</div>;
  }

  return <div className={className}>{children}</div>;
}
