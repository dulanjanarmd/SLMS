import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { membershipAPI, configAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Rev.'];

const MembershipApplication = () => {
  const { user } = useAuth();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [memberTypes, setMemberTypes] = useState([]);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: '', nameWithInitials: '', address: '', contactNumber: '', whatsappNumber: '',
    memberEmail: user?.email || '', memberType: '', faculty: user?.faculty || '',
    programme: user?.programme || '', academicYear: '', reason: '',
  });

  useEffect(() => {
    Promise.all([
      membershipAPI.getMy().then(res => setExisting(res.data)).catch(() => setExisting(null)),
      configAPI.getFaculties().then(res => setFaculties(res.data)).catch(() => {}),
      configAPI.getMemberTypes().then(res => setMemberTypes(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      const res = await membershipAPI.apply(formData, photoFile);
      setExisting(res.data);
      setSuccess('Application submitted! The librarian will review it shortly.');
    } catch (err) { setError(err.response?.data?.message || 'Submission failed.'); }
    finally { setSubmitting(false); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
      case 'PENDING': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
      case 'REJECTED': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
    }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 8 };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 800, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1a365d 50%, #0ea5e9 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}>🪪 Library Membership</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Apply for or view your library membership status</p>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#065f46', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}></span> {success}
      </div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}>️</span> {error}
      </div>}

      {existing ? (
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '36px', boxShadow: '0 24px 60px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(135deg, #1a1a2e, #4c1d95)', zIndex: 0 }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid white', background: '#f8fafc', overflow: 'hidden', marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              {existing.photoPath ? (
                <img src={`${API_URL}/membership/photo/${existing.photoPath}`} alt="Member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#cbd5e1' }}></div>
              )}
            </div>
            
            <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1a1a2e', margin: '0 0 8px' }}>{existing.nameWithInitials}</h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 20 }}>{existing.memberType} • {existing.faculty}</div>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: getStatusColor(existing.status).bg, color: getStatusColor(existing.status).color, padding: '8px 24px', borderRadius: 999, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1, marginBottom: 32 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(existing.status).color }}></span>
              {existing.status}
            </div>

            {existing.status === 'APPROVED' && (
              <div style={{ width: '100%', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '24px', textAlign: 'left', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 800, color: '#065f46', fontSize: '1.1rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.4rem' }}></span> Membership Active
                </h3>
                <p style={{ color: '#047857', fontSize: '0.9rem', margin: '0 0 20px', lineHeight: 1.6 }}>You have full access to library services including borrowing books and accessing digital content.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => window.location.href='/books'} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Browse Books</button>
                </div>
              </div>
            )}
            
            {existing.status === 'REJECTED' && (
              <div style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '24px', textAlign: 'left' }}>
                <h3 style={{ fontWeight: 800, color: '#b91c1c', fontSize: '1.1rem', margin: '0 0 8px' }}>Application Rejected</h3>
                {existing.reason && <p style={{ color: '#991b1b', fontSize: '0.9rem', margin: 0 }}><strong>Reason:</strong> {existing.reason}</p>}
                <p style={{ color: '#991b1b', fontSize: '0.9rem', margin: '12px 0 0' }}>Please contact the librarian for more information.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '36px', boxShadow: '0 24px 60px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: '0 0 8px' }}>Membership Application Form</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Please fill out all required fields to apply for library membership.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', border: '2px dashed #cbd5e1', background: photoPreview ? 'transparent' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16, cursor: 'pointer', position: 'relative' }} onClick={() => fileInputRef.current.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}></div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>Upload Photo</div>
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  Change Photo
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhoto} accept="image/jpeg,image/png" style={{ display: 'none' }} />
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Passport size photo (Max 1MB, JPG/PNG)</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <select name="title" value={formData.title} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select...</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Name with Initials</label>
                <input name="nameWithInitials" value={formData.nameWithInitials} onChange={handleChange} required placeholder="e.g. A.B.C. Perera" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Permanent Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Contact Number</label>
                <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" name="memberEmail" value={formData.memberEmail} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Member Type</label>
                <select name="memberType" value={formData.memberType} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select...</option>
                  {memberTypes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div>
                <label style={labelStyle}>Faculty</label>
                <select name="faculty" value={formData.faculty} onChange={handleChange} style={inputStyle}>
                  <option value="">Select...</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Programme</label>
                <input name="programme" value={formData.programme} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Academic Year</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="Y1">Year 1</option><option value="Y2">Year 2</option>
                  <option value="Y3">Year 3</option><option value="Y4">Year 4</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{ width: '100%', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 8px 24px rgba(26,26,46,0.25)', transition: 'transform 0.2s' }}>
              {submitting ? <Spinner size="sm" /> : 'Submit Application'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MembershipApplication;