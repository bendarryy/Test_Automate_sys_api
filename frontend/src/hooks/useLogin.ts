// useLogin.ts
import { useApi } from './useApi';

interface LoginPayload {
  username: string;
  password: string;
}

export const useLogin = () => {
  const { callApi, data, loading, error } = useApi();

  const login = async (payload: LoginPayload) => {
    return await callApi('post', '/core/login/', payload);
  };

  return { login, data, loading, error };
};
