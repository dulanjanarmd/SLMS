import React, { useState } from 'react';
import { borrowAPI } from '../services/api';
import api from '../services/api';
import { Spinner } from 'react-bootstrap';

const ReturnBook = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [returning, setReturning] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault(); if (!query.trim()) return;
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await api.get('/librarian/borrow/all-active');
      const loans = res.data || [];
      const q = query.toLowerCase();
      const filtered = loans.filter(l => l.userName?.toLowerCase().includes(q) || l.studentStaffId?.toLowerCase().includes(q) || l.bookTitle?.toLowerCase().includes(q) || l.isbn?.toLowerCase().includes(q));
      if (filtered.length === 0) setError('No active loans found matching that query.');
      setResults(filtered);
    } catch { setError('Search failed.'); }
    finally { setLoading(false); }
  };

  const loadAll = async () => {
    setLoading(true); setError(''); setQuery('');
    try {
      const res = await api.get('/librarian/borrow/all-active');
      setResults(res.data || []);
    } catch { setError('Failed to load active loans.'); }
    finally { setLoading(false); }
  };

  const calcFine = (dueDate) => {
    const today = new Date(); const due = new Date(dueDate);
    if (today <= due) return { overdue: false, days: 0, amount: 0 };
    const days = Math.ceil((today - due) / 86400000);
    return { overdue: true, days, amount: days * 5 };
  };

  const handleReturn = async () => {
    setReturning(true);
    try {
      const res = await borrowAPI.return(selected.id);
      setSuccess(res.data); setShowConfirm(false); setSelected(null);
      setResults(prev => prev.filter(r => r.id !== selected.id));
    } catch (err) { setError(err.response?.data?.message || 'Return failed.'); setShowConfirm(false); }
    finally { setReturning(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 18px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1a365d 50%, #0ea5e9 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> Return Book</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Process returned books and collect fines</p>
      </div>

      {success && (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)', border: '1.5px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}></div>
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 2 }}>Book Returned Successfully!</div>
            <div style={{ color: '#047857', fontSize: '0.88rem' }}>"{success.bookTitle}" returned by {success.userName}.
              {success.fineAmount > 0 && <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: 8 }}>Fine imposed: LKR {success.fineAmount.toFixed(2)}</span>}
            </div>
          </div>
          <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#10b981', marginLeft: 'auto', fontSize: '1.2rem', cursor: 'pointer' }}></button>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>️ {error}</div>}

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}></span>
            <input type="text" placeholder="Search active loans by ID, Name, Book Title, or ISBN..." value={query} onChange={e => setQuery(e.target.value)} required style={{ ...inputStyle, paddingLeft: 44 }}
              onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.12)'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 10, padding: '0 28px', height: 48, fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? <Spinner size="sm" /> : 'Search'}
          </button>
          <button type="button" onClick={loadAll} disabled={loading} style={{ background: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'none', borderRadius: 10, padding: '0 24px', height: 48, fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
            Show All
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0 }}>Active Loans ({results.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['Borrower', 'Book', 'Issue Date', 'Due Date', 'Status', 'Fine', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {results.map(loan => {
                  const fine = calcFine(loan.dueDate);
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc', background: fine.overdue ? 'rgba(239,68,68,0.02)' : 'white' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{loan.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{loan.bookTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.isbn}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>{loan.issueDate}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: fine.overdue ? 700 : 500, color: fine.overdue ? '#ef4444' : '#374151', fontSize: '0.85rem' }}>{loan.dueDate}</div>
                        {fine.overdue && <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{fine.days} days overdue</div>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: fine.overdue ? 'rgba(239,68,68,0.1)' : loan.status === 'RENEWED' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', color: fine.overdue ? '#ef4444' : loan.status === 'RENEWED' ? '#6366f1' : '#10b981', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {fine.overdue ? 'OVERDUE' : loan.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {fine.overdue ? <span style={{ color: '#ef4444', fontWeight: 700 }}>LKR {fine.amount.toFixed(2)}</span> : <span style={{ color: '#10b981', fontWeight: 500, fontSize: '0.85rem' }}>No fine</span>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button onClick={() => { setSelected(loan); setShowConfirm(true); }} style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#10b981'; }}>
                           Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && selected && (() => {
        const fine = calcFine(selected.dueDate);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1a1a2e', marginBottom: 20 }}>Confirm Return</h3>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
                Return <strong>"{selected.bookTitle}"</strong> from <strong>{selected.userName}</strong>?
                {fine.overdue ? (
                  <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '12px', marginTop: 12, color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <strong>Overdue by {fine.days} days.</strong> A fine of <strong>LKR {fine.amount.toFixed(2)}</strong> will be added to the user's account.
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '12px', marginTop: 12, color: '#065f46', border: '1px solid rgba(16,185,129,0.2)' }}>
                    Returned on time. No fine.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                <button onClick={handleReturn} disabled={returning} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: returning ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                  {returning ? <Spinner size="sm" /> : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ReturnBook;
