import React from 'react';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminNavbar />
      <div style={{ paddingTop: '72px', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ padding: '24px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
