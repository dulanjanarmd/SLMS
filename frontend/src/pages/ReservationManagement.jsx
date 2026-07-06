import React, { useState, useEffect } from 'react';
import { reservationAPI, borrowAPI } from '../services/api';
import {
  Container, Card, Table, Badge, Button, Alert, Spinner, Modal, Form, Row, Col, InputGroup
} from 'react-bootstrap';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lookup by reservation ID or student ID
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillRes, setFulfillRes] = useState(null);
  const [fulfilling, setFulfilling] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRes, setCancelRes] = useState(null);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationAPI.getActive();
      setReservations(res.data || []);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  // Lookup reservation by reservation ID (numeric) or filter list by student ID
  const handleLookup = async () => {
    const val = lookupInput.trim();
    if (!val) return;
    setLookupError('');
    setLookupResult(null);
    setLookupLoading(true);
    try {
      // If purely numeric, try as reservation ID first
      if (/^\d+$/.test(val)) {
        const res = await reservationAPI.getById(val);
        if (res.data) {
          setLookupResult(res.data);
          setLookupLoading(false);
          return;
        }
      }
      // Otherwise filter loaded list by studentStaffId
      const match = reservations.find(
        r => r.studentStaffId?.toLowerCase() === val.toLowerCase()
      );
      if (match) {
        setLookupResult(match);
      } else {
        setLookupError('No active reservation found for that ID.');
      }
    } catch {
      // Try filtering by studentStaffId as fallback
      const match = reservations.find(
        r => r.studentStaffId?.toLowerCase() === val.toLowerCase()
      );
      if (match) {
        setLookupResult(match);
      } else {
        setLookupError('No active reservation found for that ID.');
      }
    } finally {
      setLookupLoading(false);
    }
  };

  // Fulfill = issue the book to the user and mark reservation fulfilled in one call
  const handleFulfill = async () => {
    setFulfilling(true);
    try {
      await borrowAPI.issue({
        userId: fulfillRes.userId,
        bookId: fulfillRes.bookId,
        reservationId: fulfillRes.id,
      });
      setSuccess(`"${fulfillRes.bookTitle}" issued to ${fulfillRes.userName} (${fulfillRes.studentStaffId}) successfully.`);
      setShowFulfillModal(false);
      setLookupResult(null);
      setLookupInput('');
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
      setLookupResult(null);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed.');
      setShowCancelModal(false);
    }
  };

  const openFulfill = (res) => { setFulfillRes(res); setShowFulfillModal(true); };
  const openCancel = (res) => { setCancelRes(res); setShowCancelModal(true); };

  const statusBadge = (status) => {
    const map = {
      PENDING: ['warning', 'dark'],
      NOTIFIED: ['info', undefined],
      FULFILLED: ['success', undefined],
      CANCELLED: ['secondary', undefined],
      EXPIRED: ['danger', undefined],
    };
    const [bg, text] = map[status] || ['secondary', undefined];
    return <Badge bg={bg} text={text}>{status}</Badge>;
  };

  const ReservationRow = ({ res }) => (
    <tr>
      <td>
        <div className="fw-semibold">{res.userName}</div>
        <small className="text-muted">{res.studentStaffId}</small>
      </td>
      <td>
        <div className="fw-semibold">{res.bookTitle}</div>
        <small className="text-muted">{res.isbn}</small>
      </td>
      <td className="text-center fw-bold">#{res.id}</td>
      <td>{statusBadge(res.status)}</td>
      <td><small>{res.reservationDate ? new Date(res.reservationDate).toLocaleDateString() : '—'}</small></td>
      <td>
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => openFulfill(res)}>
            <i className="bi bi-check-lg me-1"></i>Issue Book
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => openCancel(res)}>
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-bookmark-check me-2 text-warning"></i>Reservation Management
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Step 1: Student walks in — librarian looks up by reservation ID or student ID */}
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white fw-semibold">
          <i className="bi bi-search me-2"></i>Step 1 — Look Up Student Reservation
        </Card.Header>
        <Card.Body>
          <p className="text-muted small mb-3">
            When a student arrives at the library, enter their <strong>Reservation ID</strong> or <strong>Student/Staff ID</strong> to find their reservation.
          </p>
          <InputGroup style={{ maxWidth: 420 }}>
            <Form.Control
              placeholder="Enter Reservation ID or Student ID..."
              value={lookupInput}
              onChange={e => { setLookupInput(e.target.value); setLookupResult(null); setLookupError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
            <Button variant="primary" onClick={handleLookup} disabled={lookupLoading || !lookupInput.trim()}>
              {lookupLoading ? <Spinner size="sm" /> : <><i className="bi bi-search me-1"></i>Find</>}
            </Button>
          </InputGroup>

          {lookupError && <Alert variant="warning" className="mt-3 mb-0 py-2">{lookupError}</Alert>}

          {lookupResult && (
            <Card className="mt-3 border-success">
              <Card.Body>
                <Row className="align-items-center">
                  <Col>
                    <div className="fw-bold fs-5">{lookupResult.bookTitle}</div>
                    <div className="text-muted">{lookupResult.bookAuthor}</div>
                    <div className="mt-1">
                      <span className="me-3"><strong>Student:</strong> {lookupResult.userName} ({lookupResult.studentStaffId})</span>
                      <span className="me-3"><strong>Reservation #:</strong> {lookupResult.id}</span>
                      <span>{statusBadge(lookupResult.status)}</span>
                    </div>
                  </Col>
                  <Col xs="auto" className="d-flex gap-2">
                    <Button variant="success" onClick={() => openFulfill(lookupResult)}>
                      <i className="bi bi-book me-2"></i>Issue Book
                    </Button>
                    <Button variant="outline-danger" onClick={() => openCancel(lookupResult)}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>

      {/* Step 2: All active reservations */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            <i className="bi bi-list me-2"></i>All Active Reservations ({reservations.length})
          </span>
          <Button variant="outline-secondary" size="sm" onClick={fetchReservations}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Reservation #</th>
                  <th>Status</th>
                  <th>Reserved On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No active reservations.</td></tr>
                ) : reservations.map(res => <ReservationRow key={res.id} res={res} />)}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Issue Book Modal */}
      <Modal show={showFulfillModal} onHide={() => setShowFulfillModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-book me-2"></i>Issue Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fulfillRes && (
            <>
              <p className="mb-1">Issue <strong>"{fulfillRes.bookTitle}"</strong> to:</p>
              <p className="mb-0 fs-5 fw-semibold">{fulfillRes.userName}</p>
              <p className="text-muted">Student/Staff ID: {fulfillRes.studentStaffId}</p>
              <Alert variant="info" className="py-2 small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                This will create an active loan record and mark the reservation as fulfilled.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFulfillModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleFulfill} disabled={fulfilling}>
            {fulfilling ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-check-lg me-2"></i>}
            Confirm Issue
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
