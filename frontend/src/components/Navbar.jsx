import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLibrarianMenu, setShowLibrarianMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const librarianRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (librarianRef.current && !librarianRef.current.contains(e.target)) setShowLibrarianMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user.id);
      setUnreadCount(response.data);
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getUnread(user.id);
      setNotifications(response.data);
    } catch (err) {}
  };

  const handleNotificationClick = async (notif) => {
    try {
      await notificationAPI.markAsRead(notif.id);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {}
    setShowNotifications(false);
    switch (notif.type) {
      case 'BOOK_ISSUED': case 'BOOK_RETURNED': case 'DUE_REMINDER':
      case 'OVERDUE_ALERT': case 'RENEWAL_APPROVED': case 'RENEWAL_DENIED':
        navigate('/my-books'); break;
      case 'RENEWAL_REQUEST':
        navigate(user?.role === 'LIBRARIAN' ? '/librarian/renewals' : '/my-books'); break;
      case 'NEW_RESERVATION':
        navigate(user?.role === 'LIBRARIAN' ? '/librarian/reservations' : '/my-reservations'); break;
      case 'RESERVATION_READY': navigate('/my-reservations'); break;
      case 'FINE_IMPOSED': case 'FINE_PAID': navigate('/my-fines'); break;
      default: navigate('/notifications');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    if (role === 'LIBRARIAN') return '#ef5a24';
    if (role === 'FACULTY') return '#6366f1';
    return '#10b981';
  };

  if (!user) return null;

  return (
    <>
      <nav className="app-navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: scrolled
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(239,90,36,0.15)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: scrolled
          ? '0 4px 24px rgba(239,90,36,0.10), 0 1px 4px rgba(0,0,0,0.06)'
          : '0 1px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          gap: '16px',
        }}>

          {/* Brand Name — Left corner (no logo, text only) */}
          <Link to="/" style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: '1.2rem',
              letterSpacing: '-0.3px',
            }}>
              <span style={{ color: '#000000' }}>Library</span><span style={{ color: '#ef5a24' }}>Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links — Center Middle */}
          <div className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', flex: 1 }}>
            {[
              { to: '/', label: 'Home', icon: '⌂' },
              { to: '/books', label: 'Catalog', icon: '' },
              { to: '/events', label: 'Events', icon: '' },
              ...(user.role === 'LIBRARIAN' ? [{ to: '/dashboard', label: 'Dashboard', icon: '' }] : []),
              ...(user.role === 'STUDENT' ? [{ to: '/student/dashboard', label: 'My Dashboard', icon: '' }] : []),
              ...(user.role === 'FACULTY' ? [{ to: '/faculty/dashboard', label: 'My Dashboard', icon: '' }] : []),
              ...((user.role === 'STUDENT' || user.role === 'FACULTY') ? [{ to: '/membership', label: 'Membership', icon: '🪪' }] : []),
              { to: '/ebooks', label: 'eBooks', icon: '' },
              { to: '/research-papers', label: 'Research', icon: '' },
              { to: '/past-papers', label: 'Past Papers', icon: '' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: isActive(to) ? 600 : 500,
                fontSize: '0.875rem',
                color: isActive(to) ? '#ef5a24' : '#000000',
                background: isActive(to) ? 'rgba(239,90,36,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#000000'; }}}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}}
              >
                {label}
                {isActive(to) && <span style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '3px',
                  background: '#ef5a24',
                  borderRadius: '2px',
                }} />}
              </Link>
            ))}

            {/* Librarian Dropdown */}
            {user.role === 'LIBRARIAN' && (
              <div ref={librarianRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowLibrarianMenu(!showLibrarianMenu); setShowNotifications(false); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: showLibrarianMenu ? 'rgba(239,90,36,0.08)' : 'transparent',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: showLibrarianMenu ? '#ef5a24' : '#000000',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Librarian Tools
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showLibrarianMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showLibrarianMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    background: 'white',
                    borderRadius: '14px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                    minWidth: '220px',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.06)',
                    animation: 'dropdownFadeIn 0.2s ease',
                  }}>
                    <div style={{ padding: '8px' }}>
                      {[
                        { to: '/librarian/issue', label: 'Issue Book', icon: '' },
                        { to: '/librarian/return', label: 'Return Book', icon: '' },
                        null,
                        { to: '/librarian/inventory', label: 'Inventory', icon: '' },
                        { to: '/librarian/reservations', label: 'Reservations', icon: '' },
                        { to: '/librarian/renewals', label: 'Renewal Requests', icon: '' },
                        { to: '/librarian/fines', label: 'Fines', icon: '' },
                        { to: '/librarian/events', label: 'Events', icon: '' },
                        null,
                        { to: '/librarian/library-hours', label: 'Library Hours', icon: '' },
                        { to: '/librarian/contact-info', label: 'Contact & Help', icon: '' },
                        null,
                        { to: '/librarian/reports', label: 'Reports', icon: '' },
                      ].map((item, idx) => item === null ? (
                        <div key={`div-${idx}`} style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />
                      ) : (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setShowLibrarianMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.07)'; e.currentTarget.style.color = '#ef5a24'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side — Bell + Profile (corner) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); setShowUserMenu(false); setShowLibrarianMenu(false); }}
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: showNotifications ? 'rgba(239,90,36,0.07)' : 'rgba(248,249,250,0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: showNotifications ? '#ef5a24' : '#000000',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,90,36,0.25)'; }}
                onMouseLeave={e => { if (!showNotifications) { e.currentTarget.style.background = 'rgba(248,249,250,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef5a24',
                    color: 'white',
                    borderRadius: '999px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    border: '2px solid white',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                  width: '340px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  animation: 'dropdownFadeIn 0.2s ease',
                }}>
                  <div style={{
                    padding: '16px 20px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: 'rgba(239,90,36,0.1)',
                        color: '#ef5a24',
                        borderRadius: '999px',
                        padding: '2px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                      }}>{unreadCount} new</span>
                    )}
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}></div>
                        No new notifications
                      </div>
                    ) : notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '12px 20px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f9fafb',
                          transition: 'background 0.15s',
                          background: 'rgba(239,90,36,0.02)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,90,36,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,90,36,0.02)'}
                      >
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.83rem', color: '#1a1a2e', marginBottom: '2px' }}>{notif.title}</div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.4 }}>
                          {(notif.message || '').substring(0, 70)}...
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6' }}>
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(239,90,36,0.07)',
                        color: '#ef5a24',
                        textDecoration: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.83rem',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,90,36,0.13)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,90,36,0.07)'}
                    >
                      View All Notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Menu — Circle only */}
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowLibrarianMenu(false); }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: showUserMenu ? 'rgba(239,90,36,0.05)' : 'rgba(248,249,250,0.8)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,90,36,0.2)'; }}
                onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.background = 'rgba(248,249,250,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}99)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  {getInitials(user.fullName)}
                </div>
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                  minWidth: '220px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  animation: 'dropdownFadeIn 0.2s ease',
                }}>
                  {/* User Header */}
                  <div style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, rgba(239,90,36,0.06), rgba(239,90,36,0.02))',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}>
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.88rem', color: '#1a1a2e' }}>{user.fullName}</div>
                        <div style={{
                          display: 'inline-block',
                          background: `${getRoleColor(user.role)}18`,
                          color: getRoleColor(user.role),
                          borderRadius: '5px',
                          padding: '1px 8px',
                          fontSize: '0.7rem',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600,
                          marginTop: '2px',
                        }}>{user.role}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '8px' }}>
                    {[
                      { to: '/profile', label: 'My Profile', icon: '' },
                      { to: '/my-books', label: 'My Books', icon: '' },
                      { to: '/my-reservations', label: 'My Reservations', icon: '' },
                      { to: '/my-fines', label: 'My Fines', icon: '' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.07)'; e.currentTarget.style.color = '#ef5a24'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

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
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span></span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: 'transparent',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default AppNavbar;