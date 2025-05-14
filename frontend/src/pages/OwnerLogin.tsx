// OwnerLogin.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import '../styles/Login.css';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

interface IFormInputs {
  username: string;
  password: string;
}

const OwnerLogin: React.FC = () => {
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: IFormInputs) => {
    try {
      await login({ username: data.username, password: data.password });
      navigate('/');
    } catch (error) {
      // error handled by useLogin
      console.error(error);
    }
  };

  return (
    <div        style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      }}>
      <Card className={`login-card shadow ${error ? 'error' : ''}`} style={{ width: 400 }}>
        <Title level={2} className="text-center mb-4 logo-text" style={{ textAlign: 'center', marginBottom: 24 }}>Owner Portal</Title>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} noValidate>
          <Form.Item
            label="Username"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
          >
            <Input
              placeholder="Enter username"
              {...register('username')}
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
              placeholder="Password"
              {...register('password')}
              disabled={loading}
            />
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