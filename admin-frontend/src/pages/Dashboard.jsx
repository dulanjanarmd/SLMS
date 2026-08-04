import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, borrowAPI, reservationAPI } from '../services/api';
import { Spinner, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const S = {
  page: { padding: '100px 24px 24px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  banner: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
    borderRadius: '20px', padding: '32px 40px', color: 'white',
    marginBottom: '28px', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
  },
  card: {
    background: 'white', borderRadius: '16px',
    border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
};

const StatCard = ({ value, label, subtext, color }) => {
  const colors = {
    orange: { border: '#ef5a24', bg: 'rgba(239,90,36,0.08)', text: '#ef5a24' },
    green:  { border: '#10b981', bg: 'rgba(16,185,129,0.08)', text: '#10b981' },
    red:    { border: '#ef4444', bg: 'rgba(239,68,68,0.08)',  text: '#ef4444' },
    purple: { border: '#6366f1', bg: 'rgba(99,102,241,0.08)', text: '#6366f1' },
    amber:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#f59e0b' },
    teal:   { border: '#14b8a6', bg: 'rgba(20,184,166,0.08)', text: '#14b8a6' },
    blue:   { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', text: '#3b82f6' },
    indigo: { border: '#4338ca', bg: 'rgba(99,102,241,0.08)', text: '#4338ca' }
  };
  const c = colors[color] || colors.orange;
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '22px 24px',
      border: '1px solid #e8ecf0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        {subtext && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: c.bg, color: c.text, padding: '3px 8px', borderRadius: 6 }}>
            {subtext}
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{value ?? 0}</div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [todayLoans, setTodayLoans] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else if (!stats) setLoading(true);
    setError(null);
    try {
      const [statsRes, overdueRes, todayLoansRes, pendingRes] = await Promise.allSettled([
        reportAPI.getDashboardStats(),
        borrowAPI.getOverdue(),
        borrowAPI.getTodayLoans(),
        reservationAPI.getPending(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      else if (!stats) setError('Failed to load live dashboard stats.');
      if (overdueRes.status === 'fulfilled') setOverdueLoans(overdueRes.value.data || []);
      if (todayLoansRes.status === 'fulfilled') setTodayLoans(todayLoansRes.value.data || []);
      if (pendingRes.status === 'fulfilled') setPendingReservations(pendingRes.value.data || []);
      setLastSync(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to refresh live data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const resourceDistributionData = {
    labels: ['Physical Books', 'eBooks', 'Past Papers', 'Research Papers'],
    datasets: [{
      data: [
        stats?.totalBooks || 0,
        stats?.totalEBooks || 0,
        stats?.totalPastPapers || 0,
        stats?.totalResearchPapers || 0,
      ],
      backgroundColor: ['#ef5a24', '#3b82f6', '#10b981', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  const loanStatusData = {
    labels: ["Today's Loans", "Today's Returns", 'Active Loans', 'Overdue Loans'],
    datasets: [{
      label: 'Count',
      data: [
        stats?.todayLoans || 0,
        stats?.todayReturns || 0,
        stats?.activeLoans || 0,
        stats?.overdueLoans || 0,
      ],
      backgroundColor: ['#ef5a24', '#10b981', '#6366f1', '#ef4444'],
      borderRadius: 8,
    }],
  };

  if (loading && !stats) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  return (
    <div style={S.page}>
      {/* Top Banner */}
      <div style={S.banner}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: '#10b981',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.85, color: 'white' }}>
              Live System Active {lastSync && `| Last Synced: ${lastSync}`}
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>
            Dashboard
          </h1>
          <p style={{ opacity: 0.8, margin: 0, fontSize: '0.9rem', color: 'white' }}>
            Real-time operations and library statistics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
              opacity: refreshing ? 0.75 : 1, transition: 'all 0.15s',
            }}
          >
            {refreshing ? 'Refreshing...' : 'Live Sync'}
          </button>
        </div>
      </div>

      {error && <Alert variant="danger" style={{ borderRadius: 12, marginBottom: 24 }}>{error}</Alert>}

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 28 }}>
        <StatCard value={stats?.totalUsers} label="Total Registered Users" subtext={`${stats?.totalStudents || 0} Students`} color="blue" />
        <StatCard value={stats?.totalBooks} label="Physical Catalog Books" color="orange" />
        <StatCard value={stats?.totalEBooks} label="Digital eBooks" color="green" />
        <StatCard value={stats?.totalPastPapers} label="Past Exam Papers" color="teal" />
        <StatCard value={stats?.totalResearchPapers} label="Research Papers" color="purple" />
        <StatCard value={stats?.activeLoans} label="Active Borrowed Loans" color="indigo" />
        <StatCard value={stats?.overdueLoans} label="Overdue Loans" color="red" />
        <StatCard value={`Rs. ${(stats?.totalFinesCollected || 0).toFixed(2)}`} label="Total Fines Collected" color="amber" />
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 28 }}>
        <div style={{ ...S.card, padding: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Resource Distribution</h3>
          <div style={{ height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Doughnut data={resourceDistributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div style={{ ...S.card, padding: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Circulation Status</h3>
          <div style={{ height: 260 }}>
            <Bar data={loanStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Real-Time Monitoring Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        <div style={S.card}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>Overdue Loans</span>
            <span style={{ background: '#fee2e2', color: '#ef4444', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              {overdueLoans.length} Overdue
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 16 }}>
            {overdueLoans.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No overdue loans active.</div>
            ) : (
              overdueLoans.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e' }}>{item.bookTitle || item.book?.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Borrowed by: {item.userName || item.user?.fullName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}>Due: {item.dueDate}</div>
                    <Link to="/reports" style={{ fontSize: '0.72rem', color: '#ef5a24', fontWeight: 600 }}>View Details</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>Today's Borrowings</span>
            <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              {todayLoans.length} Issued Today
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 16 }}>
            {todayLoans.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No books issued today yet.</div>
            ) : (
              todayLoans.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e' }}>{item.bookTitle || item.book?.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>User: {item.userName || item.user?.fullName}</div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
