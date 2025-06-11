// useApi.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import apiClient from '../../config/apiClient.config';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../types';

// إعدادات headers الافتراضية
const DEFAULT_HEADERS = {
  'X-CSRFToken': 'gpPejT7onkPSewykjLJNNl4YLhPyTy7b',
};



interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// استخدم useRef للكاش داخل hook (أفضل للـ SSR/اختبار)
const globalCache = new Map<string, CacheEntry<unknown>>();

export const useApi = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(globalCache); // لكل instance نفس الكاش
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track the method of the ongoing request
  const ongoingRequestMethodRef = useRef<string | null>(null);
  const navigate = useNavigate();

  // إلغاء الطلب عند unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // دالة موحدة لتحديث الحالة
  const updateState = useCallback((opts: Partial<{data: T | null; loading: boolean; error: string | null;}>) => {
    if ('data' in opts) setData(opts.data!);
    if ('loading' in opts) setLoading(opts.loading!);
    if ('error' in opts) setError(opts.error!);
  }, []);

  // callApi: يدعم إبقاء البيانات القديمة أثناء التحميل
  const callApi = useCallback(async <R = T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    payload?: unknown,
    isFormData?: boolean
  ): Promise<R | null> => {
    // Only abort previous request if it's not a mutation (POST/PUT/PATCH/DELETE) being followed by a GET
    const prevController = abortControllerRef.current;
    const prevMethod = ongoingRequestMethodRef.current;
    // If previous is mutation and current is GET, do NOT abort
    if (
      prevController &&
      prevMethod &&
      ['post', 'put', 'patch', 'delete'].includes(prevMethod) &&
      method === 'get'
    ) {
      // Do not abort
    } else if (prevController) {
      prevController.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    ongoingRequestMethodRef.current = method;

    // الكاش فقط للـ GET
    if (method === 'get') {
      const cacheKey = `${method}:${url}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        updateState({ data: cached.data as T, loading: false, error: null });
        return cached.data as R;
      }
      // إبقاء البيانات القديمة أثناء التحميل
      updateState({ loading: true, error: null });
    } else {
      // لغير GET
      updateState({ loading: true, error: null });
    }

    try {
      let response;
      const config = {
        headers: { ...DEFAULT_HEADERS },
        signal: controller.signal,
      };
      if (isFormData || (payload && typeof FormData !== 'undefined' && payload instanceof FormData)) {
        response = await apiClient[method](url, payload as FormData, config);
      } else {
        response = await apiClient[method](url, payload as unknown as FormData, config);
      }
      // كاش للـ GET
      if (method === 'get') {
        const cacheKey = `${method}:${url}`;
        cacheRef.current.set(cacheKey, { data: response.data, timestamp: Date.now() });
      }
      updateState({ data: response.data as T, loading: false, error: null });
      return response.data;
    } catch (err: unknown) {
      // لا تعرض خطأ إذا كان الطلب ملغي
      if (err instanceof Error && err.name === 'AbortError') {
        updateState({ loading: false });
        return null;
      }
      const apiError = err as ApiError;
      if (
        apiError.response &&
        apiError.response.status === 403 &&
        apiError.response.data?.detail === 'Authentication credentials were not provided.'
      ) {
        navigate('/ownerLogin');
      }
      const errorMessage = apiError.response?.data?.detail || apiError.message || 'An unknown error occurred';
      // أبقِ البيانات القديمة عند الخطأ
      updateState({ loading: false, error: errorMessage });
      throw err;
    } finally {
      // Only clear if this call still owns the controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        ongoingRequestMethodRef.current = null;
      }
    }
  }, [navigate, updateState]);

  // Clear cache for specific URL
  const clearCache = useCallback((url: string) => {
    const cacheKey = `get:${url}`;
    cacheRef.current.delete(cacheKey);
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Add this function to force clear all cache on navigation
  const clearAllCacheOnNavigation = () => {
    cacheRef.current.clear();
  };

  return { data, loading, error, callApi, clearCache, clearAllCache, clearAllCacheOnNavigation };
};