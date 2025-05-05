// src/pages/EmployeeLogin.tsx
import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { useApi } from '../hooks/useApi';
import '../styles/Login.css'; // تأكد من المسار الصحيح

const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { loading, error, callApi } = useApi();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callApi('post', '/core/employee/login/', { email, password });
      setSuccess(true);
      // يمكنك التوجيه بعد النجاح إذا أردت
      // setTimeout(() => navigate('/employee-dashboard'), 1200);
    } catch {
      setSuccess(false);
    }
  };

  return (
    <Container className="d-flex min-vh-100 justify-content-center align-items-center">
      <Card className="login-card shadow employee-card">
        <Card.Body>
          <h2 className="text-center mb-4 logo-text">Employee Portal</h2>
          <Form onSubmit={handleSubmit}>
            {success && <Alert variant="success">Login successful! Welcome.</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter company email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 custom-btn" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeLogin;