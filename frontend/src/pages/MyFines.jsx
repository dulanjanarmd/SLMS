import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fineAPI } from '../services/api';
import { Container, Row, Col, Table, Badge, Button, Alert, Spinner, Card, Modal, Form } from 'react-bootstrap';

const MyFines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await fineAPI.getUserFines(user.id);
      setFines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (fine) => {
    setSelectedFine(fine);
    setPayAmount(fine.remainingAmount.toFixed(2));
    setShowPayModal(true);
  };

  const handlePay = async () => {
    try {
      setError('');
      setSuccess('');
      await fineAPI.pay({
        fineId: selectedFine.id,
        amount: parseFloat(payAmount),
        paymentMethod: 'ONLINE',
      });
      setSuccess('Payment successful!');
      setShowPayModal(false);
      fetchFines();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNPAID': return <Badge bg="danger">Unpaid</Badge>;
      case 'PARTIALLY_PAID': return <Badge bg="warning" text="dark">Partial</Badge>;
      case 'PAID': return <Badge bg="success">Paid</Badge>;
      case 'WAIVED': return <Badge bg="secondary">Waived</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const totalOutstanding = fines
    .filter(f => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID')
    .reduce((sum, f) => sum + f.remainingAmount, 0);

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
        <i className="bi bi-cash-coin me-2"></i>My Fines
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Summary Card */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stat-card danger text-center">
            <Card.Body>
              <h3 className="text-danger fw-bold mb-1">
                LKR {totalOutstanding.toFixed(2)}
              </h3>
              <small className="text-muted">Total Outstanding</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card warning text-center">
            <Card.Body>
              <h3 className="text-warning fw-bold mb-1">
                {fines.filter(f => f.status === 'UNPAID').length}
              </h3>
              <small className="text-muted">Unpaid Fines</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card success text-center">
            <Card.Body>
              <h3 className="text-success fw-bold mb-1">
                {fines.filter(f => f.status === 'PAID').length}
              </h3>
              <small className="text-muted">Paid Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="fw-semibold">
          <i className="bi bi-list me-2"></i>Fine History
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th>Book</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No fines. Keep returning books on time!
                  </td>
                </tr>
              ) : (
                fines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="fw-semibold">{fine.bookTitle}</td>
                    <td style={{ maxWidth: '200px' }}>
                      <small>{fine.description}</small>
                    </td>
                    <td>LKR {fine.amount.toFixed(2)}</td>
                    <td>LKR {fine.paidAmount.toFixed(2)}</td>
                    <td className="fw-semibold text-danger">
                      LKR {fine.remainingAmount.toFixed(2)}
                    </td>
                    <td>{getStatusBadge(fine.status)}</td>
                    <td>
                      {(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handlePayClick(fine)}
                        >
                          <i className="bi bi-credit-card me-1"></i>Pay
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

      {/* Payment Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pay Fine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFine && (
            <>
              <p>Book: <strong>{selectedFine.bookTitle}</strong></p>
              <p>Total Amount: LKR {selectedFine.amount.toFixed(2)}</p>
              <p>Already Paid: LKR {selectedFine.paidAmount.toFixed(2)}</p>
              <p className="fw-bold">Remaining: LKR {selectedFine.remainingAmount.toFixed(2)}</p>
              <Form.Group>
                <Form.Label>Payment Amount (LKR)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedFine.remainingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handlePay}>
            <i className="bi bi-credit-card me-2"></i>Pay Now
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyFines;
