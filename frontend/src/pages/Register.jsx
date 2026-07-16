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
            <i className="bi bi-person-plus-fill brand-icon-large"></i>
            <h1 className="brand-title">Join LibraryHub</h1>
            <p className="brand-subtitle">Create Your Account</p>
            <div className="brand-features">
              <div className="feature-item">
                <i className="bi bi-book"></i>
                <span>Access Thousands of Books</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-calendar-check"></i>
                <span>Easy Book Reservations</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-bell"></i>
                <span>Smart Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="login-form-side">
          <div className="login-card-new animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join SLIIT Library System</p>
            </div>

            {error && (
              <Alert variant="danger" className="alert-shake">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-person-fill"></i>
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-card-text"></i>
                      Student/Staff ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="studentStaffId"
                      placeholder="e.g., IT12345678"
                      value={formData.studentStaffId}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-envelope-fill"></i>
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input-custom"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-lock-fill"></i>
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-shield-lock-fill"></i>
                      Confirm Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <i className="bi bi-telephone-fill"></i>
                  Phone Number
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="form-input-custom"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-building"></i>
                      Faculty
                    </Form.Label>
                    <Form.Select 
                      name="faculty" 
                      value={formData.faculty} 
                      onChange={handleChange}
                      className="form-input-custom"
                    >
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
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-mortarboard-fill"></i>
                      Programme
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="programme"
                      placeholder="e.g., BSc IT"
                      value={formData.programme}
                      onChange={handleChange}
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-semibold btn-login-custom"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                  </>
                )}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none fw-semibold register-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;