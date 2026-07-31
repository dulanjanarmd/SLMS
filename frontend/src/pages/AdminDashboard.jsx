import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true); setError(null);
    try { const res = await reportAPI.getDashboardStats(); setStats(res.data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load dashboard data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;
  if (error) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>️</div>
      <h2 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>{error}</h2>
      <button onClick={fetchStats} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Retry</button>
    </div>
  );

  const usersByRole = stats?.usersByRole || {};

  const statCards = [
    { title: 'Total Books', val: stats?.totalBooks || 0, icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'Active Loans', val: stats?.activeLoans || 0, icon: '', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { title: 'Pending Reservations', val: stats?.pendingReservations || 0, icon: '', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { title: 'Overdue Books', val: stats?.overdueLoans || 0, icon: '️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #4c1d95 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}>️ Admin Dashboard</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>System overview and high-level statistics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, marginBottom: 24 }}>
        {/* User Summary Card */}
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(76,29,149,0.1)', color: '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}></div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{stats?.totalUsers || 0}</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Users</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { l: 'Students', v: usersByRole.STUDENT, c: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { l: 'Faculty', v: usersByRole.FACULTY, c: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
              { l: 'Librarians', v: usersByRole.LIBRARIAN, c: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
              { l: 'Admins', v: usersByRole.ADMIN, c: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
            ].map(r => (
              <div key={r.l} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{r.l}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.c }}></span>
                  {r.v || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {statCards.map(s => (
            <div key={s.title} style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
