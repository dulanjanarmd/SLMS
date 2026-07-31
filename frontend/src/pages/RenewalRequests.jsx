import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const RenewalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'deny', loan }
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try { setLoading(true); const res = await borrowAPI.getRenewalRequests(); setRequests(res?.data || []); }
    catch { setError('Failed to load renewal requests.'); setRequests([]); }
    finally { setLoading(false); }
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      if (actionModal.type === 'approve') {
        await borrowAPI.approveRenewal(actionModal.loan.id);
        setSuccess(`Renewal approved for "${actionModal.loan.bookTitle}" — ${actionModal.loan.userName}.`);
      } else {
        await borrowAPI.denyRenewal(actionModal.loan.id);
        setSuccess(`Renewal denied for "${actionModal.loan.bookTitle}" — ${actionModal.loan.userName}.`);
      }
      setActionModal(null); fetchRequests(); setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Action failed.'); setActionModal(null); }
    finally { setProcessing(false); }
  };

  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1a365d 50%, #0ea5e9 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> Renewal Requests</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Approve or deny member requests to extend book loans</p>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}> {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>️ {error}</div>}

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            Pending Requests <span style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', padding: '2px 8px', borderRadius: 999, fontSize: '0.8rem' }}>{requests.length}</span>
          </h3>
          <button onClick={fetchRequests} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}> Refresh</button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          {loading && requests.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#0ea5e9' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['Borrower', 'Book', 'Issue Date', 'Current Due Date', 'Renewals', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No pending renewal requests.</td></tr>
                ) : requests.map(loan => {
                  const isOverdue = new Date(loan.dueDate) < new Date();
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc', background: 'white' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{loan.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{loan.bookTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.isbn}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>{loan.issueDate}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ color: isOverdue ? '#ef4444' : '#374151', fontWeight: isOverdue ? 700 : 500 }}>{loan.dueDate}</span>
                        {isOverdue && <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 2 }}>Currently Overdue</div>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontWeight: 800 }}>{loan.renewCount}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setActionModal({ type: 'approve', loan })} style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
                            Approve
                          </button>
                          <button onClick={() => setActionModal({ type: 'deny', loan })} style={{ flex: 1, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: actionModal.type === 'approve' ? '#065f46' : '#991b1b', marginBottom: 20 }}>
              {actionModal.type === 'approve' ? ' Approve Renewal' : '️ Deny Renewal'}
            </h3>
            
            <div style={{ background: actionModal.type === 'approve' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', borderRadius: 12, padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, border: `1px solid ${actionModal.type === 'approve' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              Are you sure you want to {actionModal.type} the renewal request for <strong>"{actionModal.loan.bookTitle}"</strong> by <strong>{actionModal.loan.userName}</strong>?
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setActionModal(null)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handleAction} disabled={processing} style={{ flex: 1, padding: '12px', background: actionModal.type === 'approve' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: actionModal.type === 'approve' ? '0 8px 24px rgba(16,185,129,0.3)' : 'none' }}>
                {processing ? <Spinner size="sm" /> : `Confirm ${actionModal.type === 'approve' ? 'Approve' : 'Deny'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewalRequests;
