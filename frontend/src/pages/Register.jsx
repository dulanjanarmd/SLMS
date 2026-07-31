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

  const inputStyle = { width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6 };

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
          
          <h2 style={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2, marginBottom: 20 }}>Join the Community</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: 40 }}>Create your account to access the university's full library resources.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['10,000+ Books & eBooks', 'Easy reservations & renewals', 'Smart notifications', 'Secure & private'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: 0.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 520, margin: 'auto' }} className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#1a1a2e', margin: '0 0 12px' }}>Create Account</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Fill in your details to get started</p>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="fullName" type="text" placeholder="Enter full name" value={formData.fullName} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <div>
                <label style={labelStyle}>Student/Staff ID</label>
                <input name="studentStaffId" type="text" placeholder="e.g. IT12345678" value={formData.studentStaffId} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone Number</label>
              <input name="phoneNumber" type="tel" placeholder="07X XXXXXXX" value={formData.phoneNumber} onChange={handleChange} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
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
              <label style={labelStyle}>Programme (Optional)</label>
              <input name="programme" type="text" placeholder="e.g., BSc IT" value={formData.programme} onChange={handleChange} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(26,26,46,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#ef5a24', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;