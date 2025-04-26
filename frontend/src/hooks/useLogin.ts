// useLogin.ts
import { useApi } from './useApi';
import Cookies from 'js-cookie';

interface LoginPayload {
  username: string;
  password: string;
}

export const useLogin = () => {
  const { callApi, data, loading, error } = useApi();

  const login = async (payload: LoginPayload) => {
    const response = await callApi('post', '/core/login/', payload);
    if (response && response.token) {
      // Store the token in a cookie that expires in 7 days
      Cookies.set('auth_token', response.token, { expires: 7 });
    }
    return response;
  };



  const isAuthenticated = () => {
    return !!Cookies.get('csrftoken');
  };

  return { login,  isAuthenticated, data, loading, error };
};
