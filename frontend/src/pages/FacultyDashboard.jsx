import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { borrowAPI, reservationAPI, fineAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [loansRes, reservationsRes, finesRes] = await Promise.allSettled([
        borrowAPI.getActiveLoans(user.id),
        reservationAPI.getUserReservations(user.id),
        fineAPI.getUnpaidFines(user.id),
      ]);
      if (loansRes.status === 'fulfilled') setActiveLoans(loansRes.value.data || []);
      if (reservationsRes.status === 'fulfilled') setReservations(reservationsRes.value.data || []);
      if (finesRes.status === 'fulfilled') setUnpaidFines(finesRes.value.data || []);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load dashboard.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i); }
  }, [user]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;

  const today = new Date();
  const totalFines = unpaidFines.reduce((acc, f) => acc + (f.amount || 0), 0);
  const pendingReservations = reservations.filter(r => r.status === 'PENDING');

  const quickLinks = [
    { to: '/my-books', icon: '📚', label: 'My Books', color: '#ef5a24' },
    { to: '/my-reservations', icon: '🔖', label: 'Reservations', color: '#f59e0b' },
    { to: '/my-fines', icon: '💳', label: 'My Fines', color: '#ef4444' },
    { to: '/books', icon: '🔍', label: 'Browse Catalog', color: '#10b981' },
    ...(!user?.isMember ? [{ to: '/membership', icon: '🪪', label: 'Apply Membership', color: '#0ea5e9' }] : []),
  ];

  const privileges = [
    { value: 10, label: 'Max Books', icon: '📚' },
    { value: 30, label: 'Days/Loan', icon: '📅' },
    { value: 2, label: 'Max Renewals', icon: '🔄' },
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 50%, #ef5a24 100%)', borderRadius: 20, padding: '32px 40px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 60, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Faculty Portal</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.7rem', margin: 0, marginBottom: 6 }}>
            🏫 Hello, {user?.fullName?.split(' ')[0] || 'Faculty'}!
          </h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.88rem' }}>Faculty library access dashboard</p>
        </div>
        {user?.isMember && (
          <div style={{ position: 'absolute', top: 24, right: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 2 }}>MEMBER</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.membershipId}</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📚', value: activeLoans.length, label: 'Active Loans', color: '#ef5a24', bg: 'rgba(239,90,36,0.1)', to: '/my-books' },
          { icon: '🔖', value: pendingReservations.length, label: 'Reservations', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', to: '/my-reservations' },
          { icon: '💳', value: `LKR ${totalFines.toFixed(0)}`, label: 'Fines Due', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', to: '/my-fines' },
        ].map(s => (
          <Link key={s.to} to={s.to} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '22px 20px', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = s.color + '60'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e8ecf0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Quick Access</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {quickLinks.map(ql => (
            <Link key={ql.to} to={ql.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: ql.color + '10', color: ql.color, borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1.5px solid ${ql.color}25`, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = ql.color; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ql.color + '10'; e.currentTarget.style.color = ql.color; }}
            >
              {ql.icon} {ql.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Faculty Privileges */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(239,90,36,0.04) 100%)', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6366f1', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>🏆 Your Faculty Borrowing Privileges</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {privileges.map(p => (
            <div key={p.label} style={{ textAlign: 'center', background: 'white', borderRadius: 12, padding: '20px', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{p.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>📚 Active Loans</span>
            <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{activeLoans.length}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              {['Book Title', 'Due Date', 'Status'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {activeLoans.length === 0 ? <tr><td colSpan={3} style={{ padding: '28px', textAlign: 'center', color: '#9ca3af' }}>No active loans</td></tr>
                : activeLoans.map(loan => {
                  const overdue = new Date(loan.dueDate) < today;
                  return <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1a1a2e' }}>{loan.bookTitle}</td>
                    <td style={{ padding: '12px 20px', color: overdue ? '#ef4444' : '#374151', fontWeight: overdue ? 600 : 400, fontSize: '0.82rem' }}>{loan.dueDate}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: overdue ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: overdue ? '#dc2626' : '#059669', borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {overdue ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>🔖 Reservations</span>
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{pendingReservations.length}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              {['Book', 'Queue #', 'Reserved On'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {pendingReservations.length === 0 ? <tr><td colSpan={3} style={{ padding: '28px', textAlign: 'center', color: '#9ca3af' }}>No pending reservations</td></tr>
                : pendingReservations.map(res => <tr key={res.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1a1a2e' }}>{res.bookTitle}</td>
                  <td style={{ padding: '12px 20px' }}><span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>#{res.queuePosition}</span></td>
                  <td style={{ padding: '12px 20px', fontSize: '0.82rem', color: '#374151' }}>{res.reservationDate ? new Date(res.reservationDate).toLocaleDateString() : '-'}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
