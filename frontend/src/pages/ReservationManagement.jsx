import React, { useState, useEffect } from 'react';
import { reservationAPI, borrowAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillRes, setFulfillRes] = useState(null);
  const [fulfilling, setFulfilling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRes, setCancelRes] = useState(null);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    setLoading(true); setError('');
    try { const res = await reservationAPI.getActive(); setReservations(res.data || []); }
    catch { setError('Failed to load reservations.'); }
    finally { setLoading(false); }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    const val = lookupInput.trim(); if (!val) return;
    setLookupError(''); setLookupResult(null); setLookupLoading(true);
    try {
      if (/^\d+$/.test(val)) {
        const res = await reservationAPI.getById(val);
        if (res.data) { setLookupResult(res.data); setLookupLoading(false); return; }
      }
      const match = reservations.find(r => r.studentStaffId?.toLowerCase() === val.toLowerCase());
      if (match) setLookupResult(match); else setLookupError('No active reservation found for that ID.');
    } catch {
      const match = reservations.find(r => r.studentStaffId?.toLowerCase() === val.toLowerCase());
      if (match) setLookupResult(match); else setLookupError('No active reservation found for that ID.');
    } finally { setLookupLoading(false); }
  };

  const handleFulfill = async () => {
    setFulfilling(true);
    try {
      await borrowAPI.issue({ userId: fulfillRes.userId, bookId: fulfillRes.bookId });
      setSuccess(`Reservation #${fulfillRes.id} fulfilled. Book issued to ${fulfillRes.userName}.`);
      setShowFulfillModal(false); setFulfillRes(null); setLookupResult(null); setLookupInput(''); fetchReservations();
    } catch (err) { setError(err.response?.data?.message || 'Failed to fulfill reservation.'); setShowFulfillModal(false); }
    finally { setFulfilling(false); }
  };

  const handleCancel = async () => {
    try {
      await reservationAPI.cancel(cancelRes.id, cancelRes.userId);
      setSuccess(`Reservation #${cancelRes.id} cancelled.`);
      setShowCancelModal(false); setCancelRes(null); setLookupResult(null); fetchReservations();
    } catch (err) { setError(err.response?.data?.message || 'Failed to cancel.'); setShowCancelModal(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 18px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #4c1d95 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> Reservation Management</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Fulfill and manage book reservations</p>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}> {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
        {/* Lookup Card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: '0 0 16px' }}>Quick Lookup & Fulfill</h3>
          <form onSubmit={handleLookup} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="Res # or Member ID" value={lookupInput} onChange={e => setLookupInput(e.target.value)} required style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#4c1d95'; e.target.style.boxShadow = '0 0 0 3px rgba(76,29,149,0.12)'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            <button type="submit" disabled={lookupLoading} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 10, padding: '0 20px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', cursor: lookupLoading ? 'not-allowed' : 'pointer' }}>
              {lookupLoading ? <Spinner size="sm" /> : 'Find'}
            </button>
          </form>

          {lookupError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>️ {lookupError}</div>}

          {lookupResult && (
            <div style={{ background: 'linear-gradient(135deg, rgba(76,29,149,0.04), rgba(76,29,149,0.01))', border: '1px solid rgba(76,29,149,0.15)', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 800, color: '#4c1d95', fontSize: '1.1rem' }}>#{lookupResult.id}</span>
                <span style={{ background: lookupResult.status === 'NOTIFIED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: lookupResult.status === 'NOTIFIED' ? '#10b981' : '#f59e0b', borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{lookupResult.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{lookupResult.bookTitle}</div>
                <div style={{ color: '#64748b' }}>Reserved by {lookupResult.userName}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setCancelRes(lookupResult); setShowCancelModal(true); }} style={{ flex: 1, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={() => { setFulfillRes(lookupResult); setShowFulfillModal(true); }} style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}> Fulfill (Issue)</button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Ready for Pickup', val: reservations.filter(r => r.status === 'NOTIFIED').length, icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Pending in Queue', val: reservations.filter(r => r.status === 'PENDING').length, icon: '', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0 }}>Active Reservations Queue</h3>
          <button onClick={fetchReservations} style={{ background: 'none', border: 'none', color: '#4c1d95', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}> Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['Res #', 'Member', 'Book', 'Status', 'Reserved On', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No active reservations</td></tr>
                ) : reservations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc', background: r.status === 'NOTIFIED' ? 'rgba(16,185,129,0.02)' : 'white' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#4c1d95' }}>#{r.id}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{r.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.studentStaffId}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{r.bookTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Queue Pos: {r.queuePosition > 0 ? `#${r.queuePosition}` : '—'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: r.status === 'NOTIFIED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: r.status === 'NOTIFIED' ? '#10b981' : '#f59e0b', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {r.status === 'NOTIFIED' ? 'READY FOR PICKUP' : r.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>{new Date(r.reservationDate).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => { setFulfillRes(r); setShowFulfillModal(true); }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                        Fulfill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fulfill Modal */}
      {showFulfillModal && fulfillRes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1a1a2e', marginBottom: 20 }}>Fulfill Reservation</h3>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
              Issue <strong>"{fulfillRes.bookTitle}"</strong> to <strong>{fulfillRes.userName}</strong>?
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>This will convert the reservation into an active loan.</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowFulfillModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handleFulfill} disabled={fulfilling} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: fulfilling ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                {fulfilling ? <Spinner size="sm" /> : 'Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && cancelRes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#ef4444', marginBottom: 20 }}>Cancel Reservation</h3>
            <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)', padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.6 }}>
              Are you sure you want to cancel the reservation for <strong>"{cancelRes.bookTitle}"</strong> by <strong>{cancelRes.userName}</strong>?
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Abort</button>
              <button onClick={handleCancel} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
