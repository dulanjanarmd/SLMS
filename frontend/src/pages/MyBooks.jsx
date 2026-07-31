import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { borrowAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const MyBooks = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchMyBooks();
    const i = setInterval(fetchMyBooks, 20000);
    return () => clearInterval(i);
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const [activeRes, historyRes] = await Promise.all([
        borrowAPI.getActiveLoans(user.id),
        borrowAPI.getUserHistory(user.id),
      ]);
      setActiveLoans(activeRes.data || []);
      setBorrowHistory((historyRes.data || []).filter(l => l.status === 'RETURNED'));
    } catch { setError('Failed to load your books'); }
    finally { setLoading(false); }
  };

  const handleRenew = async (borrowId) => {
    try {
      setError(''); setSuccess('');
      await borrowAPI.requestRenewal(borrowId);
      setSuccess('Renewal request submitted! Awaiting librarian approval.');
      fetchMyBooks();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to request renewal'); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  const getDaysRemaining = (dueDate) => Math.ceil((new Date(dueDate) - new Date()) / 86400000);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  const tableHead = (cols) => (
    <thead>
      <tr style={{ background: '#f8fafc' }}>
        {cols.map(c => <th key={c} style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{c}</th>)}
      </tr>
    </thead>
  );

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}> My Books</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>
            {activeLoans.length} active loan{activeLoans.length !== 1 ? 's' : ''} · {borrowHistory.length} returned
          </p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>️ {error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}> {success}</div>}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '', val: activeLoans.length, label: 'Active Loans', color: '#ef5a24', bg: 'rgba(239,90,36,0.1)' },
          { icon: '️', val: activeLoans.filter(l => isOverdue(l.dueDate)).length, label: 'Overdue', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { icon: '', val: activeLoans.filter(l => l.status === 'RENEWAL_REQUESTED').length, label: 'Renewal Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: '', val: borrowHistory.length, label: 'Total Returned', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '18px 16px', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e8ecf0', marginBottom: 20 }}>
        {[{ key: 'active', label: `Currently Borrowed (${activeLoans.length})` }, { key: 'history', label: `Return History (${borrowHistory.length})` }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === t.key ? '2px solid #ef5a24' : '2px solid transparent', background: 'transparent', fontFamily: 'Poppins, sans-serif', fontWeight: activeTab === t.key ? 700 : 500, fontSize: '0.88rem', color: activeTab === t.key ? '#ef5a24' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Loans Table */}
      {activeTab === 'active' && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              {tableHead(['Book', 'Author', 'Issue Date', 'Due Date', 'Status', 'Renewals', 'Action'])}
              <tbody>
                {activeLoans.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}></div>
                    No active loans. <Link to="/books" style={{ color: '#ef5a24', fontWeight: 600 }}>Browse catalog →</Link>
                  </td></tr>
                ) : activeLoans.map(loan => {
                  const overdue = isOverdue(loan.dueDate);
                  const daysLeft = getDaysRemaining(loan.dueDate);
                  const statusColor = overdue ? { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', label: 'OVERDUE' }
                    : loan.status === 'RENEWAL_REQUESTED' ? { bg: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'RENEWAL PENDING' }
                    : loan.status === 'RENEWED' ? { bg: 'rgba(99,102,241,0.1)', text: '#6366f1', label: 'RENEWED' }
                    : { bg: 'rgba(16,185,129,0.1)', text: '#059669', label: 'ACTIVE' };
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc', background: overdue ? 'rgba(239,68,68,0.018)' : 'white' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1a2e' }}>{loan.bookTitle}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>{loan.bookAuthor}</td>
                      <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.82rem' }}>{loan.issueDate}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: overdue ? '#ef4444' : '#374151', fontSize: '0.85rem' }}>{loan.dueDate}</div>
                        <div style={{ fontSize: '0.73rem', color: overdue ? '#ef4444' : '#9ca3af', marginTop: 2 }}>
                          {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: statusColor.bg, color: statusColor.text, borderRadius: 6, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{statusColor.label}</span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{loan.renewalCount}</span>
                        <span style={{ color: '#9ca3af' }}>/2</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleRenew(loan.id)}
                          disabled={loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED'}
                          style={{ background: (loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED') ? '#f1f5f9' : 'rgba(239,90,36,0.08)', color: (loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED') ? '#9ca3af' : '#ef5a24', border: `1.5px solid ${(loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED') ? '#e8ecf0' : 'rgba(239,90,36,0.2)'}`, borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: (loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED') ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                          {loan.status === 'RENEWAL_REQUESTED' ? ' Pending...' : ' Renew'}
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

      {/* History Table */}
      {activeTab === 'history' && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              {tableHead(['Book', 'Author', 'Issue Date', 'Return Date', 'Status'])}
              <tbody>
                {borrowHistory.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No return history yet</td></tr>
                ) : borrowHistory.map(loan => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1a2e' }}>{loan.bookTitle}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{loan.bookAuthor}</td>
                    <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.82rem' }}>{loan.issueDate}</td>
                    <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.82rem' }}>{loan.returnDate || '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', borderRadius: 6, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}>RETURNED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooks;
