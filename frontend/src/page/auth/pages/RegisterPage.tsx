import React from 'react';
import { useRegister } from '../hooks/useRegister';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Row, Col } from 'antd';
import AuthLayout from '../shared/AuthLayout';

const { Title } = Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register, loading, error } = useRegister();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name
      });
      navigate('/ownerLogin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout error={!!error}>
        <Title level={2} className="text-center mb-4 logo-text" style={{ textAlign: 'center', marginBottom: 24 }}>
          Register
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          noValidate
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="first_name"
              >
                <Input data-testid="first-name-input" placeholder="Enter first name" disabled={loading} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="last_name"
              >
                <Input data-testid="last-name-input" placeholder="Enter last name" disabled={loading} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Username is required' },
              { min: 3, message: 'Username must be at least 3 characters' },
              { max: 50, message: 'Username cannot exceed 50 characters' },
              { 
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Username can only contain letters, numbers, underscores, and hyphens'
              }
            ]}
          >
            <Input data-testid="username-input" placeholder="Enter username" disabled={loading} autoFocus />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input data-testid="email-input" type="email" placeholder="Enter email" disabled={loading} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                  { max: 50, message: 'Password cannot exceed 50 characters' }
                ]}
              >
                <Input.Password data-testid="password-input" placeholder="Enter password" disabled={loading} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password data-testid="confirm-password-input" placeholder="Confirm password" disabled={loading} />
              </Form.Item>
            </Col>
          </Row>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              data-testid="register-button" 
              type="primary" 
              htmlType="submit" 
              className="w-100 custom-btn"
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="link"
          style={{ marginTop: 16, width: '100%' }}
          onClick={() => navigate('/login')}
        >
          Already have an account? Login
        </Button>
    </AuthLayout>
  );
};

export default RegisterPage;
