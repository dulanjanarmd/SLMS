import React from 'react';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminNavbar />
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
