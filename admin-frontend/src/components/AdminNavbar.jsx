import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/events', label: 'Events' },
    { to: '/users', label: 'Users' },
    { to: '/books', label: 'Books' },
    { to: '/ebooks', label: 'eBooks' },
    { to: '/past-papers', label: 'Past Papers' },
    { to: '/research-papers', label: 'Research Papers' },
    { to: '/categories', label: 'Categories' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: 'white',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Left Side: Brand */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            fontFamily: 'Poppins, sans-serif',
          }}>
            <span style={{ color: '#000000' }}>Library</span><span style={{ color: '#ef5a24' }}>Hub</span>
          </span>
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', flex: 1 }}>
        {navItems.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: isActive(to) ? 600 : 500,
            fontSize: '0.875rem',
            color: isActive(to) ? '#ef5a24' : '#000000',
            background: isActive(to) ? 'rgba(239,90,36,0.08)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            {label}
          </Link>
        ))}
      </div>

      {/* Right Side: User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid rgba(0,0,0,0.08)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#374151',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,90,36,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
          >
            <span style={{ fontWeight: 600 }}>{user?.fullName}</span>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              background: 'white',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
              minWidth: '220px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.06)',
              animation: 'dropdownFadeIn 0.2s ease',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a2e', fontFamily: 'Poppins, sans-serif' }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'Poppins, sans-serif' }}>
                  {user?.email}
                </div>
                <div style={{
                  marginTop: '4px',
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(239,90,36,0.1)',
                  color: '#ef5a24',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {user?.role}
                </div>
              </div>

              <div style={{ padding: '8px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    color: '#ef4444',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1.5px solid rgba(0,0,0,0.08)',
            background: 'transparent',
            cursor: 'pointer',
            color: '#374151',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          background: 'white',
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 999,
        }}>
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: isActive(to) ? 600 : 500,
                fontSize: '0.95rem',
                color: isActive(to) ? '#ef5a24' : '#374151',
                background: isActive(to) ? 'rgba(239,90,36,0.08)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          nav {
            padding: 0 16px;
          }
          .navbar-desktop-links {
            display: none !important;
          }
          .navbar-hamburger {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;
