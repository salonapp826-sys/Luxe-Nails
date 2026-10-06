import { useState, useEffect, useCallback, useRef } from 'react';
import { safeFetch, SafeFetchOptions, SafeApiResponse } from '@/lib/apiClient';

export interface UseApiOptions<T> extends SafeFetchOptions {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T | null;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number;
  isEmpty: boolean;
  refetch: () => Promise<SafeApiResponse<T>>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * React Hook for resilient API data fetching with built-in loading,
 * error handling, empty state detection, and automatic null-safety.
 */
export function useApi<T = any>(
  url: string | null,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    immediate = true,
    initialData = null,
    onSuccess,
    onError,
    ...fetchOptions
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(Boolean(url && immediate));
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number>(0);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const executeFetch = useCallback(async (): Promise<SafeApiResponse<T>> => {
    if (!url) {
      return {
        data: null,
        error: null,
        status: 0,
        ok: true,
      };
    }

    setLoading(true);
    setError(null);

    const currentOpts = optionsRef.current;
    const result = await safeFetch<T>(url, currentOpts);

    if (isMountedRef.current) {
      setStatus(result.status);
      setLoading(false);

      if (result.ok && result.data !== null) {
        setData(result.data);
        setError(null);
        if (currentOpts.onSuccess) currentOpts.onSuccess(result.data);
      } else {
        const errMessage = result.error || 'Unable to load data';
        setError(errMessage);
        if (result.data !== null && result.data !== undefined) {
          setData(result.data);
        }
        if (currentOpts.onError) currentOpts.onError(errMessage);
      }
    }

    return result;
  }, [url]);

  useEffect(() => {
    if (immediate && url) {
      executeFetch();
    }
  }, [immediate, url, executeFetch]);

  const isEmpty =
    !loading &&
    !error &&
    (data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0));

  return {
    data,
    loading,
    error,
    status,
    isEmpty,
    refetch: executeFetch,
    setData,
  };
}
