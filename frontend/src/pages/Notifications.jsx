import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getUserNotifications(user.id);
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const handleClick = async (notif) => {
    // Mark as read
    if (!notif.isRead) {
      try { await notificationAPI.markAsRead(notif.id); } catch {}
    }
    // Navigate to relevant page
    const dest = getDestination(notif);
    if (dest) navigate(dest);
    fetchNotifications();
  };

  const getDestination = (notif) => {
    switch (notif.type) {
      case 'BOOK_ISSUED':
      case 'BOOK_RETURNED':
      case 'DUE_REMINDER':
      case 'OVERDUE_ALERT':
      case 'RENEWAL_APPROVED':
      case 'RENEWAL_DENIED':
        return '/my-books';
      case 'RENEWAL_REQUEST':
        return '/librarian/renewals';
      case 'RESERVATION_READY':
        return '/my-reservations';
      case 'NEW_RESERVATION':
        return '/librarian/reservations';
      case 'FINE_IMPOSED':
      case 'FINE_PAID':
        return '/my-fines';
      case 'ANNOUNCEMENT':
        return notif.relatedEntityType === 'MEMBERSHIP' ? '/membership' : null;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DUE_REMINDER':      return 'bi-calendar-check text-warning';
      case 'OVERDUE_ALERT':     return 'bi-exclamation-triangle text-danger';
      case 'RESERVATION_READY': return 'bi-bookmark-check text-success';
      case 'NEW_RESERVATION':   return 'bi-bookmark-plus text-primary';
      case 'BOOK_ISSUED':       return 'bi-book text-primary';
      case 'BOOK_RETURNED':     return 'bi-check-circle text-success';
      case 'FINE_IMPOSED':      return 'bi-cash-coin text-danger';
      case 'FINE_PAID':         return 'bi-check-circle text-success';
      case 'ANNOUNCEMENT':      return 'bi-megaphone text-info';
      case 'RENEWAL_REQUEST':   return 'bi-arrow-repeat text-warning';
      case 'RENEWAL_APPROVED':  return 'bi-check2-circle text-success';
      case 'RENEWAL_DENIED':    return 'bi-x-circle text-danger';
      default:                  return 'bi-bell text-secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-bell me-2"></i>Notifications
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2 fs-6">{unreadCount}</Badge>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
            <i className="bi bi-check-all me-1"></i>Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const dest = getDestination(notif);
              return (
                <div
                  key={notif.id}
                  className={`notification-item d-flex gap-3 ${!notif.isRead ? 'unread' : ''} ${dest ? 'cursor-pointer' : ''}`}
                  style={{ cursor: dest ? 'pointer' : 'default' }}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <i className={`bi ${getTypeIcon(notif.type)} fs-4`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1 fw-semibold">
                        {notif.title}
                        {!notif.isRead && (
                          <Badge bg="primary" className="ms-2" style={{ fontSize: '0.6rem' }}>NEW</Badge>
                        )}
                      </h6>
                      <small className="text-muted ms-2 text-nowrap">
                        {new Date(notif.sentAt).toLocaleDateString()}{' '}
                        {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <p className="mb-1 text-muted">{notif.message}</p>
                    {dest && (
                      <small className="text-primary">
                        <i className="bi bi-arrow-right me-1"></i>Click to view details
                      </small>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="flex-shrink-0 d-flex align-items-center">
                      <span
                        className="rounded-circle bg-primary d-inline-block"
                        style={{ width: 10, height: 10 }}
                      ></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
