import React, { useState, useEffect } from 'react';
import { fineAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('UNPAID');
  const [stats, setStats] = useState({ totalOutstanding: 0, totalCollected: 0 });

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [waiveReason, setWaiveReason] = useState('');
  const [waiving, setWaiving] = useState(false);

  useEffect(() => { fetchFines(); fetchStats(); }, [filter]);

  const fetchFines = async () => {
    setLoading(true); setError('');
    try {
      const res = filter === 'ALL' ? await fineAPI.getAll() : await fineAPI.getAllUnpaid();
      setFines(res.data || []);
    } catch { setError('Failed to load fines.'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => { try { const res = await fineAPI.getStats(); setStats(res.data || {}); } catch {} };

  const handlePayClick = (fine) => { setSelectedFine(fine); setPayAmount(fine.remainingAmount?.toFixed(2) || ''); setShowPayModal(true); };

  const handlePay = async () => {
    setPaying(true);
    try {
      await fineAPI.pay({ fineId: selectedFine.id, amount: parseFloat(payAmount), paymentMethod: 'CASH' });
      setSuccess(`Payment of LKR ${payAmount} recorded for ${selectedFine.userName}.`);
      setShowPayModal(false); fetchFines(); fetchStats();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Payment failed.'); }
    finally { setPaying(false); }
  };

  const handleWaive = async () => {
    setWaiving(true);
    try {
      await fineAPI.waive(selectedFine.id, selectedFine.remainingAmount, waiveReason || 'Waived by librarian');
      setSuccess(`Fine waived for ${selectedFine.userName}.`);
      setShowWaiveModal(false); setWaiveReason(''); fetchFines(); fetchStats();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Waive failed.'); }
    finally { setWaiving(false); }
  };

  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1a365d 50%, #059669 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}>💸 Fine Management</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Process payments and manage user fines</p>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>✅ {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Outstanding', val: `LKR ${(stats.totalOutstanding || 0).toFixed(2)}`, icon: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Total Collected', val: `LKR ${(stats.totalCollected || 0).toFixed(2)}`, icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', padding: '24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ k: 'UNPAID', l: 'Unpaid & Partial' }, { k: 'ALL', l: 'All Fines (History)' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '8px 24px', borderRadius: 999, border: filter === f.k ? 'none' : '1.5px solid #e8ecf0', background: filter === f.k ? '#1a1a2e' : 'white', color: filter === f.k ? 'white' : '#64748b', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            {f.l}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0 }}>Fine Records</h3>
          <button onClick={fetchFines} style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['User', 'Book', 'Desc', 'Amount', 'Remaining', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {fines.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No fine records found</td></tr>
                ) : fines.map(f => {
                  const canPay = f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID';
                  return (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f8fafc', background: canPay ? 'rgba(239,68,68,0.01)' : 'white' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{f.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{f.bookTitle}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8rem', maxWidth: 200 }}>{f.description}</td>
                      <td style={{ padding: '16px 20px', color: '#374151', fontWeight: 600 }}>LKR {f.amount.toFixed(2)}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: canPay ? '#ef4444' : '#10b981' }}>LKR {f.remainingAmount.toFixed(2)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: canPay ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: canPay ? '#ef4444' : '#10b981', borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {canPay && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handlePayClick(f)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>Pay</button>
                            <button onClick={() => { setSelectedFine(f); setShowWaiveModal(true); }} style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Waive</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && selectedFine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a1a2e', marginBottom: 20 }}>💳 Process Cash Payment</h3>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>Member</div>
              <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>{selectedFine.userName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ l: 'Total', v: `LKR ${selectedFine.amount.toFixed(2)}` }, { l: 'Paid', v: `LKR ${selectedFine.paidAmount.toFixed(2)}` }, { l: 'Remaining', v: `LKR ${selectedFine.remainingAmount.toFixed(2)}`, highlight: true }].map(item => (
                  <div key={item.l}>
                    <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginBottom: 2 }}>{item.l}</div>
                    <div style={{ fontWeight: 700, color: item.highlight ? '#ef4444' : '#374151' }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.83rem', color: '#374151', marginBottom: 8 }}>Cash Amount Received (LKR)</label>
              <input type="number" step="0.01" min="0.01" max={selectedFine.remainingAmount} value={payAmount} onChange={e => setPayAmount(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handlePay} disabled={paying} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                {paying ? <Spinner size="sm" /> : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {showWaiveModal && selectedFine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ef4444', marginBottom: 20 }}>Waive Fine</h3>
            <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)', padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.6 }}>
              Waive remaining <strong>LKR {selectedFine.remainingAmount.toFixed(2)}</strong> for <strong>{selectedFine.userName}</strong>?
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.83rem', color: '#374151', marginBottom: 8 }}>Reason for Waiving</label>
              <input type="text" placeholder="e.g. Approved by Head Librarian" value={waiveReason} onChange={e => setWaiveReason(e.target.value)} style={{ ...inputStyle, fontSize: '0.9rem', fontWeight: 500 }}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowWaiveModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handleWaive} disabled={waiving} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: waiving ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                {waiving ? <Spinner size="sm" /> : 'Waive Fine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;