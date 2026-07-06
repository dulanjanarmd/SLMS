import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservationAPI } from '../services/api';
import { Container, Table, Badge, Button, Alert, Spinner, Card } from 'react-bootstrap';

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getUserReservations(user.id);
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    try {
      setError('');
      setSuccess('');
      await reservationAPI.cancel(reservationId, user.id);
      setSuccess('Reservation cancelled successfully');
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'NOTIFIED': return <Badge bg="info">Notified</Badge>;
      case 'FULFILLED': return <Badge bg="success">Fulfilled</Badge>;
      case 'CANCELLED': return <Badge bg="secondary">Cancelled</Badge>;
      case 'EXPIRED': return <Badge bg="danger">Expired</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
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
        <i className="bi bi-bookmark me-2"></i>My Reservations
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {reservations.filter(r => r.status === 'NOTIFIED').map(r => (
        <Alert key={r.id} variant="success" className="d-flex align-items-center gap-2">
          <i className="bi bi-bell-fill fs-5"></i>
          <div>
            <strong>Book Ready to Collect!</strong> "{r.bookTitle}" is now available for pickup.
            {r.expiryDate && (
              <span className="ms-2 text-muted small">
                Collect before: {new Date(r.expiryDate).toLocaleString()}
              </span>
            )}
          </div>
        </Alert>
      ))}

      <Card>
        <Card.Header className="fw-semibold">
          <i className="bi bi-list me-2"></i>Reservation Queue
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Queue Position</th>
                <th>Status</th>
                <th>Reserved On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No reservations. Visit the <Alert.Link href="/books">catalog</Alert.Link> to reserve books.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id}>
                    <td className="fw-semibold">{res.bookTitle}</td>
                    <td>{res.bookAuthor}</td>
                    <td>
                      {res.queuePosition > 0 ? (
                        <span className="fw-semibold">#{res.queuePosition}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(res.status)}</td>
                    <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                    <td>
                      {res.status === 'PENDING' && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleCancel(res.id)}
                        >
                          <i className="bi bi-x-circle me-1"></i>Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyReservations;
