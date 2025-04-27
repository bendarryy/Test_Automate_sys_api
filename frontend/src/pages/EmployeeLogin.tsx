// src/pages/EmployeeLogin.tsx
import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import '../styles/Login.css'; // تأكد من المسار الصحيح

const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log({ email, password, rememberMe });
  };

  return (
    <Container className="d-flex min-vh-100 justify-content-center align-items-center">
      <Card className="login-card shadow employee-card">
        <Card.Body>
          <h2 className="text-center mb-4 logo-text">Employee Portal</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter company email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formRememberMe" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Remember this device"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 custom-btn">
              Login 
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeLogin;