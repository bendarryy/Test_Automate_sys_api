import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';

interface EmployeeData {
  id?: string | number;
  name?: string;
  position?: string;
  department?: string;
  role?: string;
  phone?: string;
  email?: string;
}

export const useEmployeeApi = () => {
  const { callApi, data, loading, error, clearCache } = useApi<EmployeeData[]>();
  const systemId = localStorage.getItem("selectedSystemId");

  const getEmployee = useCallback(async (id: string | number) => {
    return await callApi<EmployeeData>('get', `/core/systems/${systemId}/employees/${id}/`);
  }, [systemId, callApi]);

  const updateEmployee = useCallback(async (id: string | number, data: EmployeeData) => {
    const result = await callApi<EmployeeData>('put', `/core/systems/${systemId}/employees/${id}/`, data);
    clearCache(`/core/systems/${systemId}/employees/${id}/`);
    clearCache(`/core/systems/${systemId}/employees/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const deleteEmployee = useCallback(async (id: string | number) => {
    const result = await callApi('delete', `/core/systems/${systemId}/employees/${id}/`);
    clearCache(`/core/systems/${systemId}/employees/${id}/`);
    clearCache(`/core/systems/${systemId}/employees/`);
    return result;
  }, [systemId, callApi, clearCache]);

  return useMemo(() => ({
    data,
    loading,
    error,
    getEmployee,
    updateEmployee,
    deleteEmployee
  }), [
    data,
    loading,
    error,
    getEmployee,
    updateEmployee,
    deleteEmployee
  ]);
};
