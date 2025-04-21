// useApi.ts
import { useState } from 'react';
import apiClient from '../apiClient'

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T = any>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const callApi = async (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, payload?: any) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiClient[method](url, {
        ...payload,
        headers: {
          'X-CSRFToken': "gpPejT7onkPSewykjLJNNl4YLhPyTy7b",
        },
      });
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message });
      throw err;
    }
  };

  return { ...state, callApi };
};
