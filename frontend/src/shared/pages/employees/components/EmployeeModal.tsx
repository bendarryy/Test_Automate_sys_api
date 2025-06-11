import React from 'react';
import { Modal, Form, Input, Select, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Employee } from '../types/employee';
import { SystemCategory, getRoleConfig } from '../utils/roleOptions'; // Import SystemCategory and getRoleConfig
import LoadingSpinner from '../../../../components/Loading';

interface EmployeeModalProps {
  open: boolean;
  loading: boolean;
  mode: 'view' | 'edit';
  form: import('antd').FormInstance<Employee>;
  category: SystemCategory; // Add category prop
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  setMode: (mode: 'view' | 'edit') => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open, loading, mode, form, category, onCancel, onEdit, onSave, onDelete, setMode
}) => {
  const { options: roleOptionsToDisplay } = getRoleConfig(category); // Get role options based on category, renamed to avoid conflict

  return (
  <Modal
    title={mode === 'view' ? 'Employee Details' : 'Edit Employee'}
    open={open}
    onCancel={onCancel}
    footer={null}
    width={600}
  >
    {loading ? (
      <LoadingSpinner />
    ) : (
      <Form
        form={form}
        layout="vertical"
        disabled={mode === 'view'}
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
          <Select placeholder="Select Role">
            {roleOptionsToDisplay.map(role => (
              <Select.Option key={role.value} value={role.value}>
                {role.label}
              </Select.Option>
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
            {mode === 'view' ? (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={onEdit}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this employee?"
                  onConfirm={onDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </>
            ) : (
              <>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => setMode('view')}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={onSave}
                  loading={loading}
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
)};

export default EmployeeModal;
