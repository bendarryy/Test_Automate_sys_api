import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { useApi } from '../hooks/useApi';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ChangePassword: React.FC = () => {
  const { callApi } = useApi();
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  const handlePasswordChange = async (values: { old_password: string; new_password: string }) => {
    try {
      setLoading(true);
      await callApi('post', '/core/change-password/', values);
      message.success('Password changed successfully');
      passwordForm.resetFields();
      navigate('/settings');
    } catch {
      message.error('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Change Password</Title>
      
      <Card>
        <Form
          layout="vertical"
          form={passwordForm}
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="old_password"
            label="Current Password"
            rules={[
              { required: true, message: 'Please enter your current password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your current password"
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your new password"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your new password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword; 