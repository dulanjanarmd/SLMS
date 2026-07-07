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
    <Navbar bg="light" variant="light" expand="lg" className="sticky-top shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--sliit-blue)' }}>
          LibraryHub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')} className="fw-bold">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books" active={isActive('/books')} className="fw-bold">
              Catalog
            </Nav.Link>
            {user.role === 'LIBRARIAN' && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')} className="fw-bold">
                  Dashboard
                </Nav.Link>
                <NavDropdown title="Librarian" id="librarian-dropdown" className="fw-bold">
                  <NavDropdown.Item as={Link} to="/librarian/issue">
                    Issue Book
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/return">
                    Return Book
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/librarian/inventory">
                    Inventory
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/reservations">
                    Reservations
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/librarian/fines">
                    Fines
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/librarian/reports">
                    Reports
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
            {user.role === 'STUDENT' && (
              <Nav.Link as={Link} to="/student/dashboard" active={isActive('/student/dashboard')} className="fw-bold">
                My Dashboard
              </Nav.Link>
            )}
            {user.role === 'FACULTY' && (
              <Nav.Link as={Link} to="/faculty/dashboard" active={isActive('/faculty/dashboard')} className="fw-bold">
                My Dashboard
              </Nav.Link>
            )}
            {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
              <Nav.Link as={Link} to="/membership" active={isActive('/membership')} className="fw-bold">
                Membership
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/ebooks" active={isActive('/ebooks')} className="fw-bold">
              eBooks
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title="Notifications"
              id="notification-dropdown"
              align="end"
              onClick={fetchNotifications}
              className="fw-bold"
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
                <span className="fw-bold">
                  {user.fullName}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-books">
                My Books
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-reservations">
                My Reservations
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-fines">
                My Fines
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;