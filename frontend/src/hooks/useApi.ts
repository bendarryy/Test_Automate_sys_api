// useApi.ts
import { useState } from 'react';
import apiClient from '../apiClient'
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T,>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const navigate = useNavigate();

  const callApi = async <T = unknown>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, payload?: T) => {
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
    } catch (err: unknown) {
      // Check for 403 and specific error detail
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
    }
  };

  return { ...state, callApi };
};
