import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [popularBooks, setPopularBooks] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [fineReport, setFineReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const [popularRes, overdueRes, fineRes, inventoryRes, userRes] = await Promise.all([
        reportAPI.getPopularBooks(10), reportAPI.getOverdueItems(), reportAPI.getFineCollection(), reportAPI.getInventory(), reportAPI.getUserActivity(),
      ]);
      setPopularBooks(popularRes.data); setOverdueItems(overdueRes.data); setFineReport(fineRes.data); setInventoryReport(inventoryRes.data); setUserActivity(userRes.data);
    } catch { console.error('Failed to fetch reports'); }
    finally { setLoading(false); }
  };

  const inventoryData = inventoryReport ? {
    labels: ['Available', 'Issued', 'Reserved'],
    datasets: [{ data: [inventoryReport.availableBooks, inventoryReport.issuedBooks, inventoryReport.reservedBooks], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], borderWidth: 0 }],
  } : null;

  const fineData = fineReport ? {
    labels: ['Paid', 'Unpaid', 'Waived', 'Partially Paid'],
    datasets: [{ label: 'Count', data: [fineReport.paidFines, fineReport.unpaidFines, fineReport.waivedFines, 0], backgroundColor: ['#10b981', '#ef4444', '#64748b', '#f59e0b'], borderRadius: 8 }],
  } : null;

  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
  const tabStyle = (isActive) => ({ padding: '12px 24px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: isActive ? '3px solid #1a1a2e' : '3px solid transparent', color: isActive ? '#1a1a2e' : '#64748b', transition: 'all 0.2s', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily: 'Poppins, sans-serif' });

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #4c1d95 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> Reports & Analytics</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Deep dive into library metrics and usage data</p>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e8ecf0', marginBottom: 24 }}>
        <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle(activeTab === 'books')} onClick={() => setActiveTab('books')}>Popular Books</button>
        <button style={tabStyle(activeTab === 'overdue')} onClick={() => setActiveTab('overdue')}>Overdue Items</button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {inventoryData && (
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px' }}>Inventory Distribution</h3>
              <div style={{ height: 300 }}><Doughnut data={inventoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 12 } } } } }} /></div>
            </div>
          )}
          {fineData && (
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px' }}>Fine Collection Stats</h3>
              <div style={{ height: 300 }}><Bar data={fineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'books' && (
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px' }}>Top 10 Most Popular Books</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['Book Title', 'Author', 'ISBN', 'Borrow Count'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {popularBooks.length === 0 ? <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No data available</td></tr> : popularBooks.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : '#f1f5f9', color: i < 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{i + 1}</div>
                        <span style={{ fontWeight: 700, color: '#1a1a2e' }}>{b.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{b.author}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{b.isbn}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0ea5e9' }}>{b.borrowCount} Times</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overdue' && (
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Currently Overdue Items
            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem' }}>{overdueItems.length}</span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['Borrower', 'Book', 'Issue Date', 'Due Date', 'Days Overdue'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {overdueItems.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No overdue items.</td></tr> : overdueItems.map((o, i) => {
                  const days = Math.ceil((new Date() - new Date(o.dueDate)) / 86400000);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: 'rgba(239,68,68,0.02)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{o.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.studentStaffId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{o.bookTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.isbn}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>{o.issueDate}</td>
                      <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: 600 }}>{o.dueDate}</td>
                      <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: 800 }}>{days} Days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
