import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div>
      <Sidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <i className="bi bi-shield-check me-1" style={{ color: 'var(--accent-blue)' }}></i>
              Admin Portal
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge" style={{ background: 'var(--accent-blue)' }}>
              <i className="bi bi-person me-1"></i>
              {user?.role}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.fullName}
            </span>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
