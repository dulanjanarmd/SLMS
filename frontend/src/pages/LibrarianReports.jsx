import React, { useState, useEffect } from 'react';
import { reportAPI, borrowAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const LibrarianReports = () => {
  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [fineReport, setFineReport] = useState(null);
  const [todayLoans, setTodayLoans] = useState([]);
  const [todayReturns, setTodayReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchAll(); const intv = setInterval(fetchAll, 30000); return () => clearInterval(intv); }, []);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [s, p, o, i, f, tl, tr] = await Promise.allSettled([
        reportAPI.getDashboardStats(), reportAPI.getPopularBooks(10), reportAPI.getOverdueItems(), reportAPI.getInventory(), reportAPI.getFineCollection(), borrowAPI.getTodayLoans(), borrowAPI.getTodayReturns(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (p.status === 'fulfilled') setPopularBooks(p.value.data || []);
      if (o.status === 'fulfilled') setOverdueItems(o.value.data || []);
      if (i.status === 'fulfilled') setInventory(i.value.data || {});
      if (f.status === 'fulfilled') setFineReport(f.value.data || {});
      if (tl.status === 'fulfilled') setTodayLoans(tl.value.data || []);
      if (tr.status === 'fulfilled') setTodayReturns(tr.value.data || []);
    } catch { setError('Failed to load report data.'); }
    finally { setLoading(false); }
  };

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
    const b = new Blob([csv], { type: 'text/csv' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = filename; a.click();
    URL.revokeObjectURL(u);
  };

  const inventoryChartData = inventory ? {
    labels: ['Available', 'Issued', 'Reserved', 'Unavailable'],
    datasets: [{ data: [inventory.availableBooks||0, inventory.issuedBooks||0, inventory.reservedBooks||0, inventory.unavailableBooks||0], backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#64748b'], borderWidth: 0 }],
  } : null;

  const activityChartData = stats ? {
    labels: ["Today's Loans", "Today's Returns", 'Active Loans', 'Overdue'],
    datasets: [{ label: 'Count', data: [stats.todayLoans||0, stats.todayReturns||0, stats.activeLoans||0, stats.overdueLoans||0], backgroundColor: ['#0ea5e9', '#10b981', '#8b5cf6', '#ef4444'], borderRadius: 6 }],
  } : null;

  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
  const tabStyle = (isActive) => ({ padding: '12px 24px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: isActive ? '3px solid #1a1a2e' : '3px solid transparent', color: isActive ? '#1a1a2e' : '#64748b', transition: 'all 0.2s', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily: 'Poppins, sans-serif' });

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #1a365d 50%, #059669 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}>📊 Librarian Reports</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Daily operations and comprehensive library statistics</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e8ecf0', marginBottom: 24 }}>
        <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle(activeTab === 'today')} onClick={() => setActiveTab('today')}>Today's Activity</button>
        <button style={tabStyle(activeTab === 'fines')} onClick={() => setActiveTab('fines')}>Fines & Overdue</button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {inventoryChartData && (
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px' }}>Current Inventory Status</h3>
              <div style={{ height: 300 }}><Doughnut data={inventoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 12 } } } } }} /></div>
            </div>
          )}
          {activityChartData && (
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px' }}>Circulation Activity</h3>
              <div style={{ height: 300 }}><Bar data={activityChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📤 Issued Today
                <span style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem' }}>{todayLoans.length}</span>
              </h3>
              <button onClick={() => exportCSV(todayLoans, 'today_issues.csv')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead><tr style={{ background: 'white' }}>{['Book', 'Borrower', 'Time', 'Due Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {todayLoans.length === 0 ? <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No books issued today.</td></tr> : todayLoans.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{l.bookTitle}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.isbn}</div></td>
                      <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{l.userName}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.studentStaffId}</div></td>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>{new Date(l.issueDate).toLocaleTimeString()}</td>
                      <td style={{ padding: '16px 20px', color: '#374151', fontWeight: 600 }}>{l.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📥 Returned Today
                <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem' }}>{todayReturns.length}</span>
              </h3>
              <button onClick={() => exportCSV(todayReturns, 'today_returns.csv')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead><tr style={{ background: 'white' }}>{['Book', 'Borrower', 'Time Returned', 'Fine Paid'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {todayReturns.length === 0 ? <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No books returned today.</td></tr> : todayReturns.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{r.bookTitle}</div></td>
                      <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{r.userName}</div></td>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>{new Date(r.returnDate).toLocaleTimeString()}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: r.fineAmount > 0 ? '#ef4444' : '#10b981' }}>{r.fineAmount > 0 ? `LKR ${r.fineAmount.toFixed(2)}` : 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {fineReport && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { l: 'Total Outstanding Fines', v: `LKR ${(fineReport.totalOutstanding || 0).toFixed(2)}`, c: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                { l: 'Total Collected Fines', v: `LKR ${(fineReport.totalCollected || 0).toFixed(2)}`, c: '#10b981', bg: 'rgba(16,185,129,0.1)' }
              ].map(f => (
                <div key={f.l} style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: f.c }}>💰</div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: f.c, lineHeight: 1 }}>{f.v}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginTop: 4 }}>{f.l}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Currently Overdue Items
                <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem' }}>{overdueItems.length}</span>
              </h3>
              <button onClick={() => exportCSV(overdueItems, 'overdue_items.csv')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead><tr style={{ background: 'white' }}>{['Borrower', 'Contact', 'Book', 'Due Date', 'Days Overdue'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {overdueItems.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No overdue items.</td></tr> : overdueItems.map((o, i) => {
                    const days = Math.ceil((new Date() - new Date(o.dueDate)) / 86400000);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: 'rgba(239,68,68,0.02)' }}>
                        <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{o.userName}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.studentStaffId}</div></td>
                        <td style={{ padding: '16px 20px', color: '#64748b' }}>{o.userEmail}</td>
                        <td style={{ padding: '16px 20px' }}><div style={{ fontWeight: 700, color: '#1a1a2e' }}>{o.bookTitle}</div></td>
                        <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: 600 }}>{o.dueDate}</td>
                        <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: 800 }}>{days} Days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarianReports;