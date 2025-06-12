// React Query hooks for fetching and updating a system
import React from 'react';
import { useApi } from 'shared/hooks/useApi';
import { UpdateSystemRequest, UpdateSystemResponse } from '../types';

export const useGetSystem = (id: string) => {
  const { data, loading, error, callApi } = useApi<UpdateSystemResponse>();
  React.useEffect(() => {
    if (id) callApi('get', `/core/systems/${id}/`);
  }, [id]);
  return { data, loading, error };
};

export const useUpdateSystem = (id: string) => {
  const { loading, error, callApi } = useApi<UpdateSystemResponse>();
  const update = async (payload: UpdateSystemRequest) => {
    return callApi('patch', `/core/systems/${id}/`, payload);
  };
  return { update, loading, error };
};
