import { useApi } from '../../../hooks/useApi';
import { useEmployeeApi } from '../../../hooks/useEmployeeApi';
import { useSelectedSystemId } from '../../../hooks/useSelectedSystemId';
import { Employee, EmployeeFormData } from '../types/employee';
// import { SystemCategory } from '../utils/roleOptions'; // Import SystemCategory

export const useEmployees = (
  // category: SystemCategory, // Add category parameter
) => { // Add category parameter
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
