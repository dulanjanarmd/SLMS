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
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'Poppins, sans-serif' }}>
              <i className="bi bi-shield-check me-1" style={{ color: '#ef5a24' }}></i>
              Admin Portal
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge" style={{ background: 'rgba(239,90,36,0.12)', color: '#ef5a24', fontFamily: 'Poppins, sans-serif' }}>
              <i className="bi bi-person me-1"></i>
              {user?.role}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#374151', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
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
