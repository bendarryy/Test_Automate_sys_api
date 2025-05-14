// src/pages/EmployeeLogin.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { useApi } from '../hooks/useApi';
import '../styles/Login.css';

const { Title } = Typography;

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

interface IFormInputs {
  email: string;
  password: string;
}

const EmployeeLogin: React.FC = () => {
  const { loading, error, callApi } = useApi();
  const [success, setSuccess] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: IFormInputs) => {
    try {
      await callApi('post', '/core/employee/login/', { email: data.email, password: data.password });
      setSuccess(true);
      // يمكنك التوجيه بعد النجاح إذا أردت
      // setTimeout(() => navigate('/employee-dashboard'), 1200);
    } catch {
      setSuccess(false);
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
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} noValidate>
          {success && (
            <Form.Item>
              <Alert message="Login successful! Welcome." type="success" showIcon style={{ marginBottom: 16 }} />
            </Form.Item>
          )}
          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            </Form.Item>
          )}
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Input
              type="email"
              placeholder="Enter company email"
              {...register('email')}
              disabled={loading}
              autoFocus
            />
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Input.Password
              placeholder="Enter password"
              {...register('password')}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100 custom-btn" loading={loading} disabled={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EmployeeLogin;