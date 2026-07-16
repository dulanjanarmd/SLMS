import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import logo from '../assets/logo.jpeg';

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
    <div className="login-page-new">
      {/* Animated Background Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-container-new">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <img src={logo} alt="LibraryHub Logo" className="logo-animated" />
            <h1 className="brand-title">LibraryHub</h1>
            <p className="brand-subtitle">SLIIT Library Management System</p>
            <div className="brand-features">
              <div className="feature-item">
                <i className="bi bi-book"></i>
                <span>Access Thousands of Books</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-clock-history"></i>
                <span>24/7 Digital Library</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-people"></i>
                <span>Community & Collaboration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-side">
          <div className="login-card-new animate-fade-in">
            <div className="form-header">
              <h2 className="form-title">Welcome Back!</h2>
              <p className="form-subtitle">Sign in to continue to your account</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="alert-shake">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}
            {showSuccess && (
              <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
                <i className="bi bi-check-circle me-2"></i>
                Registration successful! Please sign in.
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-person-fill"></i>
                  Email or Student/Staff ID
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email or ID (e.g. IT12345678)"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="form-input-custom"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-lock-fill"></i>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input-custom"
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  className="text-muted-custom"
                />
                <Link to="/forgot-password" className="text-decoration-none small text-muted forgot-link">
                  Forgot password?
                </Link>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-semibold btn-login-custom"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted-custom mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none fw-semibold register-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;