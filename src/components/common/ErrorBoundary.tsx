import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-amber-50/40 to-pink-50/60 flex items-center justify-center p-4">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-md w-full bg-white/85 border border-white/95 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-pink-900/10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/30 mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Nails by Uma Atelier
            </div>

            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Unexpected Experience Glitch
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6">
              We encountered a minor hiccup while rendering this luxury section. Don't worry, your data and appointments are safe.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-rose-50 border border-pink-100 rounded-2xl text-left text-xs font-mono text-rose-700 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full flex-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold gap-2 py-3 shadow-md shadow-pink-600/20"
              >
                <RefreshCw className="w-4 h-4" /> Reload Application
              </Button>

              <Button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 rounded-xl text-xs font-bold gap-2 py-3 px-5"
              >
                <Home className="w-4 h-4" /> Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
