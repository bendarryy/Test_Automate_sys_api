// useApi.ts
import { useState, useCallback, useRef } from 'react';
import apiClient from '../apiClient'
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>();

export const useApi = <T,>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  const callApi = useCallback(async <R = T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete', 
    url: string, 
    payload?: unknown, 
    isFormData?: boolean
  ): Promise<R | null> => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Check cache for GET requests
    if (method === 'get') {
      const cacheKey = `${method}:${url}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        const cachedValue = cachedData.data as R | null;
        setState({ data: cachedValue as unknown as T, loading: false, error: null });
        return cachedValue;
      }
    }

    setState({ data: null, loading: true, error: null });
    try {
      let response;
      if (isFormData || (payload && typeof FormData !== 'undefined' && payload instanceof FormData)) {
        response = await apiClient[method](url, payload as FormData, {
          headers: {
            'X-CSRFToken': "gpPejT7onkPSewykjLJNNl4YLhPyTy7b",
          },
          signal: abortControllerRef.current.signal,
        });
      } else {
        response = await apiClient[method](url, payload as FormData, {
          headers: {
            'X-CSRFToken': "gpPejT7onkPSewykjLJNNl4YLhPyTy7b",
          },
          signal: abortControllerRef.current.signal,
        });
      }

      // Cache GET responses
      if (method === 'get') {
        const cacheKey = `${method}:${url}`;
        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      }

      setState({ data: response.data as unknown as T, loading: false, error: null });
      return response.data;
    } catch (err: unknown) {
      // Don't set error state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }

      const apiError = err as ApiError;
      if (
        apiError.response &&
        apiError.response.status === 403 &&
        apiError.response.data?.detail === "Authentication credentials were not provided."
      ) {
        navigate('/ownerLogin');
      }
      setState({ 
        data: null, 
        loading: false, 
        error: apiError.message || 'An unknown error occurred'
      });
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  }, [navigate]);

  // Clear cache for specific URL
  const clearCache = useCallback((url: string) => {
    const cacheKey = `get:${url}`;
    cache.delete(cacheKey);
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cache.clear();
  }, []);

  return { ...state, callApi, clearCache, clearAllCache };
};