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
    { path: '/dashboard',  icon: 'bi-speedometer2',  label: 'Dashboard' },
    { path: '/users',      icon: 'bi-people',         label: 'User Management' },
    { path: '/books',      icon: 'bi-book',           label: 'Book Management' },
    { path: '/categories', icon: 'bi-tags',           label: 'Categories' },
    { path: '/reports',    icon: 'bi-graph-up',       label: 'Reports' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-lock fs-4" style={{ color: 'var(--accent-blue)' }}></i>
          <div>
            <div className="fw-bold fs-6">SLIIT Library</div>
            <small className="opacity-75">Admin Portal</small>
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 py-2">
        {navItems.map(({ path, icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${isActive(path) ? 'active' : ''}`}
          >
            <i className={`bi ${icon}`}></i>
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: 36, height: 36, flexShrink: 0, background: 'var(--accent-blue)' }}>
            <i className="bi bi-person text-white"></i>
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
              {user?.fullName}
            </div>
            <div className="opacity-75 text-truncate" style={{ fontSize: '0.75rem' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          className="btn btn-sm btn-outline-light w-100"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
