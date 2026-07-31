import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservationAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const statusMap = {
  PENDING:   { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  NOTIFIED:  { label: 'Ready! 🎉', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  FULFILLED: { label: 'Fulfilled',  color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  CANCELLED: { label: 'Cancelled',  color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  EXPIRED:   { label: 'Expired',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
    const i = setInterval(fetchReservations, 20000);
    return () => clearInterval(i);
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationAPI.getUserReservations(user.id);
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to load reservations'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    try {
      setError(''); setSuccess('');
      await reservationAPI.cancel(id, user.id);
      setSuccess('Reservation cancelled successfully.');
      fetchReservations();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to cancel reservation'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  const notified = reservations.filter(r => r.status === 'NOTIFIED');
  const pending = reservations.filter(r => r.status === 'PENDING');
  const others = reservations.filter(r => !['PENDING', 'NOTIFIED'].includes(r.status));

  const thStyle = { padding: '12px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>🔖 My Reservations</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>{reservations.length} reservation{reservations.length !== 1 ? 's' : ''} · {notified.length} ready for pickup</p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>✅ {success}</div>}

      {/* Ready for pickup alerts */}
      {notified.map(r => (
        <div key={r.id} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)', border: '1.5px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 2 }}>Book Ready for Pickup!</div>
            <div style={{ color: '#047857', fontSize: '0.88rem' }}>
              "<strong>{r.bookTitle}</strong>" is available — please collect from the library counter.
              {r.expiryDate && <span style={{ color: '#6b7280', marginLeft: 8 }}>Expires: {new Date(r.expiryDate).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      ))}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '⏳', val: pending.length, label: 'In Queue', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: '🎉', val: notified.length, label: 'Ready Pickup', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { icon: '✅', val: reservations.filter(r => r.status === 'FULFILLED').length, label: 'Fulfilled', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { icon: '📋', val: reservations.length, label: 'Total', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>All Reservations</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              {['Ref #', 'Book', 'Author', 'Queue #', 'Status', 'Reserved On', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔖</div>
                  No reservations yet. <Link to="/books" style={{ color: '#ef5a24', fontWeight: 600 }}>Browse catalog →</Link>
                </td></tr>
              ) : reservations.map(res => {
                const s = statusMap[res.status] || { label: res.status, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
                return (
                  <tr key={res.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#ef5a24', fontSize: '0.88rem' }}>#{res.id}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Show to librarian</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1a2e' }}>{res.bookTitle}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{res.bookAuthor}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {res.queuePosition > 0
                        ? <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>#{res.queuePosition}</span>
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: '#374151' }}>{new Date(res.reservationDate).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {res.status === 'PENDING' && (
                        <button onClick={() => handleCancel(res.id)} style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}>
                          ✕ Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
