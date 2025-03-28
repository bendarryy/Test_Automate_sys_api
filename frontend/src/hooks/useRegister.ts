// useRegister.ts
import { useApi } from './useApi';

interface RegisterPayload {
  username: string;
  password: string;
}

export const useRegister = () => {
  const { callApi, data, loading, error } = useApi();

  const register = async (payload: RegisterPayload) => {
    return await callApi('post', '/core/register/', payload);
  };

  return { register, data, loading, error };
};
