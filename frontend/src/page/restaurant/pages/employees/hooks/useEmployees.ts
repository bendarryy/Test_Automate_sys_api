import { useApi } from '../../../../../shared/hooks/useApi';
import { useEmployeeApi } from '../../../../../shared/hooks/useEmployeeApi';
import { useSelectedSystemId } from '../../../../../shared/hooks/useSelectedSystemId';
import { Employee, EmployeeFormData } from '../types/employee';

export const useEmployees = () => {
  const { data, loading, callApi } = useApi<Employee[] | undefined>();
  const employeeApi = useEmployeeApi();
  const [systemId] = useSelectedSystemId();

  const fetchEmployees = () => callApi('get', `/core/systems/${systemId}/employees/`);
  const inviteEmployee = (values: EmployeeFormData) =>
    callApi('post', `/core/systems/${systemId}/employees/invite/`, values);

  return {
    data,
    loading,
    fetchEmployees,
    inviteEmployee,
    employeeApi,
  };
};
