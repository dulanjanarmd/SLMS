import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.forgotPassword(identifier);
      setMessage(res.data.message);
      const match = res.data.message.match(/Token: ([a-f0-9-]+)/i);
      if (match) setResetToken(match[1]);
    } catch (err) { setError(err.response?.data?.message || 'Request failed.'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await authAPI.resetPassword(resetToken, newPassword); setResetDone(true); }
    catch (err) { setError(err.response?.data?.message || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', marginBottom: 20 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, sans-serif' }}>
      {/* Left Side: Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #ef5a24 100%)', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }} className="d-none d-lg-flex">
        <div style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', bottom: -100, right: -50, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 24 }}></div>
          <h1 style={{ fontWeight: 900, fontSize: '3rem', margin: '0 0 16px', lineHeight: 1.1 }}>Recover Access</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: 40 }}>We'll help you get back into your LibraryHub account securely and quickly.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[{i: '️', t: 'Secure Recovery Process'}, {i: '', t: 'Token-Based Authentication'}, {i: '', t: 'Quick & Easy Reset'}].map(f => (
              <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: '1.5rem' }}>{f.i}</span>
                <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: 0.5 }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#1a1a2e', margin: '0 0 12px' }}>Password Recovery</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Enter your credentials to reset your password</p>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>️ {error}</div>}
          
          {resetDone ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '32px 24px', color: '#065f46' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}></div>
                <h3 style={{ fontWeight: 800, fontSize: '1.4rem', margin: '0 0 12px' }}>Password Reset Successful!</h3>
                <p style={{ color: '#047857', marginBottom: 24 }}>You can now sign in with your new password.</p>
                <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', textDecoration: 'none', padding: '14px 40px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>Sign In</Link>
              </div>
            </div>
          ) : resetToken ? (
            <form onSubmit={handleReset}>
              {message && <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24, color: '#0369a1', fontSize: '0.9rem', fontWeight: 500 }}>ℹ️ {message}</div>}
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Recovery Token</label>
                <input type="text" value={resetToken} onChange={e => setResetToken(e.target.value)} required placeholder="Enter token from email" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Enter new password" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(239,90,36,0.3)' }}>
                {loading ? <Spinner size="sm" /> : 'Set New Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: 8 }}>Email or User ID</label>
                <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required placeholder="Enter your registered email or ID" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(26,26,46,0.3)', marginBottom: 24 }}>
                {loading ? <Spinner size="sm" /> : 'Request Reset Link'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                Remembered your password? <Link to="/login" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;