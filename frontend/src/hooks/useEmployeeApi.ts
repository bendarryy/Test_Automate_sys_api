import { useApi } from './useApi';

export const useEmployeeApi = () => {
  const api = useApi();

  // Get employee by ID
  const getEmployee = (id: string | number) =>
    api.callApi('get', `/core/5/employees/${id}/`);

  // Update employee by ID
  const updateEmployee = (id: string | number, data: any) =>
    api.callApi('put', `/core/5/employees/${id}/`, data);

  // Delete employee by ID
  const deleteEmployee = (id: string | number) =>
    api.callApi('delete', `/core/5/employees/${id}/`);

  return {
    ...api,
    getEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
