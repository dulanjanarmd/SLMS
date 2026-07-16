import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.forgotPassword(identifier);
      setMessage(res.data.message);
      // Extract token from message for demo (in production this would be emailed)
      const match = res.data.message.match(/Token: ([a-f0-9-]+)/i);
      if (match) setResetToken(match[1]);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      setResetDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
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
            <i className="bi bi-key-fill brand-icon-large"></i>
            <h1 className="brand-title">Reset Password</h1>
            <p className="brand-subtitle">We'll Help You Recover Access</p>
            <div className="brand-features">
              <div className="feature-item">
                <i className="bi bi-shield-check"></i>
                <span>Secure Recovery Process</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-envelope-check"></i>
                <span>Token-Based Authentication</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-lightning-charge"></i>
                <span>Quick & Easy Reset</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="login-form-side">
          <div className="login-card-new animate-fade-in">
            <div className="form-header">
              <h2 className="form-title">Password Recovery</h2>
              <p className="form-subtitle">Enter your credentials to reset your password</p>
            </div>

            {error && (
              <Alert variant="danger" className="alert-shake">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            {resetDone ? (
              <Alert variant="success">
                <i className="bi bi-check-circle me-2"></i>
                Password reset successfully!{' '}
                <Link to="/login" className="register-link">Sign in</Link>
              </Alert>
            ) : !resetToken ? (
              <Form onSubmit={handleForgot}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-person-fill"></i>
                    Email or Student/Staff ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your email or ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="form-input-custom"
                  />
                </Form.Group>
                {message && (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    {message}
                  </Alert>
                )}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 fw-semibold btn-login-custom" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Send Reset Token
                    </>
                  )}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-key-fill"></i>
                    Reset Token
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    className="form-input-custom"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-lock-fill"></i>
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="form-input-custom"
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 fw-semibold btn-login-custom" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Resetting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Reset Password
                    </>
                  )}
                </Button>
              </Form>
            )}

            <div className="text-center mt-4">
              <Link to="/login" className="text-decoration-none small register-link">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;