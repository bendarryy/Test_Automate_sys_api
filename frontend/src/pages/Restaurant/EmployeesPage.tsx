import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useEmployeeApi } from '../../hooks/useEmployeeApi';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Card,
  message,
  Popconfirm,
  Tag,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface EmployeeFormData extends Omit<Employee, 'id'> {
  password?: string;
}

const roleColors: Record<string, string> = {
  waiter: 'blue',
  delivery: 'green',
  chef: 'orange',
  'head chef': 'red',
  cashier: 'purple',
  manager: 'cyan',
  inventory_manager: 'geekblue'
};

const roleOptions = [
  { value: 'waiter', label: 'Waiter' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'chef', label: 'Chef' },
  { value: 'head chef', label: 'Head Chef' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'manager', label: 'Manager' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
];

const EmployeesPage: React.FC = () => {
  const { data, loading, callApi } = useApi<Employee[]>();
  const employeeApi = useEmployeeApi();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewForm] = Form.useForm<Employee>();
  const [inviteForm] = Form.useForm<EmployeeFormData>();
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = () => callApi('get', '/core/5/employees/');
  useEffect(() => { fetchEmployees(); /* eslint-disable-next-line */ }, []);

  // Open modal and fetch details
  const handleView = async (emp: Employee) => {
    setShowViewModal(true);
    setModalMode('view');
    setModalLoading(true);
    try {
      const details = await employeeApi.getEmployee(emp.id);
      setSelectedEmployee(details);
      viewForm.setFieldsValue(details);
    } catch (error) {
      message.error('Error loading employee details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = () => {
    setModalMode('edit');
  };

  const handleSave = async () => {
    try {
      const values = await viewForm.validateFields();
      if (!selectedEmployee) return;
      
      setModalLoading(true);
      const updated = await employeeApi.updateEmployee(selectedEmployee.id, values);
      setSelectedEmployee(updated);
      setModalMode('view');
      fetchEmployees();
      message.success('Employee updated successfully');
    } catch (error) {
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
      fetchEmployees();
      message.success('Employee deleted successfully');
    } catch (error) {
      message.error('Error deleting employee');
    }
  };

  const handleInvite = async (values: EmployeeFormData) => {
    try {
      setModalLoading(true);
      await callApi('post', '/core/5/invite/', values);
      message.success('Employee invited successfully!');
      inviteForm.resetFields();
      setShowInviteModal(false);
      fetchEmployees();
    } catch (error) {
      message.error('Failed to invite employee. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>
          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: Employee) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>Employees</Title>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setShowInviteModal(true)}
            >
              Add Employee
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      {/* View/Edit Modal */}
      <Modal
        title={modalMode === 'view' ? 'Employee Details' : 'Edit Employee'}
        open={showViewModal}
        onCancel={() => setShowViewModal(false)}
        footer={null}
        width={600}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
        ) : (
          <Form
            form={viewForm}
            layout="vertical"
            disabled={modalMode === 'view'}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select>
                {roleOptions.map(role => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter the phone number' },
                { pattern: /^[0-9]{11}$/, message: 'Please enter a valid 11-digit phone number' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter the email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                {modalMode === 'view' ? (
                  <>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEdit}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Are you sure you want to delete this employee?"
                      onConfirm={handleDelete}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </>
                ) : (
                  <>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => setModalMode('view')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={modalLoading}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Invite Modal */}
      <Modal
        title="Invite New Employee"
        open={showInviteModal}
        onCancel={() => {
          setShowInviteModal(false);
          inviteForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInvite}
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter the full name' }]}
          >
            <Input placeholder="e.g. Mohamed Ali" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select Role">
              {roleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter the phone number' },
              { pattern: /^[0-9]{11}$/, message: 'Please enter a valid 11-digit phone number' }
            ]}
          >
            <Input placeholder="e.g. 01012345678" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter the email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="e.g. mohamed@restaurant.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters long' }
            ]}
          >
            <Input.Password placeholder="Choose a strong password" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowInviteModal(false);
                  inviteForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalLoading}
                icon={<UserAddOutlined />}
              >
                {modalLoading ? 'Inviting...' : 'Invite Employee'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
