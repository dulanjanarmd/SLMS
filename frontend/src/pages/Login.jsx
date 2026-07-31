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

  const inputStyle = { width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };

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
          {showSuccess && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24, color: '#065f46', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>Registration successful! Please sign in.</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Email or User ID</label>
              <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required placeholder="e.g. IT12345678 or user@university.edu" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Password</label>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>
                <input type="checkbox" style={{ accentColor: '#ef5a24' }} onClick={() => setShowPass(!showPass)} /> Show Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#ef5a24', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(26,26,46,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.95rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;