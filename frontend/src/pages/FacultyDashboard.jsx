import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { borrowAPI, reservationAPI, fineAPI } from '../services/api';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loansRes, reservationsRes, finesRes] = await Promise.allSettled([
        borrowAPI.getActiveLoans(user.id),
        reservationAPI.getUserReservations(user.id),
        fineAPI.getUnpaidFines(user.id),
      ]);
      if (loansRes.status === 'fulfilled') setActiveLoans(loansRes.value.data || []);
      if (reservationsRes.status === 'fulfilled') setReservations(reservationsRes.value.data || []);
      if (finesRes.status === 'fulfilled') setUnpaidFines(finesRes.value.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={fetchData}>Retry</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const today = new Date();
  const totalFines = unpaidFines.reduce((acc, f) => acc + (f.amount || 0), 0);
  const pendingReservations = reservations.filter(r => r.status === 'PENDING');

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-person-circle me-2"></i>Faculty Dashboard
      </h2>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-book fs-2 text-primary mb-2 d-block"></i>
              <h4 className="mb-0">{activeLoans.length}</h4>
              <small className="text-muted">Active Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-bookmark fs-2 text-warning mb-2 d-block"></i>
              <h4 className="mb-0">{pendingReservations.length}</h4>
              <small className="text-muted">Pending Reservations</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-cash-coin fs-2 text-danger mb-2 d-block"></i>
              <h5 className="mb-0">LKR {totalFines.toFixed(2)}</h5>
              <small className="text-muted">Outstanding Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Links */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body className="d-flex gap-3 flex-wrap">
              <Button as={Link} to="/my-books" variant="outline-primary" size="sm">
                <i className="bi bi-book me-1"></i>My Books
              </Button>
              <Button as={Link} to="/my-reservations" variant="outline-warning" size="sm">
                <i className="bi bi-bookmark me-1"></i>My Reservations
              </Button>
              <Button as={Link} to="/my-fines" variant="outline-danger" size="sm">
                <i className="bi bi-cash-coin me-1"></i>My Fines
              </Button>
              <Button as={Link} to="/books" variant="outline-success" size="sm">
                <i className="bi bi-search me-1"></i>Browse Catalog
              </Button>
              {!user?.isMember && (
                <Button as={Link} to="/membership" variant="outline-info" size="sm">
                  <i className="bi bi-person-badge me-1"></i>Apply for Membership
                </Button>
              )}
              {user?.isMember && (
                <Button variant="outline-success" size="sm" disabled>
                  <i className="bi bi-patch-check me-1"></i>Member: {user.membershipId}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Borrowing Privileges */}
      <Row className="mb-4">
        <Col>
          <Card className="border-info">
            <Card.Header className="fw-semibold text-info">
              <i className="bi bi-award me-2"></i>Your Borrowing Privileges
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={4}>
                  <h3 className="text-info fw-bold">10</h3>
                  <small className="text-muted">Maximum Books</small>
                </Col>
                <Col md={4}>
                  <h3 className="text-info fw-bold">30</h3>
                  <small className="text-muted">Days per Loan</small>
                </Col>
                <Col md={4}>
                  <h3 className="text-info fw-bold">2</h3>
                  <small className="text-muted">Maximum Renewals</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Loans Table */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-journal-check me-2"></i>Active Loans
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">No active loans</td>
                    </tr>
                  ) : (
                    activeLoans.map((loan) => {
                      const isOverdue = new Date(loan.dueDate) < today;
                      return (
                        <tr key={loan.id} className={isOverdue ? 'table-danger' : ''}>
                          <td className="fw-semibold">{loan.bookTitle}</td>
                          <td>{loan.issueDate}</td>
                          <td>{loan.dueDate}</td>
                          <td>
                            <Badge bg={isOverdue ? 'danger' : 'success'}>
                              {isOverdue ? 'OVERDUE' : 'ACTIVE'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reservations Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-bookmark me-2"></i>Pending Reservations
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Queue Position</th>
                    <th>Reserved On</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReservations.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">No pending reservations</td>
                    </tr>
                  ) : (
                    pendingReservations.map((res) => (
                      <tr key={res.id}>
                        <td className="fw-semibold">{res.bookTitle}</td>
                        <td>#{res.queuePosition}</td>
                        <td>{res.reservationDate ? new Date(res.reservationDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FacultyDashboard;
