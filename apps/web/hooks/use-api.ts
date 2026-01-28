"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api-client";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

type ApiMethod = (...args: any[]) => Promise<any>;

export function useApi<T>(
  apiMethod: ApiMethod,
  options?: { onSuccess?: (data: T) => void; onError?: (error: string) => void }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiMethod(...args);

        if (!response.success) {
          const errorMessage = response.error?.message || "An error occurred";
          setState({ data: null, error: errorMessage, loading: false });
          options?.onError?.(errorMessage);
          return null;
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
    [apiMethod, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, reset };
}

// Pre-configured hooks for common API calls
export function useTests() {
  return useApi<any[]>(api.tests.list);
}

export function useTest(id: string) {
  return useApi<any>(() => api.tests.get(id));
}

export function useDrives() {
  return useApi<any[]>(api.drives.list);
}

export function useDrive(id: string) {
  return useApi<any>(() => api.drives.get(id));
}

export function useQuestions() {
  return useApi<any[]>(api.questions.list);
}

export function useQuestion(id: string) {
  return useApi<any>(() => api.questions.get(id));
}

export function useColleges() {
  return useApi<any[]>(api.colleges.list);
}

export function useCollege(id: string) {
  return useApi<any>(() => api.colleges.get(id));
}
