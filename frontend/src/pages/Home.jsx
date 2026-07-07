import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';
import { bookAPI, borrowAPI, reservationAPI, fineAPI } from '../services/api';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const booksRes = await bookAPI.getPopular(6);
      setPopularBooks(booksRes.data || []);

      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const [loansRes, reservationsRes, finesRes] = await Promise.all([
          borrowAPI.getActiveLoans(user.id),
          reservationAPI.getUserReservations(user.id),
          fineAPI.getUnpaidFines(user.id),
        ]);

        const loans = loansRes.data || [];
        const overdue = loans.filter(l => l.dueDate < today);
        const pending = (reservationsRes.data || []).filter(
          r => r.status === 'PENDING' || r.status === 'NOTIFIED'
        );
        const totalFines = (finesRes.data || []).reduce(
          (sum, f) => sum + (f.remainingAmount || 0), 0
        );

        setStats({
          activeLoans: loans.length,
          overdueLoans: overdue.length,
          pendingReservations: pending.length,
          outstandingFines: totalFines,
        });
      }
    } catch (err) {
      console.error('Failed to fetch home data', err);
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
              <h1 className="display-5 fw-bold mb-3 animate-fade-in">
                Welcome to <span style={{ color: 'var(--sliit-orange)' }}>LibraryHub</span>
              </h1>
              <p className="lead mb-4">
                Your gateway to knowledge. Browse our extensive collection of physical books and eBooks,
                manage your loans, reservations, and stay updated with notifications.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/books" variant="dark" size="lg" className="btn-pill">
                  Browse Catalog
                </Button>
                <Button as={Link} to="/ebooks" variant="dark" size="lg" className="btn-pill">
                  eBooks
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center d-none d-lg-block">
              <img src={logo} alt="Library Hub Logo" style={{ width: '200px', opacity: 0.8 }} />
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Quick Stats for logged in user */}
        {user && (
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card as={Link} to="/my-books" className="stat-card primary text-center text-decoration-none h-100">
                <Card.Body>
                  <i className="bi bi-book fs-3 text-primary mb-1 d-block"></i>
                  <h4 className="mb-0 fw-bold">{stats.activeLoans}</h4>
                  <small className="text-muted">Active Loans</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card as={Link} to="/my-books" className="stat-card danger text-center text-decoration-none h-100">
                <Card.Body>
                  <i className="bi bi-exclamation-triangle fs-3 text-danger mb-1 d-block"></i>
                  <h4 className="mb-0 fw-bold text-danger">{stats.overdueLoans}</h4>
                  <small className="text-muted">Overdue</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card as={Link} to="/my-reservations" className="stat-card warning text-center text-decoration-none h-100">
                <Card.Body>
                  <i className="bi bi-bookmark fs-3 text-warning mb-1 d-block"></i>
                  <h4 className="mb-0 fw-bold">{stats.pendingReservations}</h4>
                  <small className="text-muted">Reservations</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card as={Link} to="/my-fines" className="stat-card info text-center text-decoration-none h-100">
                <Card.Body>
                  <i className="bi bi-cash-coin fs-3 text-info mb-1 d-block"></i>
                  <h4 className="mb-0 fw-bold">LKR {stats.outstandingFines.toFixed(2)}</h4>
                  <small className="text-muted">Outstanding Fines</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Popular Books */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Popular Now</h3>
          <Button as={Link} to="/books" variant="dark" className="btn-pill">
            View All <i className="bi bi-arrow-right ms-1"></i>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row>
            {popularBooks.map((book, index) => (
              <Col key={book.id} lg={2} md={4} sm={6} className="mb-4">
                <Card
                  as={Link}
                  to={`/books/${book.id}`}
                  className="book-card text-decoration-none h-100 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center text-white"
                    style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      overflow: 'hidden',
                    }}
                  >
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
                        <i className="bi bi-arrow-repeat me-1"></i>{book.borrowCount}
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
                Reserve books online and collect them at the library counter.
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
