import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentStaffId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'STUDENT',
    faculty: '',
    programme: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in" style={{ maxWidth: '550px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-book-half" style={{ fontSize: '3rem', color: '#003366' }}></i>
          <h3 className="mt-2 fw-bold text-primary">Create Account</h3>
          <p className="text-muted">Join SLIIT Library System</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Student/Staff ID</Form.Label>
                <Form.Control
                  type="text"
                  name="studentStaffId"
                  placeholder="e.g., IT12345678"
                  value={formData.studentStaffId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Faculty</Form.Label>
                <Form.Select name="faculty" value={formData.faculty} onChange={handleChange}>
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Humanities">Humanities</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Programme</Form.Label>
                <Form.Control
                  type="text"
                  name="programme"
                  placeholder="e.g., BSc IT"
                  value={formData.programme}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            variant="dark"
            type="submit"
            className="w-100 py-2 fw-semibold btn-pill"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;