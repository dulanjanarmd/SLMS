import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
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
      const [popularRes, overdueRes, fineRes, inventoryRes, userRes] = await Promise.allSettled([
        reportAPI.getPopularBooks(10),
        reportAPI.getOverdueItems(),
        reportAPI.getFineCollection(),
        reportAPI.getInventory(),
        reportAPI.getUserActivity(),
      ]);
      if (popularRes.status === 'fulfilled') setPopularBooks(popularRes.value.data || []);
      if (overdueRes.status === 'fulfilled') setOverdueItems(overdueRes.value.data || []);
      if (fineRes.status === 'fulfilled') setFineReport(fineRes.value.data || {});
      if (inventoryRes.status === 'fulfilled') setInventoryReport(inventoryRes.value.data || {});
      if (userRes.status === 'fulfilled') setUserActivity(userRes.value.data || {});
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const inventoryData = inventoryReport ? {
    labels: ['Available', 'Issued', 'Reserved'],
    datasets: [{
      data: [inventoryReport.availableBooks, inventoryReport.issuedBooks, inventoryReport.reservedBooks],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }],
  } : null;

  const fineData = fineReport ? {
    labels: ['Paid', 'Unpaid', 'Waived', 'Partially Paid'],
    datasets: [{
      label: 'Count',
      data: [fineReport.paidFines, fineReport.unpaidFines, fineReport.waivedFines, 0],
      backgroundColor: ['#10b981', '#ef4444', '#64748b', '#f59e0b'],
      borderRadius: 8,
    }],
  } : null;

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    fontFamily: 'Poppins, sans-serif',
    background: isActive ? 'linear-gradient(135deg, #ef5a24, #ff8c5a)' : 'transparent',
    color: isActive ? 'white' : '#64748b',
    border: isActive ? 'none' : '1px solid #e8ecf0',
    transition: 'all 0.18s',
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '100px 20px 24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            Admin Portal
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Reports & Analytics</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>
            View library statistics, inventory reports, and fine collection data
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['overview', 'popular', 'overdue', 'fines', 'inventory'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>Inventory Distribution</div>
              {inventoryData && (
                <div style={{ height: '250px' }}>
                  <Doughnut data={inventoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Poppins, sans-serif' } } } } }} />
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>Fine Status Distribution</div>
              {fineData && (
                <div style={{ height: '250px' }}>
                  <Bar data={fineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: 8 }}>{userActivity?.totalUsers || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Registered Users</div>
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: 8 }}>{userActivity?.activeUsers || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Active Users</div>
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginBottom: 8 }}>{userActivity?.usersWithFines || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Users with Fines</div>
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0ea5e9', marginBottom: 8 }}>{userActivity?.totalBorrowRecords || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Borrow Records</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'popular' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 26px', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))', fontWeight: 700, fontSize: '0.95rem', color: '#4c1d95', fontFamily: 'Poppins, sans-serif', borderBottom: '1px solid #eef2ff' }}>
            Top 10 Most Borrowed Books
          </div>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 140px 120px 120px', gap: 14, padding: '16px 26px', fontWeight: 700, fontSize: '0.78rem', color: '#4c1d95', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #f1f5f9' }}>
              <div>#</div>
              <div>Title</div>
              <div>Author</div>
              <div>ISBN</div>
              <div>Total Borrows</div>
              <div>Available</div>
            </div>
            {popularBooks.map((book, idx) => (
              <div key={book.bookId} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 140px 120px 120px', gap: 14, padding: '16px 26px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{idx + 1}</div>
                <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{book.title}</div>
                <div style={{ color: '#374151', fontSize: '0.85rem' }}>{book.author}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{book.isbn}</div>
                <div><span style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{book.borrowCount} borrows</span></div>
                <div><span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{book.availableCopies}/{book.totalCopies}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overdue' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 26px', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.03))', fontWeight: 700, fontSize: '0.95rem', color: '#dc2626', fontFamily: 'Poppins, sans-serif', borderBottom: '1px solid #fee2e2' }}>
            Overdue Books ({overdueItems.length})
          </div>
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {overdueItems.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>No overdue items</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>All books have been returned on time.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 140px 2fr 140px 120px 120px 120px', gap: 14, padding: '16px 26px', fontWeight: 700, fontSize: '0.78rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #fee2e2' }}>
                  <div>User</div>
                  <div>Student ID</div>
                  <div>Book</div>
                  <div>ISBN</div>
                  <div>Due Date</div>
                  <div>Days Overdue</div>
                  <div>Fine (LKR)</div>
                </div>
                {overdueItems.map((item) => (
                  <div key={item.borrowId} style={{ display: 'grid', gridTemplateColumns: '2fr 140px 2fr 140px 120px 120px 120px', gap: 14, padding: '16px 26px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ color: '#374151', fontSize: '0.85rem' }}>{item.userName}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{item.studentStaffId}</div>
                    <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{item.bookTitle}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{item.isbn}</div>
                    <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{item.dueDate}</div>
                    <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>{item.overdueDays} days</div>
                    <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>{item.fineAmount.toFixed(2)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginBottom: 8 }}>LKR {(fineReport?.totalCollected || 0).toFixed(2)}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Collected</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>LKR {(fineReport?.totalOutstanding || 0).toFixed(2)}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Outstanding</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', marginBottom: 8 }}>{fineReport?.totalFinesIssued || 0}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Fines Issued</div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: 8 }}>{inventoryReport?.totalBooks || 0}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Books</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: 8 }}>{inventoryReport?.availableBooks || 0}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Available</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>{inventoryReport?.issuedBooks || 0}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Issued</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', textAlign: 'center', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginBottom: 8 }}>{inventoryReport?.reservedBooks || 0}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Reserved</div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Reports;
