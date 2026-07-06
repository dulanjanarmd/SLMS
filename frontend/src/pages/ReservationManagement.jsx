import React, { useState, useEffect } from 'react';
import { reservationAPI, borrowAPI } from '../services/api';
import api from '../services/api';
import {
  Container, Card, Table, Badge, Button, Alert, Spinner, Modal, Form, Row, Col
} from 'react-bootstrap';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('PENDING');

  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillRes, setFulfillRes] = useState(null);
  const [fulfilling, setFulfilling] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRes, setCancelRes] = useState(null);

  useEffect(() => { fetchReservations(); }, [filter]);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (filter === 'PENDING') {
        res = await reservationAPI.getPending();
        setReservations(res.data || []);
      } else {
        const allRes = await api.get('/librarian/reservations/all');
        setReservations(allRes.data || []);
      }
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  // Fulfill = issue the book to the user
  const handleFulfill = async () => {
    setFulfilling(true);
    try {
      await borrowAPI.issue({ userId: fulfillRes.userId, bookId: fulfillRes.bookId });
      // Mark reservation as fulfilled
      await api.put(`/librarian/reservations/${fulfillRes.id}/fulfill`).catch(() => {});
      setSuccess(`Book issued to ${fulfillRes.userName} successfully.`);
      setShowFulfillModal(false);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fulfill reservation.');
      setShowFulfillModal(false);
    } finally {
      setFulfilling(false);
    }
  };

  const handleCancel = async () => {
    try {
      await reservationAPI.cancel(cancelRes.id, cancelRes.userId);
      setSuccess('Reservation cancelled.');
      setShowCancelModal(false);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed.');
      setShowCancelModal(false);
    }
  };

  const statusBadge = (status) => {
    const map = { PENDING: ['warning', 'dark'], NOTIFIED: ['info', undefined], FULFILLED: ['success', undefined], CANCELLED: ['secondary', undefined], EXPIRED: ['danger', undefined] };
    const [bg, text] = map[status] || ['secondary', undefined];
    return <Badge bg={bg} text={text}>{status}</Badge>;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) - new Date() < 24 * 60 * 60 * 1000;
  };

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-bookmark-check me-2 text-warning"></i>Reservation Management
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Pending', count: reservations.filter(r => r.status === 'PENDING').length, color: 'warning' },
          { label: 'Notified', count: reservations.filter(r => r.status === 'NOTIFIED').length, color: 'info' },
          { label: 'Expiring Soon', count: reservations.filter(r => r.status === 'NOTIFIED' && isExpiringSoon(r.expiryDate)).length, color: 'danger' },
        ].map(s => (
          <Col md={3} key={s.label}>
            <Card className={`stat-card ${s.color} text-center`}>
              <Card.Body>
                <h3 className={`fw-bold text-${s.color === 'warning' ? 'warning' : s.color}`}>{s.count}</h3>
                <small className="text-muted">{s.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body className="d-flex align-items-center justify-content-center">
              <Button variant="outline-primary" onClick={fetchReservations}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            <i className="bi bi-list me-2"></i>Pending Reservations ({reservations.length})
          </span>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Queue #</th>
                  <th>Status</th>
                  <th>Reserved On</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No pending reservations.</td></tr>
                ) : reservations.map(res => (
                  <tr key={res.id} className={res.status === 'NOTIFIED' && isExpiringSoon(res.expiryDate) ? 'table-warning' : ''}>
                    <td>
                      <div className="fw-semibold">{res.userName}</div>
                      <small className="text-muted">{res.studentStaffId}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{res.bookTitle}</div>
                      <small className="text-muted">{res.isbn}</small>
                    </td>
                    <td className="text-center fw-bold">#{res.queuePosition}</td>
                    <td>{statusBadge(res.status)}</td>
                    <td>
                      <small>{res.reservationDate ? new Date(res.reservationDate).toLocaleDateString() : '—'}</small>
                    </td>
                    <td>
                      {res.expiryDate ? (
                        <small className={isExpiringSoon(res.expiryDate) ? 'text-danger fw-bold' : ''}>
                          {new Date(res.expiryDate).toLocaleString()}
                        </small>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm" variant="success"
                          title="Fulfill — Issue book to user"
                          onClick={() => { setFulfillRes(res); setShowFulfillModal(true); }}
                        >
                          <i className="bi bi-check-lg me-1"></i>Fulfill
                        </Button>
                        <Button
                          size="sm" variant="outline-danger"
                          title="Cancel reservation"
                          onClick={() => { setCancelRes(res); setShowCancelModal(true); }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Fulfill Modal */}
      <Modal show={showFulfillModal} onHide={() => setShowFulfillModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Fulfill Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fulfillRes && (
            <>
              <p>Issue <strong>"{fulfillRes.bookTitle}"</strong> to <strong>{fulfillRes.userName}</strong>?</p>
              <p className="text-muted small">This will issue the book and mark the reservation as fulfilled.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFulfillModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleFulfill} disabled={fulfilling}>
            {fulfilling && <Spinner size="sm" className="me-2" />}Issue & Fulfill
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Cancel reservation for <strong>"{cancelRes?.bookTitle}"</strong> by <strong>{cancelRes?.userName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No</Button>
          <Button variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReservationManagement;
