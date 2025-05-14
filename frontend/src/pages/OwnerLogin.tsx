// OwnerLogin.tsx
import React from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import '../styles/Login.css';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const OwnerLogin: React.FC = () => {
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login({ username: values.username, password: values.password });
      navigate('/');
    } catch (error) {
      // error handled by useLogin
      console.error(error);
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
      <Card className={`login-card shadow ${error ? 'error' : ''}`} style={{ width: 400 }}>
        <Title level={2} className="text-center mb-4 logo-text" style={{ textAlign: 'center', marginBottom: 24 }}>
          Owner Portal
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          noValidate
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Username is required' },
              { min: 3, message: 'Username must be at least 3 characters' },
            ]}
          >
            <Input placeholder="Enter username" disabled={loading} autoFocus />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Password" disabled={loading} />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100 custom-btn" loading={loading} disabled={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OwnerLogin;