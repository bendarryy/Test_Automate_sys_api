// useApi.ts
import { useState } from 'react';
import apiClient from '../apiClient'
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
      // Check for 403 and specific error detail
      if (
        err.response &&
        err.response.status === 403 &&
        err.response.data &&
        err.response.data.detail === "Authentication credentials were not provided."
      ) {
        navigate('/ownerLogin');
      }
      setState({ data: null, loading: false, error: err.message });
      throw err;
    }
  };

  return { ...state, callApi };
};
