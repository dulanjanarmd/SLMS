import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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

  const inputStyle = {
    width: '100%', padding: '14px 20px', background: '#f8fafc',
    border: '1.5px solid #e8ecf0', borderRadius: 12,
    fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
  };

  if (showForgot) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #ef5a24 100%)', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }} className="d-none d-lg-flex">
          <div style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div style={{ position: 'absolute', bottom: -100, right: -50, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>LibraryHub</div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: 4 }}>University Library System</div>
              </div>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2, marginBottom: 20 }}>Admin Password Reset</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>Securely reset your admin account password using the token sent to your email.</p>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'white' }}>
          <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <i className="bi bi-key" style={{ fontSize: '3rem', color: '#ef5a24' }}></i>
              <h3 className="mt-2 fw-bold" style={{ color: '#1a1a2e', fontFamily: 'Poppins, sans-serif' }}>Reset Admin Password</h3>
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
                  <Form.Label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Admin Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter admin email"
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }}
                  />
                </Form.Group>
                <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(26,26,46,0.3)' }}>
                  Send Reset Token
                </button>
              </Form>
            ) : (
              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Reset Token</Form.Label>
                  <Form.Control
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }}
                  />
                </Form.Group>
                <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(26,26,46,0.3)' }}>
                  Reset Password
                </button>
              </Form>
            )}

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => setShowForgot(false)} className="btn btn-link p-0 text-decoration-none" style={{ color: '#ef5a24', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, sans-serif' }}>
      {/* Left Side: Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #ef5a24 100%)', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }} className="d-none d-lg-flex">
        <div style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', bottom: -100, right: -50, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>LibraryHub</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: 4 }}>University Library System</div>
            </div>
          </div>

          <h2 style={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2, marginBottom: 20 }}>Your Gateway to Knowledge</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: 40 }}>Access thousands of books, research papers, and digital resources from the university's library.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['Access 10,000+ Books & eBooks', 'Smart due date reminders', 'Online reservations & renewals', 'Fine management & payments'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: 0.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#1a1a2e', margin: '0 0 12px' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Sign in to continue to your account</p>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>{error}</div>}

          <Form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Email or User ID</label>
              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>
                <input type="checkbox" style={{ accentColor: '#ef5a24' }} checked={showPass} onChange={() => setShowPass(!showPass)} /> Show Password
              </label>
              <button type="button" onClick={() => setShowForgot(true)} style={{ fontSize: '0.9rem', color: '#ef5a24', fontWeight: 600, textDecoration: 'none', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                color: 'white', border: 'none', borderRadius: 12,
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(26,26,46,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </Form>

          <hr style={{ margin: '32px 0', borderColor: '#f1f5f9' }} />

          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
            <i className="bi bi-info-circle me-1"></i>
            Admin demo: <strong>admin@example.com</strong> / password
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: '0.95rem' }}>
            Not an admin?{' '}
            <a href="http://localhost:5173/login" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>
              Go to Library Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
