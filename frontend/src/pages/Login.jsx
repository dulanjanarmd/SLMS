import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(!!location.state?.registered);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(identifier, password);

      if (userData.role === 'ADMIN') {
        logout();
        setError('Admin accounts must use the Admin Portal.');
        return;
      }

      const roleRoutes = {
        LIBRARIAN: '/dashboard',
        STUDENT: '/student/dashboard',
        FACULTY: '/faculty/dashboard',
      };
      navigate(roleRoutes[userData.role] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="text-center mb-4">
          <i className="bi bi-book-half" style={{ fontSize: '3rem', color: '#003366' }}></i>
          <h3 className="mt-2 fw-bold text-primary">SLIIT Library</h3>
          <p className="text-muted">Online Library Management System</p>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {showSuccess && (
          <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
            Registration successful! Please sign in with your new credentials.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email or Student/Staff ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter email or ID (e.g. IT12345678)"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <div className="text-end mb-4">
            <Link to="/forgot-password" className="text-decoration-none small text-muted">
              Forgot password?
            </Link>
          </div>

          <Button
            variant="dark"
            type="submit"
            className="w-100 py-2 fw-semibold btn-pill"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;