// OwnerLogin.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Card, Container } from 'react-bootstrap';
import '../styles/Login.css';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

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
    <Container className="d-flex min-vh-100 justify-content-center align-items-center">
      <Card className={`login-card shadow ${error ? 'error' : ''}`}>
        <Card.Body>
          <h2 className="text-center mb-4 logo-text">Owner Portal</h2>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                {...register('username')}
                isInvalid={!!errors.username}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.username?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                {...register('password')}
                isInvalid={!!errors.password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Button variant="primary" type="submit" className={`w-100 custom-btn ${error ? 'error' : ''}`} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OwnerLogin;