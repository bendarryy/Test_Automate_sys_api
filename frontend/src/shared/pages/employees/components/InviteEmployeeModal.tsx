import React from 'react';
import { Modal, Form, Input, Select, Space, Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { SystemCategory, getRoleConfig } from '../utils/roleOptions'; // Import SystemCategory and getRoleConfig
import { EmployeeFormData } from '../types/employee';

interface InviteEmployeeModalProps {
  open: boolean;
  loading: boolean;
  form: import('antd').FormInstance<EmployeeFormData>;
  category: SystemCategory; // Add category prop
  onCancel: () => void;
  onFinish: (values: EmployeeFormData) => void;
}

const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({
  open, loading, form, category, onCancel, onFinish
}) => {
  const { options: roleOptionsToDisplay } = getRoleConfig(category); // Get role options based on category, renamed to avoid conflict

  return (
  <Modal
    title="Invite New Employee"
    open={open}
    onCancel={onCancel}
    footer={null}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
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
          {roleOptionsToDisplay.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserAddOutlined />}
          >
            {loading ? 'Inviting...' : 'Invite Employee'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
)};

export default InviteEmployeeModal;
