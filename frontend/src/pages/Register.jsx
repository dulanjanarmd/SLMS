import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';
import logo from '../assets/logo.jpeg';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', studentStaffId: '', email: '', password: '', confirmPassword: '', phoneNumber: '', role: 'STUDENT', faculty: '', programme: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login', { state: { registered: true } });
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e8ecf0',
    borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', color: '#1e293b',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  };

  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf1ec 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 980, background: 'white', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden' }}>

        {/* Brand Side */}
        <div style={{ width: 320, background: 'linear-gradient(160deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)', padding: '48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {[
            { w: 180, h: 180, top: -60, right: -60, bg: 'rgba(255,255,255,0.05)' },
            { w: 120, h: 120, bottom: -40, left: -40, bg: 'rgba(239,90,36,0.12)' },
          ].map((s, i) => <div key={i} style={{ position: 'absolute', width: s.w, height: s.h, borderRadius: '50%', background: s.bg, top: s.top, right: s.right, bottom: s.bottom, left: s.left }} />)}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(239,90,36,0.4)', overflow: 'hidden' }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>LibraryHub</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 2 }}>SLIIT Library</div>
              </div>
            </div>

            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.25, marginBottom: 10 }}>Join the Library Community</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.86rem', lineHeight: 1.7, marginBottom: 28 }}>Create your account to access SLIIT's full library resources.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📚', text: '10,000+ Books & eBooks' },
                { icon: '📅', text: 'Easy reservations & renewals' },
                { icon: '🔔', text: 'Smart notifications' },
                { icon: '🔒', text: 'Secure & private' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>{f.icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.84rem' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div style={{ flex: 1, padding: '40px 44px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Create Account ✨</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⚠️</span><span style={{ color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="fullName" type="text" placeholder="Enter full name" value={formData.fullName} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <div>
                <label style={labelStyle}>Student/Staff ID</label>
                <input name="studentStaffId" type="text" placeholder="e.g., IT12345678" value={formData.studentStaffId} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone Number</label>
              <input name="phoneNumber" type="tel" placeholder="07X XXXXXXX" value={formData.phoneNumber} onChange={handleChange} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Faculty</label>
                <select name="faculty" value={formData.faculty} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Humanities">Humanities</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Programme</label>
              <input name="programme" type="text" placeholder="e.g., BSc IT" value={formData.programme} onChange={handleChange} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#f1916a' : 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,90,36,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              {loading ? <><Spinner size="sm" /> Creating Account...</> : '✨ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: '0.87rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;