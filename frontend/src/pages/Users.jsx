import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { fetchUsers(); }, [currentPage]);

  const fetchUsers = async () => {
    try { setLoading(true); const res = await userAPI.getAllUsers({ page: currentPage, size: 15, sort: 'createdAt,desc' }); setUsers(res.data.content); setTotalPages(res.data.totalPages); }
    catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try { setLoading(true); const res = await userAPI.getAllUsers({ keyword: searchKeyword, page: 0, size: 15 }); setUsers(res.data.content); setTotalPages(res.data.totalPages); setCurrentPage(0); }
    catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try { setError(''); setSuccess('');
      if (currentStatus) { await userAPI.deactivateUser(id); setSuccess('User deactivated'); }
      else { await userAPI.activateUser(id); setSuccess('User activated'); }
      fetchUsers(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Action failed'); }
  };

  const handleChangeRole = async (id, newRole) => {
    try { setError(''); setSuccess(''); await userAPI.changeRole(id, newRole); setSuccess(`Role updated to ${newRole}`); fetchUsers(); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.response?.data?.message || 'Failed to change role'); }
  };

  const getRoleStyle = (role) => {
    switch(role) {
      case 'ADMIN': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
      case 'LIBRARIAN': return { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' };
      case 'FACULTY': return { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9' };
      case 'STUDENT': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
      default: return { bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
    }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const thStyle = { padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: '0.73rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #4c1d95 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>👥 User Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Manage library members, staff and their roles</p>
        </div>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>✅ {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}>🔍</span>
            <input type="text" placeholder="Search by name, email, or ID..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 42, background: 'white' }}
              onFocus={e => { e.target.style.borderColor = '#4c1d95'; e.target.style.boxShadow = '0 0 0 3px rgba(76,29,149,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #1a1a2e, #4c1d95)', color: 'white', border: 'none', borderRadius: 10, padding: '0 28px', height: 46, fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0 }}>Registered Users</h3>
          <button onClick={fetchUsers} style={{ background: 'none', border: 'none', color: '#4c1d95', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#4c1d95' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ background: 'white' }}>{['User Info', 'Role', 'Status', 'Account Details', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', background: !u.isActive ? 'rgba(239,68,68,0.02)' : 'white' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                          {u.fullName?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{u.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: {u.studentStaffId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: getRoleStyle(u.role).bg, color: getRoleStyle(u.role).color, borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {u.role}
                      </span>
                      {u.isMember && <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: '1rem' }}>🪪</span> Member</div>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: u.isActive ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.8rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive ? '#10b981' : '#ef4444' }}></span>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8rem' }}>
                      <div style={{ marginBottom: 4 }}><span style={{ color: '#9ca3af' }}>Joined:</span> {new Date(u.createdAt).toLocaleDateString()}</div>
                      {u.isMember && (
                        <>
                          <div style={{ marginBottom: 4 }}><span style={{ color: '#9ca3af' }}>Borrows:</span> <span style={{ fontWeight: 600, color: '#374151' }}>{u.currentBorrowCount} / {u.maxBooksAllowed}</span></div>
                          <div><span style={{ color: '#9ca3af' }}>Fine:</span> <span style={{ fontWeight: 600, color: u.outstandingFine > 0 ? '#ef4444' : '#10b981' }}>LKR {u.outstandingFine?.toFixed(2) || '0.00'}</span></div>
                        </>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={() => handleToggleActive(u.id, u.isActive)} style={{ background: u.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: u.isActive ? '#ef4444' : '#10b981', border: `1.5px solid ${u.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: 100 }}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <select value="" onChange={(e) => { if(e.target.value) handleChangeRole(u.id, e.target.value); }} style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.75rem', height: 'auto', width: 100, borderColor: '#e2e8f0', cursor: 'pointer' }}>
                          <option value="" disabled>Change Role</option>
                          {['STUDENT', 'FACULTY', 'LIBRARIAN', 'ADMIN'].filter(r => r !== u.role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e8ecf0', background: 'white', color: currentPage === 0 ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}>Prev</button>
            <div style={{ padding: '6px 16px', background: '#f8fafc', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Page {currentPage + 1} of {totalPages}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages-1, p+1))} disabled={currentPage === totalPages-1} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e8ecf0', background: 'white', color: currentPage === totalPages-1 ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === totalPages-1 ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;