import { useApi } from './useApi';

interface EmployeeData {
  id: string | number;
  name: string;
  position: string;
  department: string;
}

export const useEmployeeApi = () => {
  const api = useApi();

  // Get employee by ID
  const getEmployee = (id: string | number) =>
    api.callApi('get', `/core/systems/5/employees/${id}/`);

  // Update employee by ID
  const updateEmployee = (id: string | number, data: EmployeeData) =>
    api.callApi('put', `/core/systems/5/employees/${id}/`, data);

  // Delete employee by ID
  const deleteEmployee = (id: string | number) =>
    api.callApi('delete', `/core/systems/5/employees/${id}/`);

  return {
    ...api,
    getEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
