// useRegister.ts
import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';

interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface RegisterResponse {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export const useRegister = () => {
  const { callApi, data, loading, error } = useApi<RegisterResponse>();

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      return await callApi('post', '/core/register/', payload);
    } catch (err) {
      console.error('Error during registration:', err);
      throw err;
    }
  }, [callApi]);

  return useMemo(() => ({
    register,
    data,
    loading,
    error
  }), [register, data, loading, error]);
};
