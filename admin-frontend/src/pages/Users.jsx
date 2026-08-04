import { userAPI, notificationAPI } from '../services/api';

const inputStyle = {
  borderRadius: 12,
  padding: '11px 14px',
  fontFamily: 'Poppins, sans-serif',
  background: '#f8fafc',
  border: '1.5px solid #e5e7eb',
  fontSize: '0.88rem',
  color: '#1f2937',
  outline: 'none',
  width: '100%',
  transition: 'all 0.18s',
};

const focusStyle = { borderColor: '#ef5a24', boxShadow: '0 0 0 3px rgba(239,90,36,0.12)', background: '#fff' };

const ActionBtn = ({ onClick, color, bg, border, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      flex: 1,
      minWidth: 0,
      padding: '7px 8px',
      background: bg,
      color: color,
      border: border || 'none',
      borderRadius: 6,
      fontSize: '0.72rem',
      fontWeight: 700,
      fontFamily: 'Poppins, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'transform 0.15s, opacity 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
    onMouseLeave={e => !disabled && (e.currentTarget.style.transform = '')}
  >
    {children}
  </button>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '', studentStaffId: '', email: '', password: '', phoneNumber: '', faculty: '', programme: ''
  });
  const [focusField, setFocusField] = useState(null);

  useEffect(() => { fetchUsers(); }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 15, sort: 'createdAt,desc' };
      if (searchKeyword) params.keyword = searchKeyword;
      const response = await userAPI.getAllUsers(params);
      let data = response.data?.content || [];
      if (roleFilter) data = data.filter(u => u.role === roleFilter);
      setUsers(data);
      setTotalPages(response.data?.totalPages || 0);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setError(''); setSuccess('');
      if (currentStatus) {
        await userAPI.deactivateUser(id);
        setSuccess('User deactivated successfully.');
      } else {
        await userAPI.activateUser(id);
        setSuccess('User activated successfully.');
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleChangeRole = async () => {
    try {
      setError(''); setSuccess('');
      await userAPI.changeRole(selectedUser.id, newRole);
      setSuccess(`Role updated to ${newRole} for ${selectedUser.fullName}.`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      await userAPI.createLibrarian(createForm);
      setSuccess('Librarian account created successfully.');
      setShowCreateModal(false);
      setCreateForm({ fullName: '', studentStaffId: '', email: '', password: '', phoneNumber: '', faculty: '', programme: '' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create librarian');
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openMessageModal = (user) => {
    setSelectedUser(user);
    setMsgTitle('');
    setMsgContent('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgContent.trim() || !selectedUser) return;
    setSendingMsg(true); setError(''); setSuccess('');
    try {
      await notificationAPI.sendDirectToUser(selectedUser.id, msgTitle, msgContent);
      setSuccess(`Direct message sent to ${selectedUser.fullName}. It will appear in their notification bell.`);
      setShowMessageModal(false);
      setMsgTitle(''); setMsgContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setError(''); setSuccess('');
      await userAPI.deleteUser(selectedUser.id);
      setSuccess(`User ${selectedUser.fullName} deleted successfully.`);
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      setShowDeleteModal(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
      LIBRARIAN: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
      FACULTY: { bg: 'rgba(14,165,233,0.1)', text: '#0284c7' },
      STUDENT: { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
    };
    const c = colors[role] || colors.STUDENT;
    return (
      <span style={{
        background: c.bg,
        color: c.text,
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'Poppins, sans-serif',
      }}>{role}</span>
    );
  };

  if (loading && users.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '100px 20px 24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            Admin Portal
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>User Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>
            Manage library users, roles, and account status
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
          color: 'white', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
          position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)',
        }}>
          Create Librarian Account
        </button>
      </div>

      {error && (
        <div style={{
          marginBottom: 20, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))',
          border: '1px solid #ef444440',
          color: '#991b1b',
          padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem',
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          marginBottom: 20, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))',
          border: '1px solid #10b98140',
          color: '#065f46',
          padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem',
        }}>{success}</div>
      )}

      {/* Search Card */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '20px 22px',
        border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        marginBottom: 24,
      }}>
        <form onSubmit={handleSearch} style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 160px auto',
          gap: 12, alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => setFocusField('search')}
            onBlur={() => setFocusField(null)}
            style={{ ...inputStyle, ...(focusField === 'search' ? focusStyle : {}) }}
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(0); }}
            onFocus={() => setFocusField('cat')}
            onBlur={() => setFocusField(null)}
            style={{ ...inputStyle, cursor: 'pointer', ...(focusField === 'cat' ? focusStyle : {}) }}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="LIBRARIAN">Librarian</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" style={{
            padding: '11px 20px', borderRadius: 999,
            background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
            border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          }}>Search</button>
          {(searchKeyword || roleFilter) && (
            <button type="button" onClick={() => { setSearchKeyword(''); setRoleFilter(''); setCurrentPage(0); fetchUsers(); }} style={{
              padding: '11px 20px', borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
              border: '1.5px solid #6366f130',
              color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            }}>Clear</button>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1px solid #e8ecf0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 26px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))',
          display: 'grid', gridTemplateColumns: '80px 2fr 140px 2fr 100px 120px 100px 120px 280px',
          gap: 14, alignItems: 'center',
          fontWeight: 700, fontSize: '0.78rem', color: '#4c1d95',
          textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #eef2ff',
        }}>
          <div>ID</div>
          <div>Name</div>
          <div>Staff/Student ID</div>
          <div>Email</div>
          <div>Role</div>
          <div>Faculty</div>
          <div>Status</div>
          <div>Joined</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <div style={{ marginTop: 14, color: '#64748b', fontSize: '0.88rem' }}>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>No users found</div>
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Try changing your filters or search query.</div>
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '80px 2fr 140px 2fr 100px 120px 100px 120px 280px',
              gap: 14, alignItems: 'center',
              padding: '16px 26px',
              borderBottom: '1px solid #f1f5f9',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{u.id}</div>
              <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{u.fullName}</div>
              <div style={{ color: '#374151', fontSize: '0.85rem' }}>{u.studentStaffId}</div>
              <div style={{ color: '#374151', fontSize: '0.85rem' }}>{u.email}</div>
              <div>{getRoleBadge(u.role)}</div>
              <div style={{ color: '#374151', fontSize: '0.85rem' }}>{u.faculty || '—'}</div>
              <div>
                <span style={{
                  background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                  color: u.isActive ? '#059669' : '#475569',
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>{u.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ color: '#374151', fontSize: '0.82rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <ActionBtn
                  onClick={() => openViewModal(u)}
                  bg="linear-gradient(135deg, #10b981, #059669)"
                  color="white"
                >View</ActionBtn>
                <ActionBtn
                  onClick={() => openMessageModal(u)}
                  bg="linear-gradient(135deg, #8b5cf6, #7c3aed)"
                  color="white"
                >Msg</ActionBtn>
                <ActionBtn
                  onClick={() => openRoleModal(u)}
                  bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                  color="white"
                >Role</ActionBtn>
                <ActionBtn
                  onClick={() => handleToggleActive(u.id, u.isActive)}
                  bg={u.isActive ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #64748b, #475569)"}
                  color="white"
                >{u.isActive ? 'Disable' : 'Enable'}</ActionBtn>
                <ActionBtn
                  onClick={() => openDeleteModal(u)}
                  bg="linear-gradient(135deg, #ef4444, #dc2626)"
                  color="white"
                >Delete</ActionBtn>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 0}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: currentPage === 0 ? '#f1f5f9' : 'white',
              border: '1px solid #e8ecf0',
              color: currentPage === 0 ? '#9ca3af' : '#374151',
              fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                padding: '8px 14px', borderRadius: 8,
                background: i === currentPage ? '#ef5a24' : 'white',
                border: '1px solid #e8ecf0',
                color: i === currentPage ? 'white' : '#374151',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages - 1}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: currentPage === totalPages - 1 ? '#f1f5f9' : 'white',
              border: '1px solid #e8ecf0',
              color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151',
              fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowRoleModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 500,
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '22px 30px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)',
              color: 'white',
            }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Change Role</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>{selectedUser?.fullName}</p>
            </div>
            <div style={{ padding: '26px 30px' }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Select new role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div style={{ marginTop: 12, color: '#64748b', fontSize: '0.85rem' }}>
                Current role: <strong style={{ color: '#1a1a2e' }}>{selectedUser?.role}</strong>
              </div>
            </div>
            <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRoleModal(false)} style={{
                padding: '10px 20px', borderRadius: 999,
                background: '#f1f5f9', border: '1px solid #e8ecf0',
                color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}>Cancel</button>
              <button onClick={handleChangeRole} disabled={newRole === selectedUser?.role} style={{
                padding: '10px 20px', borderRadius: 999,
                background: newRole === selectedUser?.role ? '#cbd5e1' : 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: newRole === selectedUser?.role ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}>Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 450,
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', fontWeight: 'bold' }}>!</div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Delete User</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: '#1a1a2e' }}>{selectedUser?.fullName}</strong>? This action is permanent. They cannot have active loans or unpaid fines.
              </p>
            </div>
            <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'center', background: '#f8fafc' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{
                padding: '10px 24px', borderRadius: 999,
                background: 'white', border: '1px solid #e8ecf0',
                color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}>Cancel</button>
              <button onClick={handleDeleteUser} style={{
                padding: '10px 24px', borderRadius: 999,
                background: '#ef4444',
                border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}>Delete User</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 500,
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '24px 30px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)',
              color: 'white',
              position: 'relative'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>User Details</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.85rem' }}>Detailed profile information</p>
              <button onClick={() => setShowViewModal(false)} style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                width: 30, height: 30, borderRadius: '50%', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>✕</button>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Full Name</div>
                  <div style={{ fontSize: '0.95rem', color: '#1a1a2e', fontWeight: 600 }}>{selectedUser?.fullName}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedUser?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Phone</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedUser?.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Role</div>
                    <div style={{ marginTop: 2 }}>{getRoleBadge(selectedUser?.role)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Status</div>
                    <div style={{ marginTop: 2 }}>
                      <span style={{
                        background: selectedUser?.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                        color: selectedUser?.isActive ? '#059669' : '#475569',
                        borderRadius: 6, padding: '3px 10px',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>{selectedUser?.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                {(selectedUser?.faculty || selectedUser?.programme) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Faculty</div>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedUser?.faculty || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Programme</div>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedUser?.programme || 'N/A'}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Current Borrows</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>{selectedUser?.currentBorrowCount || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Fines</div>
                    <div style={{ fontSize: '0.9rem', color: (selectedUser?.outstandingFine > 0) ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      Rs. {(selectedUser?.outstandingFine || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Librarian Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 500,
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '22px 30px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)',
              color: 'white',
            }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Create Librarian Account</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>Fill in the details to create a new librarian account.</p>
            </div>
            <form onSubmit={handleCreateLibrarian}>
              <div style={{ padding: '26px 30px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Full Name</label>
                  <input
                    required
                    value={createForm.fullName}
                    onChange={e => setCreateForm({...createForm, fullName: e.target.value})}
                    placeholder="Full name"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Staff ID</label>
                  <input
                    required
                    value={createForm.studentStaffId}
                    onChange={e => setCreateForm({...createForm, studentStaffId: e.target.value})}
                    placeholder="e.g. LIB002"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm({...createForm, email: e.target.value})}
                    placeholder="Email address"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={e => setCreateForm({...createForm, password: e.target.value})}
                    placeholder="Min 6 characters"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Phone Number</label>
                  <input
                    required
                    value={createForm.phoneNumber}
                    onChange={e => setCreateForm({...createForm, phoneNumber: e.target.value})}
                    placeholder="Phone number"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{
                  padding: '10px 20px', borderRadius: 999,
                  background: '#f1f5f9', border: '1px solid #e8ecf0',
                  color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '10px 20px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                  border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      {/* Direct Personal Message Modal */}
      {showMessageModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowMessageModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 500,
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e' }}>Send Personal Message</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>Recipient: <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})</div>
              </div>
              <button onClick={() => setShowMessageModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <form onSubmit={handleSendMessage}>
              <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Message Title *</label>
                  <input
                    placeholder="e.g. Reserved Book Ready for Pickup"
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Message Body *</label>
                  <textarea
                    rows={4}
                    placeholder="Type personal message for user..."
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    required
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end', background: '#f8fafc' }}>
                <button type="button" onClick={() => setShowMessageModal(false)} style={{
                  padding: '10px 20px', borderRadius: 999,
                  background: 'white', border: '1px solid #e8ecf0',
                  color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>Cancel</button>
                <button type="submit" disabled={sendingMsg} style={{
                  padding: '10px 24px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: sendingMsg ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Users;
