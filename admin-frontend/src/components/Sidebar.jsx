import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard',  label: 'Dashboard' },
    { path: '/events',     label: 'Events' },
    { path: '/users',      label: 'User Management' },
    { path: '/books',      label: 'Book Management' },
    { path: '/categories', label: 'Categories' },
    { path: '/reports',    label: 'Reports' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div>
            <div className="fw-bold fs-6" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.2px' }}>
              <span style={{ color: '#ffffff' }}>Library</span><span style={{ color: '#ef5a24' }}>Hub</span>
            </div>
            <small className="opacity-75" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Portal</small>
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 py-2">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${isActive(path) ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif' }}>
              {user?.fullName}
            </div>
            <div className="opacity-75 text-truncate" style={{ fontSize: '0.75rem', fontFamily: 'Poppins, sans-serif' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          className="btn btn-sm btn-outline-light w-100"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
