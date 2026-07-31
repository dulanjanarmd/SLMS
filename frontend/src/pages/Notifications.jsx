import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const typeMap = {
  DUE_REMINDER:      { icon: '⏰', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Due Reminder' },
  OVERDUE_ALERT:     { icon: '', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Overdue Alert' },
  RESERVATION_READY: { icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Ready for Pickup' },
  NEW_RESERVATION:   { icon: '', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', label: 'New Reservation' },
  BOOK_ISSUED:       { icon: '', color: '#ef5a24', bg: 'rgba(239,90,36,0.1)',  label: 'Book Issued' },
  BOOK_RETURNED:     { icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Book Returned' },
  FINE_IMPOSED:      { icon: '', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Fine Imposed' },
  FINE_PAID:         { icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Fine Paid' },
  ANNOUNCEMENT:      { icon: '', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', label: 'Announcement' },
  RENEWAL_REQUEST:   { icon: '', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Renewal Request' },
  RENEWAL_APPROVED:  { icon: '', color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Renewal Approved' },
  RENEWAL_DENIED:    { icon: '', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Renewal Denied' },
};

const getDestination = (notif) => {
  switch (notif.type) {
    case 'BOOK_ISSUED': case 'BOOK_RETURNED': case 'DUE_REMINDER':
    case 'OVERDUE_ALERT': case 'RENEWAL_APPROVED': case 'RENEWAL_DENIED':
      return '/my-books';
    case 'RENEWAL_REQUEST': return '/librarian/renewals';
    case 'RESERVATION_READY': return '/my-reservations';
    case 'NEW_RESERVATION': return '/librarian/reservations';
    case 'FINE_IMPOSED': case 'FINE_PAID': return '/my-fines';
    default: return null;
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getUserNotifications(user.id);
      setNotifications(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkAllAsRead = async () => {
    try { await notificationAPI.markAllAsRead(user.id); fetchNotifications(); } catch {}
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) { try { await notificationAPI.markAsRead(notif.id); } catch {} }
    const dest = getDestination(notif);
    if (dest) navigate(dest);
    fetchNotifications();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: '#ef5a24' }} />
    </div>
  );

  const unread = notifications.filter(n => !n.isRead);
  const filtered = filter === 'unread' ? unread : notifications;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 800, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}> Notifications</h1>
            <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>
              {unread.length > 0 ? `${unread.length} unread notification${unread.length > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread.length > 0 && (
            <button onClick={handleMarkAllAsRead} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem', fontFamily: 'Poppins, sans-serif', backdropFilter: 'blur(8px)' }}>
               Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ key: 'all', label: `All (${notifications.length})` }, { key: 'unread', label: `Unread (${unread.length})` }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '8px 20px', borderRadius: 999, border: filter === f.key ? 'none' : '1.5px solid #e8ecf0', background: filter === f.key ? '#ef5a24' : 'white', color: filter === f.key ? 'white' : '#64748b', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No notifications</div>
            <div style={{ fontSize: '0.85rem' }}>You're all caught up!</div>
          </div>
        ) : filtered.map((notif, idx) => {
          const info = typeMap[notif.type] || { icon: '', color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'Notification' };
          const dest = getDestination(notif);
          const time = new Date(notif.sentAt);
          return (
            <div key={notif.id}
              onClick={() => handleClick(notif)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '18px 24px',
                borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                background: !notif.isRead ? 'rgba(239,90,36,0.025)' : 'white',
                borderLeft: !notif.isRead ? '3px solid #ef5a24' : '3px solid transparent',
                cursor: dest ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (dest) e.currentTarget.style.background = 'rgba(239,90,36,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = !notif.isRead ? 'rgba(239,90,36,0.025)' : 'white'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {info.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{notif.title}</span>
                  {!notif.isRead && (
                    <span style={{ background: '#ef5a24', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>NEW</span>
                  )}
                  <span style={{ background: info.bg, color: info.color, borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>{info.label}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 6px' }}>{notif.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {dest && <span style={{ fontSize: '0.75rem', color: '#ef5a24', fontWeight: 600 }}>View details →</span>}
                </div>
              </div>
              {!notif.isRead && (
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef5a24', flexShrink: 0, marginTop: 6 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
