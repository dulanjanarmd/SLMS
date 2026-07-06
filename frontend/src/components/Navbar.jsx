import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user.id);
      setUnreadCount(response.data);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getUnread(user.id);
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleNotificationClick = async (notifId) => {
    try {
      await notificationAPI.markAsRead(notifId);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="text-primary fw-bold">
          <i className="bi bi-book-half me-2"></i>
          SLIIT Library
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')}>
              <i className="bi bi-house me-1"></i>Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books" active={isActive('/books')}>
              <i className="bi bi-search me-1"></i>Catalog
            </Nav.Link>
            {user.role === 'LIBRARIAN' && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
                  <i className="bi bi-speedometer2 me-1"></i>Dashboard
                </Nav.Link>
                <NavDropdown title={<><i className="bi bi-tools me-1"></i>Librarian</>} id="librarian-dropdown">
                  <NavDropdown.Item as={Link} to="/librarian/issue">
                    <i className="bi bi-book me-2"></i>Issue Book
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/return">
                    <i className="bi bi-arrow-return-left me-2"></i>Return Book
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/librarian/inventory">
                    <i className="bi bi-collection me-2"></i>Inventory
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/reservations">
                    <i className="bi bi-bookmark-check me-2"></i>Reservations
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/fines">
                    <i className="bi bi-cash-coin me-2"></i>Fines
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/librarian/reports">
                    <i className="bi bi-bar-chart-line me-2"></i>Reports
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
            {user.role === 'STUDENT' && (
              <Nav.Link as={Link} to="/student/dashboard" active={isActive('/student/dashboard')}>
                <i className="bi bi-person-circle me-1"></i>My Dashboard
              </Nav.Link>
            )}
            {user.role === 'FACULTY' && (
              <Nav.Link as={Link} to="/faculty/dashboard" active={isActive('/faculty/dashboard')}>
                <i className="bi bi-person-circle me-1"></i>My Dashboard
              </Nav.Link>
            )}
            {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
              <Nav.Link as={Link} to="/membership" active={isActive('/membership')}>
                <i className="bi bi-person-badge me-1"></i>Membership
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/ebooks" active={isActive('/ebooks')}>
              <i className="bi bi-file-earmark-pdf me-1"></i>eBooks
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <span>
                  <i className="bi bi-bell-fill position-relative">
                    {unreadCount > 0 && (
                      <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                        {unreadCount}
                      </Badge>
                    )}
                  </i>
                </span>
              }
              id="notification-dropdown"
              align="end"
              onClick={fetchNotifications}
            >
              <NavDropdown.Header>Notifications</NavDropdown.Header>
              {notifications.length === 0 ? (
                <NavDropdown.ItemText className="text-muted">No new notifications</NavDropdown.ItemText>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <NavDropdown.Item
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className="notification-item unread"
                  >
                    <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{notif.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {(notif.message || '').substring(0, 60)}...
                    </div>
                  </NavDropdown.Item>
                ))
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/notifications">
                View All Notifications
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown
              title={
                <span>
                  <i className="bi bi-person-circle me-1"></i>
                  {user.fullName}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <i className="bi bi-person me-2"></i>My Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-books">
                <i className="bi bi-book me-2"></i>My Books
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-reservations">
                <i className="bi bi-bookmark me-2"></i>My Reservations
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-fines">
                <i className="bi bi-cash-coin me-2"></i>My Fines
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
