import React, { useState } from 'react';

const AuditLogs = () => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [logs, setLogs] = useState([
    { id: 101, action: 'User Deletion', user: 'Admin System', target: 'user_42@sliit.lk', category: 'Security', timestamp: '2026-08-04 14:10', details: 'User account deleted after safety checks verified zero active loans.' },
    { id: 102, action: 'Fine Waived', user: 'Admin Officer', target: 'Fine #89 (Rs. 150.00)', category: 'Financial', timestamp: '2026-08-04 13:45', details: 'Medical excuse provided by student.' },
    { id: 103, action: 'Broadcast Sent', user: 'Admin Portal', target: 'All Students', category: 'System', timestamp: '2026-08-04 12:30', details: 'System announcement: Library Hours Extended.' },
    { id: 104, action: 'eBook Upload', user: 'Librarian Head', target: 'Clean Architecture (eBook)', category: 'Inventory', timestamp: '2026-08-04 11:15', details: 'New PDF eBook added to digital collection.' },
    { id: 105, action: 'Role Update', user: 'Admin System', target: 'john.d@sliit.lk (STUDENT -> LIBRARIAN)', category: 'Security', timestamp: '2026-08-03 16:50', details: 'Role upgraded to LIBRARIAN.' },
    { id: 106, action: 'Past Paper Upload', user: 'Exam Unit', target: 'IT3010 Past Paper 2025', category: 'Inventory', timestamp: '2026-08-03 10:20', details: 'Semester 1 exam paper uploaded.' },
  ]);

  const filteredLogs = logs.filter(log => {
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSearch = !searchKeyword ||
      log.action.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.user.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.target.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const exportLogsCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = Object.keys(filteredLogs[0]).join(',');
    const rows = filteredLogs.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const inputStyle = {
    padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
    fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#f8fafc',
  };

  return (
    <div style={{ padding: '100px 20px 24px 20px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>System Audit Logs</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Security activity logs, administrative changes, and system event tracking</p>
        </div>
        <button
          onClick={exportLogsCSV}
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'white', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
            backdropFilter: 'blur(8px)',
          }}
        >
          Export Logs CSV
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <input
          type="text"
          placeholder="Search by action, user, or target..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          style={{ ...inputStyle, width: 300 }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'Security', 'Financial', 'Inventory', 'System'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                background: categoryFilter === cat ? '#1a1a2e' : '#f1f5f9',
                color: categoryFilter === cat ? 'white' : '#475569',
                border: 'none', transition: 'all 0.15s'
              }}
            >
              {cat === 'ALL' ? 'All Logs' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: 14 }}>Log ID</th>
                <th style={{ padding: 14 }}>Action</th>
                <th style={{ padding: 14 }}>Category</th>
                <th style={{ padding: 14 }}>Performed By</th>
                <th style={{ padding: 14 }}>Target Resource</th>
                <th style={{ padding: 14 }}>Timestamp</th>
                <th style={{ padding: 14 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No audit logs match your search filter.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 14, fontWeight: 700, color: '#64748b' }}>#{log.id}</td>
                    <td style={{ padding: 14, fontWeight: 700, color: '#1a1a2e' }}>{log.action}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        background: log.category === 'Security' ? '#fee2e2' : log.category === 'Financial' ? '#dcfce7' : '#e0e7ff',
                        color: log.category === 'Security' ? '#ef4444' : log.category === 'Financial' ? '#166534' : '#4338ca',
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {log.category}
                      </span>
                    </td>
                    <td style={{ padding: 14, fontWeight: 600 }}>{log.user}</td>
                    <td style={{ padding: 14, color: '#ef5a24', fontWeight: 600 }}>{log.target}</td>
                    <td style={{ padding: 14, color: '#64748b', fontSize: '0.82rem' }}>{log.timestamp}</td>
                    <td style={{ padding: 14, color: '#475569', fontSize: '0.82rem' }}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
