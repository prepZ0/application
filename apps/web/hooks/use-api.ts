"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { apiCache } from "@/lib/api-cache";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  refetch: () => Promise<T | null>;
  reset: () => void;
}

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  /** When set, responses are cached under this key. */
  cacheKey?: string;
  /** Cache time-to-live in seconds (default: 60). */
  cacheTTL?: number;
}

type ApiMethod = (...args: any[]) => Promise<any>;

export function useApi<T>(
  apiMethod: ApiMethod,
  options?: UseApiOptions<T>
): UseApiReturn<T> {
  const cacheKey = options?.cacheKey;
  const cacheTTL = options?.cacheTTL ?? 60;

  const [state, setState] = useState<UseApiState<T>>(() => {
    // Seed from cache if available
    if (cacheKey) {
      const cached = apiCache.get<T>(cacheKey, cacheTTL);
      if (cached !== undefined) {
        return { data: cached, error: null, loading: false };
      }
    }
    return { data: null, error: null, loading: false };
  });

  // Subscribe to cache invalidations so the hook re-fetches reactively
  const executeRef = useRef<(...args: any[]) => Promise<T | null>>(null!);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const fetcher = () => apiMethod(...args);
        const response = cacheKey
          ? await apiCache.dedupe(cacheKey, fetcher)
          : await fetcher();

        if (!response.success) {
          const errorMessage = response.error?.message || "An error occurred";
          setState({ data: null, error: errorMessage, loading: false });
          options?.onError?.(errorMessage);
          return null;
        }

        if (cacheKey) {
          apiCache.set(cacheKey, response.data);
        }

        setState({ data: response.data, error: null, loading: false });
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setState({ data: null, error: errorMessage, loading: false });
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [apiMethod, cacheKey, cacheTTL, options]
  );

  executeRef.current = execute;

  // Listen for cache invalidations and re-fetch
  useEffect(() => {
    if (!cacheKey) return;
    return apiCache.subscribe(cacheKey, () => {
      // Cache was invalidated — re-fetch
      executeRef.current();
    });
  }, [cacheKey]);

  const refetch = useCallback(
    () => execute(),
    [execute]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, refetch, reset };
}

// Pre-configured hooks for common API calls (with cache keys)
const DEFAULT_TTL = 60; // 1 minute

export function useTests() {
  return useApi<any[]>(api.tests.list, {
    cacheKey: "/api/tests",
    cacheTTL: DEFAULT_TTL,
  });
}

export function useTest(id: string) {
  return useApi<any>(() => api.tests.get(id), {
    cacheKey: `/api/tests/${id}`,
    cacheTTL: DEFAULT_TTL,
  });
}

export function useDrives() {
  return useApi<any[]>(api.drives.list, {
    cacheKey: "/api/drives",
    cacheTTL: DEFAULT_TTL,
  });
}

export function useDrive(id: string) {
  return useApi<any>(() => api.drives.get(id), {
    cacheKey: `/api/drives/${id}`,
    cacheTTL: DEFAULT_TTL,
  });
}

export function useQuestions() {
  return useApi<any[]>(api.questions.list, {
    cacheKey: "/api/questions",
    cacheTTL: DEFAULT_TTL,
  });
}

export function useQuestion(id: string) {
  return useApi<any>(() => api.questions.get(id), {
    cacheKey: `/api/questions/${id}`,
    cacheTTL: DEFAULT_TTL,
  });
}

export function useColleges() {
  return useApi<any[]>(api.colleges.list, {
    cacheKey: "/api/colleges",
    cacheTTL: DEFAULT_TTL,
  });
}

export function useCollege(id: string) {
  return useApi<any>(() => api.colleges.get(id), {
    cacheKey: `/api/colleges/${id}`,
    cacheTTL: DEFAULT_TTL,
  });
}
