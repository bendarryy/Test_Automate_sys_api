// filepath: d:\1 learn\project s - Copy\Automated_Sys_tmp\frontend\src\page\auth\pages\OwnerLogin.tsx
import React from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useLogin } from '../hooks/useLogin'; // Assuming this path is correct
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../shared/AuthLayout'; // Uses the new AuthLayout
import { MailOutlined, LockOutlined } from '@ant-design/icons'; // For input icons

const { Title } = Typography;

const OwnerLogin: React.FC = () => {
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login({ username: values.username, password: values.password });
      localStorage.setItem('loginViaOwner', 'true');
      navigate('/', { replace: true });
    } catch (err) {
      // error is handled by useLogin hook and displayed via Alert
      console.error("Login failed:", err);
    }
  };

  return (
    // Pass the error prop to AuthLayout if you want conditional styling on the card
    <AuthLayout error={!!error}> 
      <Title level={2} /* This will be styled by CosmicLogin.css */> 
        Owner Portal
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        noValidate
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username" // Changed from email to username as per your original OwnerLogin
          rules={[
            { required: true, message: 'Username is required' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input 
            prefix={<MailOutlined />} // Added icon as per spec
            placeholder="Enter username" 
            disabled={loading} 
            autoFocus 
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} // Added icon
            placeholder="Password" 
            disabled={loading} 
          />
        </Form.Item>

        {/* "Remember me" and "Forgot password?" would be Form.Items here if needed */}
        {/* Example:
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <a href="/forgot-password" style={{ float: 'right', color: 'var(--accent-cyan-400)' }}>
            Forgot password?
        </a>
        */}
        
        {error && (
          <Form.Item style={{ marginBottom: 16 }}>
            <Alert message={error} type="error" showIcon />
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 24 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            disabled={loading}
            block // Make button full width
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
      <Button
        type="link"
        style={{ width: '100%', marginTop: 16 }}
        onClick={() => navigate('/employeelogin')}
      >
        Switch to Employee Login
      </Button>
      <Button
        type="link"
        style={{ width: '100%', marginTop: 8 }}
        onClick={() => navigate('/register')}
        disabled={loading}
      >
        If you don't have an account, please register
      </Button>
    </AuthLayout>
  );
};

export default OwnerLogin;