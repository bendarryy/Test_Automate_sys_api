import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { Card, Space, Typography, message, Form } from 'antd'; // Ensure Typography is imported
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import InviteEmployeeModal from './components/InviteEmployeeModal';
import { useEmployees } from './hooks/useEmployees';
import { Employee, EmployeeFormData } from './types/employee';
import { SystemCategory } from './utils/roleOptions'; // Import SystemCategory

const { Title } = Typography; // Ensure Title is extracted

interface EmployeesPageProps {
  category: SystemCategory; // Add category prop
}

const EmployeesPage: React.FC<EmployeesPageProps> = ({ category }) => {
  const { data, loading, fetchEmployees, inviteEmployee, employeeApi } = useEmployees(
    // category
  ); // Pass category to useEmployees if needed
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewForm] = Form.useForm<Employee>();
  const [inviteForm] = Form.useForm<EmployeeFormData>();
  const [modalLoading, setModalLoading] = useState(false);
  const [optimisticEmployees, setOptimisticEmployees] = useState<Employee[]>([]);

  useEffect(() => { fetchEmployees(); /* eslint-disable-next-line */ }, [fetchEmployees]); // Added fetchEmployees to dependency array

  const handleEdit = () => setModalMode('edit');

  const handleSave = async () => {
    try {
      const values = await viewForm.validateFields();
      if (!selectedEmployee) return;

      setModalLoading(true);
      const safeValues = {
        ...values,
        position: values.position ?? '',
        role: values.role ?? '',
        phone: values.phone ?? '',
        email: values.email ?? '',
      };
      const updated = await employeeApi.updateEmployee(selectedEmployee.id, safeValues);
      if (!updated) {
        message.error('Error updating employee');
        return;
      }
      setSelectedEmployee({
        ...selectedEmployee,
        ...updated,
        position: updated.position ?? '',
        role: updated.role ?? selectedEmployee.role,
        phone: updated.phone ?? selectedEmployee.phone,
        email: updated.email ?? selectedEmployee.email,
      });
      setModalMode('view');
      setShowViewModal(false); 
      fetchEmployees();
      message.success('Employee updated successfully');
    } catch {
      message.error('Error updating employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await employeeApi.deleteEmployee(selectedEmployee.id);
      setShowViewModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
      message.success('Employee deleted successfully');
    } catch {
      message.error('Error deleting employee');
    }
  };

  const handleInvite = async (values: EmployeeFormData) => {
    // Create a temporary optimistic employee (id: 'temp', etc.)
    const optimisticEmployee: Employee = {
      id: Date.now(), // temp id
      name: values.name,
      role: values.role,
      phone: values.phone,
      email: values.email,
      // add other fields as needed
    };
    setOptimisticEmployees([optimisticEmployee]);
    try {
      setModalLoading(true);
      await inviteEmployee(values);
      message.success('Employee invited successfully!');
      inviteForm.resetFields();
      setShowInviteModal(false);
      fetchEmployees(); // will reset optimistic list
    } catch (err) {
      setOptimisticEmployees([]); // Remove the optimistic employee
      message.error('Failed to invite employee. Please try again.');
      console.error('Invite error:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleTableEdit = (record: Employee) => {
    setShowViewModal(true);
    setModalMode('edit');
    setModalLoading(true);
    employeeApi.getEmployee(record.id).then(details => {
      if (details) {
        setSelectedEmployee({
          ...record,
          ...details,
          position: details.position ?? '',
          role: details.role ?? record.role,
          phone: details.phone ?? record.phone,
          email: details.email ?? record.email,
        });
        viewForm.setFieldsValue({
          ...record,
          ...details,
          position: details.position ?? '',
          role: details.role ?? record.role,
          phone: details.phone ?? record.phone,
          email: details.email ?? record.email,
        });
      }
    }).catch(() => {
      message.error('Error loading employee details');
    }).finally(() => {
      setModalLoading(false);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <Header
        title="Employee Management"
        breadcrumbs={[
          { title: category === 'restaurant' ? 'Restaurant' : 'Supermarket', path: `/${category}` },
          { title: 'Employees' }
        ]}
        actions={
          <button
            type="button"
            className="ant-btn ant-btn-primary"
            onClick={() => {
              setShowInviteModal(true);
              inviteForm.resetFields();
            }}
          >
            Invite Employee
          </button>
        }
      />
      <Card style={{ marginBottom: 20, marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Staff Directory</Title>
          </div>
          <EmployeeTable
            data={optimisticEmployees.length > 0 ? [...optimisticEmployees, ...(data ?? [])] : data ?? undefined}
            loading={loading}
            category={category}
            onEdit={handleTableEdit}
          />
        </Space>
      </Card>
      <EmployeeModal
        open={showViewModal}
        loading={modalLoading}
        mode={modalMode}
        form={viewForm}
        category={category} // Pass category to EmployeeModal
        onCancel={() => {
          setShowViewModal(false);
          setSelectedEmployee(null);
          setModalMode('view');
        }}
        onEdit={handleEdit}
        onSave={handleSave}
        onDelete={handleDelete}
        setMode={setModalMode}
      />
      <InviteEmployeeModal
        open={showInviteModal}
        loading={modalLoading}
        form={inviteForm}
        category={category} // Pass category to InviteEmployeeModal
        onCancel={() => {
          setShowInviteModal(false);
          inviteForm.resetFields();
        }}
        onFinish={handleInvite}
      />
    </div>
  );
};

export default EmployeesPage;
