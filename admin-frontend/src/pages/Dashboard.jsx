import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, borrowAPI, reservationAPI } from '../services/api';
import { Spinner, Container, Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const S = {
  page: { padding: '100px 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' },
  banner: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
    borderRadius: '20px', padding: '32px 40px', color: 'white',
    marginBottom: '28px', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  card: {
    background: 'white', borderRadius: '16px',
    border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
};

const StatCard = ({ icon, value, label, color }) => {
  const colors = {
    orange: { bg: 'rgba(239,90,36,0.10)', text: '#ef5a24' },
    green:  { bg: 'rgba(16,185,129,0.10)', text: '#10b981' },
    red:    { bg: 'rgba(239,68,68,0.10)',  text: '#ef4444' },
    purple: { bg: 'rgba(99,102,241,0.10)', text: '#6366f1' },
    amber:  { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b' },
    pink:   { bg: 'rgba(244,114,182,0.10)', text: '#ec4899' },
  };
  const c = colors[color] || colors.orange;
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden', transition: 'all 0.22s',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: c.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, fontSize: '1.4rem', color: c.text,
      }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 6 }}>{label}</div>
    </div>
  );
};

const TableCard = ({ title, badge, badgeColor = '#ef4444', children }) => (
  <div style={{ ...S.card, marginBottom: 0 }}>
    <div style={{
      padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{title}</span>
      {badge !== undefined && (
        <span style={{
          background: badgeColor + '18', color: badgeColor, borderRadius: 6,
          padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700,
        }}>{badge}</span>
      )}
    </div>
    <div style={{ maxHeight: 300, overflowY: 'auto' }}>{children}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [todayLoans, setTodayLoans] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [statsRes, overdueRes, todayLoansRes, pendingRes] = await Promise.allSettled([
        reportAPI.getDashboardStats(),
        borrowAPI.getOverdue(),
        borrowAPI.getTodayLoans(),
        reservationAPI.getPending(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      else if (!stats) setError('Failed to load dashboard stats.');
      if (overdueRes.status === 'fulfilled') setOverdueLoans(overdueRes.value.data || []);
      if (todayLoansRes.status === 'fulfilled') setTodayLoans(todayLoansRes.value.data || []);
      if (pendingRes.status === 'fulfilled') setPendingReservations(pendingRes.value.data || []);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const usersByRole = stats?.usersByRole || {};

  const bookStatusData = {
    labels: ['Available', 'Active Loans', 'Pending Reservations'],
    datasets: [{
      data: [
        Math.max(0, (stats?.totalBooks || 0) - (stats?.activeLoans || 0)),
        stats?.activeLoans || 0,
        stats?.pendingReservations || 0,
      ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  const loanActivityData = {
    labels: ["Today's Loans", "Today's Returns", 'Active Loans', 'Overdue'],
    datasets: [{
      label: 'Count',
      data: [stats?.todayLoans || 0, stats?.todayReturns || 0, stats?.activeLoans || 0, stats?.overdueLoans || 0],
      backgroundColor: ['#ef5a24', '#10b981', '#6366f1', '#ef4444'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  if (loading && !stats) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  if (error && !stats) return (
    <div style={S.page}>
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button size="sm" variant="outline-danger" onClick={fetchData}>Retry</Button>
        </div>
      </Alert>
    </div>
  );

  const quickActions = [
    { to: '/users',      label: 'Manage Users',   icon: '', color: '#ef5a24' },
    { to: '/books',      label: 'Manage Books',   icon: '', color: '#10b981' },
    { to: '/categories', label: 'Categories',     icon: '', color: '#6366f1' },
    { to: '/reports',    label: 'Reports',        icon: '', color: '#f59e0b' },
    { to: '/books',      label: 'Inventory',      icon: '', color: '#0ea5e9' },
    { to: '/reports',    label: 'Audit Logs',     icon: '', color: '#ec4899' },
  ];

  return (
    <div style={S.page} className="animate-fade-in">
      {/* Banner */}
      <div style={S.banner}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>
            Admin Portal
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>Dashboard</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif' }}>
            Real-time overview of library operations
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={{
            background: refreshing ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'white', borderRadius: 10, padding: '10px 20px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
            position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: refreshing ? 0.75 : 1,
            transition: 'all 0.2s',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              fontSize: '1rem',
            }}
          >
            🔄
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {quickActions.map(a => (
          <Link
            key={a.label}
            to={a.to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '18px 12px', background: 'white', borderRadius: 14,
              border: '1.5px solid #e8ecf0', textDecoration: 'none',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontFamily: 'Poppins, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = a.color;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e8ecf0';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{a.icon}</span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#374151', textAlign: 'center' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="" value={stats?.totalUsers || 0} label="Total Users" color="purple" />
        <StatCard icon="" value={stats?.totalBooks || 0} label="Total Books" color="green" />
        <StatCard icon="" value={stats?.totalCategories || 0} label="Categories" color="pink" />
        <StatCard icon="" value={stats?.activeLoans || 0} label="Active Loans" color="amber" />
        <StatCard icon="" value={stats?.overdueLoans || 0} label="Overdue" color="red" />
        <StatCard icon="" value={`LKR ${(stats?.outstandingFines || 0).toFixed(0)}`} label="Fines Due" color="orange" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 28 }}>
        <div style={S.card}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e', fontFamily: 'Poppins, sans-serif' }}>
            Book Status
          </div>
          <div style={{ padding: 20, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={bookStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { font: { family: 'Poppins' }, padding: 16 } },
                },
              }}
            />
          </div>
          {/* Role breakdown (moved from the first stat card) */}
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Students: {usersByRole.STUDENT || 0}
              </span>
              <span style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Faculty: {usersByRole.FACULTY || 0}
              </span>
              <span style={{ background: 'rgba(16,185,129,0.10)', color: '#059669', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Librarians: {usersByRole.LIBRARIAN || 0}
              </span>
              <span style={{ background: 'rgba(239,68,68,0.10)', color: '#dc2626', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Admins: {usersByRole.ADMIN || 0}
              </span>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e', fontFamily: 'Poppins, sans-serif' }}>
            Loan Activity
          </div>
          <div style={{ padding: 20, height: 340 }}>
            <Bar
              data={loanActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { family: 'Poppins' } },
                    grid: { color: '#f1f5f9' },
                  },
                  x: {
                    ticks: { font: { family: 'Poppins' } },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <TableCard title="Overdue Loans" badge={overdueLoans.length} badgeColor="#ef4444">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Book', 'Due Date', 'Fine'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                      fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9',
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overdueLoans.length === 0
                ? <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No overdue loans</td></tr>
                : overdueLoans.slice(0, 8).map(loan => {
                    const days = Math.floor((new Date() - new Date(loan.dueDate)) / 86400000);
                    return (
                      <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{loan.userName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{loan.studentStaffId}</div>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#374151' }}>{loan.bookTitle}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.82rem' }}>{loan.dueDate}</span>
                          <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{days}d overdue</div>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#ef4444', fontWeight: 700 }}>LKR {(days * 5).toFixed(0)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Today's Loans" badge={todayLoans.length} badgeColor="#10b981">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Book', 'Due', 'Status'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                      fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9',
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayLoans.length === 0
                ? <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No loans today</td></tr>
                : todayLoans.map(loan => (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{loan.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{loan.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#374151' }}>{loan.bookTitle}</td>
                      <td style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#374151' }}>{loan.dueDate}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          background: loan.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                          color: loan.status === 'ACTIVE' ? '#10b981' : '#64748b',
                          borderRadius: 6, padding: '3px 10px', fontSize: '0.73rem', fontWeight: 700,
                        }}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </TableCard>
      </div>

      {/* Pending Reservations */}
      <div style={{ ...S.card, marginBottom: 0 }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', fontFamily: 'Poppins, sans-serif' }}>
            Pending Reservations
          </span>
          <span style={{
            background: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderRadius: 6,
            padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
          }}>{pendingReservations.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Book', 'Queue #', 'Reserved On'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 20px', textAlign: 'left', fontWeight: 600,
                      fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingReservations.length === 0
                ? <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No pending reservations</td></tr>
                : pendingReservations.map(res => (
                    <tr key={res.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{res.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{res.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#374151' }}>{res.bookTitle}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700,
                        }}>#{res.queuePosition}</span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.82rem', color: '#374151' }}>
                        {new Date(res.reservationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
