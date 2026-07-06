import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, borrowAPI, notificationAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';

const Home = () => {
  const { user } = useAuth();
  const [popularBooks, setPopularBooks] = useState([]);
  const [stats, setStats] = useState({
    activeLoans: 0,
    overdueLoans: 0,
    pendingReservations: 0,
    outstandingFines: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [booksRes, notifRes] = await Promise.all([
        bookAPI.getPopular(6),
        user ? notificationAPI.getUnreadCount(user.id) : Promise.resolve({ data: 0 }),
      ]);
      setPopularBooks(booksRes.data);

      if (user) {
        const loansRes = await borrowAPI.getActiveLoans(user.id);
        const today = new Date().toISOString().split('T')[0];
        const overdue = loansRes.data.filter(l => l.dueDate < today);
        setStats({
          activeLoans: loansRes.data.length,
          overdueLoans: overdue.length,
          pendingReservations: 0,
          outstandingFines: 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch home data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-4" style={{ background: 'linear-gradient(135deg, #003366 0%, #1a5276 100%)' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-5 fw-bold mb-3">
                <i className="bi bi-book-half me-3"></i>
                SLIIT Library
              </h1>
              <p className="lead mb-4">
                Your gateway to knowledge. Browse our extensive collection of physical books and eBooks,
                manage your loans, reservations, and stay updated with notifications.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/books" variant="warning" size="lg">
                  <i className="bi bi-search me-2"></i>Browse Catalog
                </Button>
                <Button as={Link} to="/ebooks" variant="outline-light" size="lg">
                  <i className="bi bi-file-earmark-pdf me-2"></i>eBooks
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center d-none d-lg-block">
              <i className="bi bi-book" style={{ fontSize: '12rem', opacity: 0.3 }}></i>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Quick Stats for logged in user */}
        {user && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="stat-card primary text-center">
                <Card.Body>
                  <i className="bi bi-book fs-2 text-primary mb-2"></i>
                  <h4 className="mb-0">{stats.activeLoans}</h4>
                  <small className="text-muted">Active Loans</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card danger text-center">
                <Card.Body>
                  <i className="bi bi-exclamation-triangle fs-2 text-danger mb-2"></i>
                  <h4 className="mb-0">{stats.overdueLoans}</h4>
                  <small className="text-muted">Overdue</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card warning text-center">
                <Card.Body>
                  <i className="bi bi-bookmark fs-2 text-warning mb-2"></i>
                  <h4 className="mb-0">{stats.pendingReservations}</h4>
                  <small className="text-muted">Reservations</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card info text-center">
                <Card.Body>
                  <i className="bi bi-cash-coin fs-2 text-info mb-2"></i>
                  <h4 className="mb-0">LKR {stats.outstandingFines.toFixed(2)}</h4>
                  <small className="text-muted">Outstanding Fines</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Popular Books */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">
            <i className="bi bi-fire text-danger me-2"></i>Popular Books
          </h3>
          <Button as={Link} to="/books" variant="outline-primary" size="sm">
            View All <i className="bi bi-arrow-right ms-1"></i>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row>
            {popularBooks.map((book) => (
              <Col key={book.id} lg={2} md={4} sm={6} className="mb-4">
                <Card as={Link} to={`/books/${book.id}`} className="book-card text-decoration-none h-100">
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center text-white"
                    style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-book" style={{ fontSize: '3rem' }}></i>
                    )}
                  </div>
                  <Card.Body className="p-3">
                    <Card.Title className="book-title">{book.title}</Card.Title>
                    <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      {book.author}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'}>
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                      </Badge>
                      <small className="text-muted">
                        <i className="bi bi-eye me-1"></i>{book.borrowCount}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Features Section */}
        <hr className="my-5" />
        <h3 className="fw-bold text-center mb-4">Library Services</h3>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 text-center p-4">
              <i className="bi bi-search fs-1 text-primary mb-3"></i>
              <h5>Advanced Search</h5>
              <p className="text-muted">
                Search by title, author, ISBN, category, and more. Find exactly what you need.
              </p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center p-4">
              <i className="bi bi-calendar-check fs-1 text-success mb-3"></i>
              <h5>Online Reservations</h5>
              <p className="text-muted">
                Reserve books online and get notified when they become available for pickup.
              </p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center p-4">
              <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-3"></i>
              <h5>eBook Access</h5>
              <p className="text-muted">
                Access digital resources including eBooks, journals, and research papers.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
