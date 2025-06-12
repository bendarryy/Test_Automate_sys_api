// React Query hook for creating a system
import { useApi } from 'shared/hooks/useApi';
import { CreateSystemRequest, CreateSystemResponse } from '../types';

export const useCreateSystem = () => {
  const { loading, error, callApi } = useApi<CreateSystemResponse>();
  const create = async (payload: CreateSystemRequest) => {
    return callApi('post', '/core/systems/create/', payload);
  };
  return { create, loading, error };
};
