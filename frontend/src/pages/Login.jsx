import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(!!location.state?.registered);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const userData = await login(identifier, password);
      if (userData.role === 'ADMIN') { logout(); setError('Admin accounts must use the Admin Portal.'); return; }
      const routes = { LIBRARIAN: '/dashboard', STUDENT: '/student/dashboard', FACULTY: '/faculty/dashboard' };
      navigate(routes[userData.role] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf1ec 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 900, background: 'white', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden', minHeight: 560 }}>

        {/* Brand Side */}
        <div style={{ flex: 1, background: 'linear-gradient(160deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {[
            { w: 200, h: 200, top: -60, right: -60, bg: 'rgba(255,255,255,0.05)' },
            { w: 150, h: 150, bottom: -40, left: -40, bg: 'rgba(239,90,36,0.12)' },
            { w: 80, h: 80, top: '40%', left: '10%', bg: 'rgba(255,255,255,0.03)' },
          ].map((s, i) => <div key={i} style={{ position: 'absolute', width: s.w, height: s.h, borderRadius: '50%', background: s.bg, top: s.top, right: s.right, bottom: s.bottom, left: s.left }} />)}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(239,90,36,0.4)', overflow: 'hidden' }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>LibraryHub</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', marginTop: 2 }}>SLIIT Library System</div>
              </div>
            </div>

            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', lineHeight: 1.2, marginBottom: 12 }}>
              Your Gateway to Knowledge
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 32 }}>
              Access thousands of books, research papers, and digital resources from SLIIT's library.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📚', text: 'Access 10,000+ Books & eBooks' },
                { icon: '🔔', text: 'Smart due date reminders' },
                { icon: '🔖', text: 'Online reservations & renewals' },
                { icon: '💳', text: 'Fine management & payments' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.87rem' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div style={{ flex: 1, padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.7rem', color: '#1a1a2e', margin: 0, marginBottom: 8 }}>Welcome back! 👋</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Sign in to continue to your account</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span style={{ color: '#b91c1c', fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}
          {showSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✅</span>
              <span style={{ color: '#065f46', fontSize: '0.88rem', fontWeight: 500 }}>Registration successful! Please sign in.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: 8 }}>Email or Student/Staff ID</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="e.g. IT12345678 or user@sliit.lk"
                required
                style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '12px 48px 12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#9ca3af' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                <input type="checkbox" style={{ accentColor: '#ef5a24' }} /> Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#ef5a24', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#f1916a' : 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,90,36,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {loading ? <><Spinner size="sm" /> Signing in...</> : '🔓 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.87rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>Register here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;