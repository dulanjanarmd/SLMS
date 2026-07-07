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
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="text-center mb-4">
          <i className="bi bi-key" style={{ fontSize: '3rem', color: '#003366' }}></i>
          <h3 className="mt-2 fw-bold text-primary">Reset Password</h3>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {resetDone ? (
          <Alert variant="success">
            Password reset successfully!{' '}
            <Link to="/login">Sign in</Link>
          </Alert>
        ) : !resetToken ? (
          <Form onSubmit={handleForgot}>
            <Form.Group className="mb-3">
              <Form.Label>Email or Student/Staff ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email or ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </Form.Group>
            {message && <Alert variant="info">{message}</Alert>}
            <Button variant="dark" type="submit" className="w-100 btn-pill" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Send Reset Token'}
            </Button>
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
            <Button variant="dark" type="submit" className="w-100 btn-pill" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Reset Password'}
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none small">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;