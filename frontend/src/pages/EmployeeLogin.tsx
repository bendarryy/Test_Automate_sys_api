// src/pages/EmployeeLogin.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { useApi } from '../hooks/useApi';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface System {
    id: number;
    category: string;
    name: string;
    is_active: boolean;
    subdomain: string;
    custom_domain: string | null;
}

interface Profile {
    systems: System;
}

const EmployeeLogin: React.FC = () => {
  const { loading, error, callApi } = useApi();
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await callApi('post', '/core/employee/login/', { 
        email: values.email, 
        password: values.password 
      });
      
      // Get and store profile data
      const profileData = await callApi<Profile>('get', '/core/profile/');
      console.log('Profile Data:', profileData); // Debug log

      if (profileData?.systems) {
        console.log('Selected System:', profileData.systems); // Debug log
        
        localStorage.setItem('selectedSystemId', profileData.systems.id.toString());
        localStorage.setItem('selectedSystemCategory', profileData.systems.category);
        
        // Dispatch the system category change event
        window.dispatchEvent(new CustomEvent('systemCategoryChanged'));
      } else {
        console.error('No system found in profile data:', profileData);
        throw new Error('No system found in profile data');
      }

      setSuccess(true);
      navigate('/');
    } catch (err: any) {
      setSuccess(false);
      // Clear password field on error
      form.setFieldsValue({ password: '' });
      
      // Handle both 400 and 401 status codes
      const errorMessage = err?.response?.data?.error || err?.message || 'Invalid email or password.';
      
      // Focus on password field if it's a password error
      if (errorMessage.includes('password')) {
        form.getFieldInstance('password')?.focus();
      }
    } finally {
        navigate('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card className="login-card shadow employee-card" style={{ width: 400 }}>
        <Title level={2} className="text-center mb-4 logo-text" style={{ textAlign: 'center', marginBottom: 24 }}>
          Employee Portal
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          noValidate
        >
          {success && (
            <Form.Item>
              <Alert message="Login successful! Welcome." type="success" showIcon style={{ marginBottom: 16 }} />
            </Form.Item>
          )}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input data-testid="email-input" type="email" placeholder="Enter company email" disabled={loading} autoFocus />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
            ]}
          >
            <Input.Password data-testid="password-input" placeholder="Enter password" disabled={loading} />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert
                message="Invalid Email or Password"
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button data-testid="login-button" type="primary" htmlType="submit" className="w-100 custom-btn" loading={loading} disabled={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="link"
          style={{ marginTop: 16, width: '100%' }}
          onClick={() => navigate('/ownerLogin')}
        >
          Switch to Owner Login
        </Button>
      </Card>
    </div>
  );
};

export default EmployeeLogin;