import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ phoneNumber: '', faculty: '', programme: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
      setFormData({ phoneNumber: res.data.phoneNumber || '', faculty: res.data.faculty || '', programme: res.data.programme || '' });
    } catch { setError('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true); setError('');
      await userAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const getRoleInfo = (role) => {
    const map = {
      ADMIN: { label: 'Administrator', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
      LIBRARIAN: { label: 'Librarian', color: '#ef5a24', bg: 'rgba(239,90,36,0.1)' },
      FACULTY: { label: 'Faculty Member', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
      STUDENT: { label: 'Student', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    };
    return map[role] || { label: role, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  const roleInfo = getRoleInfo(profile?.role);

  const inputStyle = (enabled) => ({
    width: '100%', padding: '10px 14px',
    background: enabled ? 'white' : '#f8fafc',
    border: `1.5px solid ${enabled ? '#e8ecf0' : '#f1f5f9'}`,
    borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem',
    color: enabled ? '#1e293b' : '#94a3b8', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s',
  });

  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '32px 40px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.7rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> My Profile</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.88rem', position: 'relative', zIndex: 1 }}>Manage your personal information and preferences</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>️ {error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}> {success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Left: Avatar Card */}
        <div>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '32px 24px', textAlign: 'center', marginBottom: 20 }}>
            {/* Avatar */}
            <div style={{ width: 90, height: 90, borderRadius: 22, background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 auto 16px', boxShadow: `0 8px 24px ${roleInfo.color}33` }}>
              {getInitials(profile?.fullName)}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 6px' }}>{profile?.fullName}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 14px' }}>{profile?.studentStaffId}</p>
            <span style={{ background: roleInfo.bg, color: roleInfo.color, borderRadius: 8, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700 }}>{roleInfo.label}</span>

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 20, paddingTop: 20, textAlign: 'left' }}>
              {[
                { icon: '', val: profile?.email },
                { icon: '', val: profile?.phoneNumber || '—' },
                { icon: '️', val: profile?.faculty || '—' },
                { icon: '', val: profile?.programme || '—' },
              ].map(item => (
                <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: '0.85rem' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Borrowing Limits */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e' }}> Borrowing Privileges</div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { label: 'Max Books', value: profile?.maxBooksAllowed, color: '#ef5a24' },
                { label: 'Loan Period', value: `${profile?.maxDaysAllowed} days`, color: '#6366f1' },
                { label: 'Currently Borrowed', value: profile?.currentBorrowCount, color: '#f59e0b' },
                { label: 'Outstanding Fines', value: `LKR ${(profile?.outstandingFine || 0).toFixed(2)}`, color: '#ef4444' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>Profile Information</span>
            <button onClick={() => setEditMode(!editMode)} style={{ background: editMode ? '#f1f5f9' : 'rgba(239,90,36,0.08)', color: editMode ? '#64748b' : '#ef5a24', border: `1.5px solid ${editMode ? '#e8ecf0' : 'rgba(239,90,36,0.2)'}`, borderRadius: 8, padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}>
              {editMode ? ' Cancel' : '️ Edit Profile'}
            </button>
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={profile?.fullName || ''} disabled style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Student/Staff ID</label>
                <input type="text" value={profile?.studentStaffId || ''} disabled style={inputStyle(false)} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={profile?.email || ''} disabled style={inputStyle(false)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} disabled={!editMode} placeholder="07X XXXXXXX"
                style={inputStyle(editMode)}
                onFocus={e => { if (editMode) { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; } }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Faculty</label>
                <select value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} disabled={!editMode} style={{ ...inputStyle(editMode), cursor: editMode ? 'pointer' : 'default' }}>
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Humanities">Humanities</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Programme</label>
                <input type="text" value={formData.programme} onChange={e => setFormData({ ...formData, programme: e.target.value })} disabled={!editMode} placeholder="e.g., BSc IT"
                  style={inputStyle(editMode)}
                  onFocus={e => { if (editMode) { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; } }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
              </div>
            </div>

            {editMode && (
              <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {saving ? <><Spinner size="sm" /> Saving...</> : ' Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
