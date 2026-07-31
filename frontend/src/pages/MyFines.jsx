import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fineAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const statusMap = {
  UNPAID:       { label: 'Unpaid',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  PARTIALLY_PAID:{ label: 'Partial', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  PAID:          { label: 'Paid',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  WAIVED:        { label: 'Waived',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
};

const MyFines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => { fetchFines(); }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await fineAPI.getUserFines(user.id);
      setFines(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to load fines'); }
    finally { setLoading(false); }
  };

  const handlePayClick = (fine) => { setPayModal(fine); setPayAmount(fine.remainingAmount.toFixed(2)); };

  const handlePay = async () => {
    try {
      setError(''); setSuccess('');
      await fineAPI.pay({ fineId: payModal.id, amount: parseFloat(payAmount), paymentMethod: 'ONLINE' });
      setSuccess('Payment successful! Fine updated.');
      setPayModal(null);
      fetchFines();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  const totalOutstanding = fines.filter(f => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID').reduce((s, f) => s + f.remainingAmount, 0);
  const thStyle = { padding: '12px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #4c1d1d 50%, #ef4444 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>💳 My Fines</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>
            {totalOutstanding > 0 ? `LKR ${totalOutstanding.toFixed(2)} outstanding` : 'No outstanding fines — great job! 🎉'}
          </p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>✅ {success}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '💸', val: `LKR ${totalOutstanding.toFixed(2)}`, label: 'Outstanding', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { icon: '⚠️', val: fines.filter(f => f.status === 'UNPAID').length, label: 'Unpaid', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: '🔄', val: fines.filter(f => f.status === 'PARTIALLY_PAID').length, label: 'Partial', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { icon: '✅', val: fines.filter(f => f.status === 'PAID').length, label: 'Paid', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fines Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>Fine History</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              {['Book', 'Description', 'Amount', 'Paid', 'Remaining', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {fines.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
                  No fines — keep returning books on time!
                </td></tr>
              ) : fines.map(fine => {
                const s = statusMap[fine.status] || { label: fine.status, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
                const canPay = fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID';
                return (
                  <tr key={fine.id} style={{ borderBottom: '1px solid #f8fafc', background: canPay ? 'rgba(239,68,68,0.01)' : 'white' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1a2e' }}>{fine.bookTitle}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.82rem', maxWidth: 200 }}>{fine.description}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#374151' }}>LKR {fine.amount.toFixed(2)}</td>
                    <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 600 }}>LKR {fine.paidAmount.toFixed(2)}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: canPay ? '#ef4444' : '#9ca3af' }}>LKR {fine.remainingAmount.toFixed(2)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {canPay && (
                        <button onClick={() => handlePayClick(fine)} style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#10b981'; }}>
                          💳 Pay
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

      {/* Payment Modal */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a1a2e', marginBottom: 20 }}>💳 Pay Fine</h3>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>Book</div>
              <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>{payModal.bookTitle}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ l: 'Total', v: `LKR ${payModal.amount.toFixed(2)}` }, { l: 'Paid', v: `LKR ${payModal.paidAmount.toFixed(2)}` }, { l: 'Remaining', v: `LKR ${payModal.remainingAmount.toFixed(2)}`, highlight: true }].map(item => (
                  <div key={item.l}>
                    <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginBottom: 2 }}>{item.l}</div>
                    <div style={{ fontWeight: 700, color: item.highlight ? '#ef4444' : '#374151' }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.83rem', color: '#374151', marginBottom: 8 }}>Payment Amount (LKR)</label>
              <input type="number" step="0.01" min="0.01" max={payModal.remainingAmount} value={payAmount} onChange={e => setPayAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setPayModal(null)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handlePay} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                💳 Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFines;
