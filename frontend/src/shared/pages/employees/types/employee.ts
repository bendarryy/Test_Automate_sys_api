export interface Employee {
  id: string | number;
  name: string;
  position?: string | undefined;
  department?: string | undefined;
  role: string;
  phone: string;
  email: string;
}

export interface EmployeeFormData extends Omit<Employee, 'id'> {
  password?: string;
}
