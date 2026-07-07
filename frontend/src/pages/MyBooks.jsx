import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { borrowAPI } from '../services/api';
import { Container, Table, Badge, Button, Alert, Spinner, Card } from 'react-bootstrap';

const MyBooks = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const [activeRes, historyRes] = await Promise.all([
        borrowAPI.getActiveLoans(user.id),
        borrowAPI.getUserHistory(user.id),
      ]);
      setActiveLoans(activeRes.data);
      setBorrowHistory(historyRes.data.filter(loan => loan.status === 'RETURNED'));
    } catch (err) {
      setError('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (borrowId) => {
    try {
      setError('');
      setSuccess('');
      await borrowAPI.requestRenewal(borrowId);
      setSuccess('Renewal request submitted! Awaiting librarian approval.');
      fetchMyBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request renewal');
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="fw-bold mb-4">
        <i className="bi bi-book me-2"></i>My Books
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Active Loans */}
      <Card className="mb-4">
        <Card.Header className="fw-semibold">
          <i className="bi bi-journal-check me-2"></i>Currently Borrowed ({activeLoans.length})
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Renewals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No active loans. Visit the <Alert.Link href="/books">catalog</Alert.Link> to borrow books.
                  </td>
                </tr>
              ) : (
                activeLoans.map((loan) => {
                  const overdue = isOverdue(loan.dueDate);
                  const daysLeft = getDaysRemaining(loan.dueDate);
                  return (
                    <tr key={loan.id}>
                      <td className="fw-semibold">{loan.bookTitle}</td>
                      <td>{loan.bookAuthor}</td>
                      <td>{loan.issueDate}</td>
                      <td>
                        <span className={overdue ? 'text-danger fw-semibold' : ''}>
                          {loan.dueDate}
                        </span>
                        <br />
                        <small className={overdue ? 'text-danger' : 'text-muted'}>
                          {overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                        </small>
                      </td>
                      <td>
                        <Badge bg={overdue ? 'danger' : loan.status === 'RENEWED' ? 'info' : loan.status === 'RENEWAL_REQUESTED' ? 'warning' : 'success'}>
                          {overdue ? 'OVERDUE' : loan.status === 'RENEWAL_REQUESTED' ? 'RENEWAL PENDING' : loan.status}
                        </Badge>
                      </td>
                      <td>{loan.renewalCount}/2</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={loan.renewalCount >= 2 || overdue || loan.status === 'RENEWAL_REQUESTED'}
                          onClick={() => handleRenew(loan.id)}
                          title={loan.status === 'RENEWAL_REQUESTED' ? 'Renewal request pending librarian approval' : ''}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i>
                          {loan.status === 'RENEWAL_REQUESTED' ? 'Pending...' : 'Request Renewal'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Borrow History */}
      <Card>
        <Card.Header className="fw-semibold">
          <i className="bi bi-clock-history me-2"></i>Borrow History
        </Card.Header>
        <Card.Body className="p-0">
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No borrow history</td>
                  </tr>
                ) : (
                  borrowHistory.map((loan) => (
                    <tr key={loan.id}>
                      <td className="fw-semibold">{loan.bookTitle}</td>
                      <td>{loan.bookAuthor}</td>
                      <td>{loan.issueDate}</td>
                      <td>{loan.returnDate || '-'}</td>
                      <td>
                        <Badge bg={loan.status === 'RETURNED' ? 'secondary' : 'primary'}>
                          {loan.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyBooks;
