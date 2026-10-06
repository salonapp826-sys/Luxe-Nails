import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Activity, CheckCircle2, AlertTriangle, WifiOff, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ConnectionStatus = 'checking' | 'healthy' | 'slow' | 'offline' | 'unconfigured';

export function SystemStatusIndicator() {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasNotifiedOnLoadRef = useRef(false);

  const runHealthCheck = useCallback(async (isManualTrigger = false) => {
    setStatus('checking');
    setErrorMessage(null);
    const startTime = performance.now();

    if (!isSupabaseConfigured) {
      const elapsed = Math.round(performance.now() - startTime);
      setStatus('unconfigured');
      setLatencyMs(elapsed);
      setLastChecked(new Date());

      if (!hasNotifiedOnLoadRef.current || isManualTrigger) {
        hasNotifiedOnLoadRef.current = true;
        toast({
          title: 'Offline Preview Mode',
          description: 'Supabase credentials are not set. The app is running smoothly using built-in local catalog data.',
        });
      }
      return;
    }

    try {
      // Perform lightweight ping with 4-second timeout
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 4000ms')), 4000)
      );

      const fetchPromise = supabase
        .from('services')
        .select('id')
        .limit(1);

      await Promise.race([fetchPromise, timeoutPromise]);
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setLastChecked(new Date());

      if (elapsed > 2000) {
        setStatus('slow');
        if (!hasNotifiedOnLoadRef.current || isManualTrigger) {
          hasNotifiedOnLoadRef.current = true;
          toast({
            title: 'High Network Latency',
            description: `Database response took ${elapsed}ms. Offline caching is active to keep navigation fast.`,
          });
        }
      } else {
        setStatus('healthy');
        if (isManualTrigger) {
          toast({
            title: 'System Healthy',
            description: `Supabase API response verified in ${elapsed}ms.`,
          });
        }
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setStatus('offline');
      setLastChecked(new Date());
      setErrorMessage(err?.message || 'Database service unreachable');

      if (!hasNotifiedOnLoadRef.current || isManualTrigger) {
        hasNotifiedOnLoadRef.current = true;
        toast({
          title: 'Database Sync Notice',
          description: 'Supabase is currently unreachable. Local storage and fallback salon data are active.',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    // Initial health check on page load
    const timer = setTimeout(() => {
      runHealthCheck(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [runHealthCheck]);

  // Status configuration details
  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return {
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          label: 'Healthy',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'slow':
        return {
          dotColor: 'bg-amber-500 animate-pulse',
          textColor: 'text-amber-700 dark:text-amber-300',
          label: 'Slow Connection',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'offline':
        return {
          dotColor: 'bg-rose-500',
          textColor: 'text-rose-700 dark:text-rose-300',
          label: 'Offline / Degraded',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'unconfigured':
        return {
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-700 dark:text-blue-300',
          label: 'Mock / Local Mode',
          icon: <Activity className="w-3.5 h-3.5 text-blue-600" />,
        };
      default:
        return {
          dotColor: 'bg-slate-400 animate-pulse',
          textColor: 'text-slate-600',
          label: 'Checking API...',
          icon: <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />,
        };
    }
  };

  const currentBadge = getStatusBadge();

  return (
    <div className="fixed bottom-3 left-3 z-40 print:hidden font-sans">
      {/* Floating Mini Pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Click to view API Health & Diagnostics"
          aria-label="System status indicator"
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${currentBadge.dotColor}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentBadge.dotColor}`} />
          </span>
          <span className="hidden sm:inline-block">{currentBadge.label}</span>
          {latencyMs !== null && (
            <span className="text-[10px] text-slate-400">({latencyMs}ms)</span>
          )}
        </button>
      ) : (
        /* Expanded Diagnostics Card */
        <div className="w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              {currentBadge.icon}
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Supabase Health Status
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close status card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">API Status</span>
              <span className={`font-semibold ${currentBadge.textColor}`}>{currentBadge.label}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Response Latency</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                {latencyMs !== null ? `${latencyMs} ms` : 'Measuring...'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Last Checked</span>
              <span className="text-slate-600 dark:text-slate-400">
                {lastChecked ? lastChecked.toLocaleTimeString() : 'Pending'}
              </span>
            </div>

            {errorMessage && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => runHealthCheck(true)}
              disabled={status === 'checking'}
              className="w-full text-xs h-7 gap-1.5 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700"
            >
              <RefreshCw className={`w-3 h-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
              {status === 'checking' ? 'Testing Ping...' : 'Re-test Connection'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
