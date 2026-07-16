import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotId, setForgotId] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'ACCESS_DENIED') {
        setError('Access denied. This portal is for admin accounts only.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.forgotPassword(forgotId);
      setForgotMsg(res.data.message);
      const match = res.data.message.match(/Token: ([a-f0-9-]+)/i);
      if (match) setResetToken(match[1]);
    } catch {
      setForgotMsg('Request failed.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      setResetDone(true);
    } catch {
      setForgotMsg('Reset failed.');
    }
  };

  if (showForgot) {
    return (
      <div className="login-page">
        <div className="login-card animate-fade-in">
          <div className="text-center mb-4">
            <i className="bi bi-key" style={{ fontSize: '3rem', color: '#003366' }}></i>
            <h3 className="mt-2 fw-bold" style={{ color: '#003366' }}>Reset Admin Password</h3>
          </div>

          {forgotMsg && <Alert variant="info">{forgotMsg}</Alert>}

          {resetDone ? (
            <Alert variant="success">
              Password reset successfully!{' '}
              <Button variant="link" className="p-0" onClick={() => { setShowForgot(false); setResetDone(false); setForgotMsg(''); }}>
                Back to Sign In
              </Button>
            </Alert>
          ) : !resetToken ? (
            <Form onSubmit={handleForgot}>
              <Form.Group className="mb-3">
                <Form.Label>Admin Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter admin email"
                  value={forgotId}
                  onChange={(e) => setForgotId(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">Send Reset Token</Button>
            </Form>
          ) : (
            <Form onSubmit={handleReset}>
              <Form.Group className="mb-3">
                <Form.Label>Reset Token</Form.Label>
                <Form.Control
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">Reset Password</Button>
            </Form>
          )}

          <div className="text-center mt-3">
            <Button variant="link" className="p-0 text-muted small" onClick={() => setShowForgot(false)}>
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-new admin-login">
      {/* Animated Background Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-container-new">
        {/* Left Side - Branding */}
        <div className="login-branding admin-branding">
          <div className="branding-content">
            <div className="admin-icon-wrapper">
              <i className="bi bi-shield-lock-fill admin-shield-icon"></i>
            </div>
            <h1 className="brand-title">Admin Portal</h1>
            <p className="brand-subtitle">SLIIT Library Management System</p>
            <div className="admin-badge">
              <i className="bi bi-lock-fill"></i>
              <span>Restricted Access</span>
            </div>
            <div className="brand-features admin-features">
              <div className="feature-item">
                <i className="bi bi-people-fill"></i>
                <span>Manage Users & Staff</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-bar-chart-line-fill"></i>
                <span>Analytics & Reports</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-gear-fill"></i>
                <span>System Configuration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-side">
          <div className="login-card-new animate-fade-in">
            <div className="form-header">
              <h2 className="form-title">Administrator Login</h2>
              <p className="form-subtitle">Sign in to access admin dashboard</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="alert-shake">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-envelope-fill"></i>
                  Admin Email
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="form-input-custom"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-key-fill"></i>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input-custom"
                />
              </Form.Group>

              <div className="text-end mb-4">
                <Button 
                  variant="link" 
                  className="p-0 text-decoration-none forgot-link" 
                  onClick={() => setShowForgot(true)}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-semibold btn-login-custom btn-admin-login"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In to Admin Portal
                  </>
                )}
              </Button>
            </Form>

            <hr className="my-4" />
            <div className="text-center">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Admin demo: <strong>admin@example.com</strong> / password
              </small>
            </div>
            <div className="text-center mt-2">
              <small className="text-muted">
                Not an admin?{' '}
                <a href="http://localhost:5173/login" className="text-decoration-none register-link">
                  Go to Library Portal
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
