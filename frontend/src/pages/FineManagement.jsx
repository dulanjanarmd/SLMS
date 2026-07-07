import React, { useState, useEffect } from 'react';
import { fineAPI } from '../services/api';
import {
  Container, Row, Col, Card, Table, Badge, Button, Alert,
  Spinner, Modal, Form
} from 'react-bootstrap';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('UNPAID');
  const [stats, setStats] = useState({ totalOutstanding: 0, totalCollected: 0 });

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [waiveReason, setWaiveReason] = useState('');
  const [waiving, setWaiving] = useState(false);

  useEffect(() => { fetchFines(); fetchStats(); }, [filter]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = filter === 'ALL' ? await fineAPI.getAll() : await fineAPI.getAllUnpaid();
      setFines(res.data || []);
    } catch {
      setError('Failed to load fines.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fineAPI.getStats();
      setStats(res.data || {});
    } catch { /* silent */ }
  };

  const handlePayClick = (fine) => {
    setSelectedFine(fine);
    setPayAmount(fine.remainingAmount?.toFixed(2) || '');
    setShowPayModal(true);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await fineAPI.pay({ fineId: selectedFine.id, amount: parseFloat(payAmount), paymentMethod: 'CASH' });
      setSuccess(`Payment of LKR ${payAmount} recorded for ${selectedFine.userName}.`);
      setShowPayModal(false);
      fetchFines();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleWaive = async () => {
    setWaiving(true);
    try {
      await fineAPI.waive(selectedFine.id, selectedFine.remainingAmount, waiveReason || 'Waived by librarian');
      setSuccess(`Fine waived for ${selectedFine.userName}.`);
      setShowWaiveModal(false);
      setWaiveReason('');
      fetchFines();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Waive failed.');
    } finally {
      setWaiving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { UNPAID: 'danger', PARTIALLY_PAID: 'warning', PAID: 'success', WAIVED: 'secondary' };
    return <Badge bg={map[status] || 'secondary'} text={status === 'PARTIALLY_PAID' ? 'dark' : undefined}>{status.replace('_', ' ')}</Badge>;
  };

  const displayFines = filter === 'ALL' ? fines : fines.filter(f => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID');

  const totalOutstanding = displayFines.reduce((s, f) => s + (f.remainingAmount || 0), 0);

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-cash-coin me-2 text-danger"></i>Fine Management
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="stat-card danger text-center">
            <Card.Body>
              <h4 className="fw-bold text-danger mb-0">LKR {(stats.totalOutstanding || 0).toFixed(2)}</h4>
              <small className="text-muted">Total Outstanding</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card success text-center">
            <Card.Body>
              <h4 className="fw-bold text-success mb-0">LKR {(stats.totalCollected || 0).toFixed(2)}</h4>
              <small className="text-muted">Total Collected</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card warning text-center">
            <Card.Body>
              <h4 className="fw-bold text-warning mb-0">LKR {totalOutstanding.toFixed(2)}</h4>
              <small className="text-muted">Showing Outstanding</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body className="d-flex align-items-center justify-content-center gap-2">
              <Button
                variant={filter === 'UNPAID' ? 'dark' : 'outline-dark'}
                size="sm" className="btn-pill" onClick={() => setFilter('UNPAID')}
              >Unpaid</Button>
              <Button
                variant={filter === 'ALL' ? 'dark' : 'outline-dark'}
                size="sm" className="btn-pill" onClick={() => setFilter('ALL')}
              >All</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="fw-semibold">
          <i className="bi bi-list me-2"></i>
          {filter === 'UNPAID' ? 'Unpaid Fines' : 'All Fines'} ({displayFines.length})
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
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayFines.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No fines found.</td></tr>
                ) : displayFines.map(fine => (
                  <tr key={fine.id}>
                    <td>
                      <div className="fw-semibold">{fine.userName}</div>
                      <small className="text-muted">{fine.studentStaffId}</small>
                    </td>
                    <td><small>{fine.bookTitle}</small></td>
                    <td><small className="text-muted">{fine.description}</small></td>
                    <td className="fw-semibold">LKR {fine.amount?.toFixed(2)}</td>
                    <td className="text-success">LKR {fine.paidAmount?.toFixed(2)}</td>
                    <td className="fw-bold text-danger">LKR {fine.remainingAmount?.toFixed(2)}</td>
                    <td>{statusBadge(fine.status)}</td>
                    <td><small>{fine.fineDate || '—'}</small></td>
                    <td>
                      {(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="dark" className="btn-pill" onClick={() => handlePayClick(fine)}>
                            Collect
                          </Button>
                          <Button
                            size="sm" variant="dark" className="btn-pill"
                            onClick={() => { setSelectedFine(fine); setShowWaiveModal(true); }}
                            title="Waive fine"
                          >
                            Waive
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Payment Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-cash me-2"></i>Collect Fine Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFine && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <div><strong>User:</strong> {selectedFine.userName}</div>
                <div><strong>Book:</strong> {selectedFine.bookTitle}</div>
                <div><strong>Total Fine:</strong> LKR {selectedFine.amount?.toFixed(2)}</div>
                <div><strong>Already Paid:</strong> LKR {selectedFine.paidAmount?.toFixed(2)}</div>
                <div className="text-danger fw-bold"><strong>Remaining:</strong> LKR {selectedFine.remainingAmount?.toFixed(2)}</div>
              </div>
              <Form.Group>
                <Form.Label>Payment Amount (LKR)</Form.Label>
                <Form.Control
                  type="number" step="0.01" min="0.01"
                  max={selectedFine.remainingAmount}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                />
                <Form.Text className="text-muted">Payment method: Cash</Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-pill" onClick={() => setShowPayModal(false)}>Cancel</Button>
          <Button variant="dark" className="btn-pill" onClick={handlePay} disabled={paying || !payAmount}>
            {paying && <Spinner size="sm" className="me-2" />}
            Record Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Waive Modal */}
      <Modal show={showWaiveModal} onHide={() => setShowWaiveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-slash-circle me-2"></i>Waive Fine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFine && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <div><strong>User:</strong> {selectedFine.userName}</div>
                <div><strong>Book:</strong> {selectedFine.bookTitle}</div>
                <div className="text-danger fw-bold">Remaining: LKR {selectedFine.remainingAmount?.toFixed(2)}</div>
              </div>
              <Form.Group>
                <Form.Label>Reason for Waiver</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  placeholder="Enter reason..."
                  value={waiveReason}
                  onChange={e => setWaiveReason(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-pill" onClick={() => setShowWaiveModal(false)}>Cancel</Button>
          <Button variant="dark" className="btn-pill" onClick={handleWaive} disabled={waiving}>
            {waiving && <Spinner size="sm" className="me-2" />}
            Waive Full Amount
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FineManagement;