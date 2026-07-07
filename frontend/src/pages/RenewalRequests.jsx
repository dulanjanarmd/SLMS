import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../services/api';
import { Container, Card, Table, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap';

const RenewalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'deny', loan }
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await borrowAPI.getRenewalRequests();
      setRequests(res.data || []);
    } catch {
      setError('Failed to load renewal requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      if (actionModal.type === 'approve') {
        await borrowAPI.approveRenewal(actionModal.loan.id);
        setSuccess(`Renewal approved for "${actionModal.loan.bookTitle}" — ${actionModal.loan.userName}.`);
      } else {
        await borrowAPI.denyRenewal(actionModal.loan.id);
        setSuccess(`Renewal denied for "${actionModal.loan.bookTitle}" — ${actionModal.loan.userName}.`);
      }
      setActionModal(null);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
      setActionModal(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-arrow-repeat me-2 text-primary"></i>Renewal Requests
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Pending Renewal Requests ({requests.length})</span>
          <Button variant="outline-secondary" size="sm" onClick={fetchRequests}>
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
                  <th>Borrower</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Current Due Date</th>
                  <th>Renewals Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No pending renewal requests.</td></tr>
                ) : requests.map(loan => (
                  <tr key={loan.id}>
                    <td>
                      <div className="fw-semibold">{loan.userName}</div>
                      <small className="text-muted">{loan.studentStaffId}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{loan.bookTitle}</div>
                      <small className="text-muted">{loan.isbn}</small>
                    </td>
                    <td>{loan.issueDate}</td>
                    <td>
                      <span className={new Date(loan.dueDate) < new Date() ? 'text-danger fw-bold' : ''}>
                        {loan.dueDate}
                      </span>
                    </td>
                    <td>
                      <Badge bg={loan.renewalCount >= 1 ? 'warning' : 'secondary'} text="dark">
                        {loan.renewalCount}/2
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="success"
                          onClick={() => setActionModal({ type: 'approve', loan })}>
                          <i className="bi bi-check-lg me-1"></i>Approve
                        </Button>
                        <Button size="sm" variant="outline-danger"
                          onClick={() => setActionModal({ type: 'deny', loan })}>
                          <i className="bi bi-x-lg me-1"></i>Deny
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

      <Modal show={!!actionModal} onHide={() => setActionModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionModal?.type === 'approve' ? 'Approve Renewal' : 'Deny Renewal'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionModal?.type === 'approve' ? (
            <>
              <p>Approve renewal for <strong>"{actionModal.loan.bookTitle}"</strong>?</p>
              <p className="text-muted small mb-0">
                Borrower: {actionModal.loan.userName} ({actionModal.loan.studentStaffId})<br />
                A new due date will be set from today.
              </p>
            </>
          ) : (
            <>
              <p>Deny renewal for <strong>"{actionModal.loan.bookTitle}"</strong>?</p>
              <p className="text-muted small mb-0">
                The member will be notified and must return the book by the current due date: <strong>{actionModal?.loan.dueDate}</strong>.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          <Button
            variant={actionModal?.type === 'approve' ? 'success' : 'danger'}
            onClick={handleAction}
            disabled={processing}
          >
            {processing && <Spinner size="sm" className="me-2" />}
            {actionModal?.type === 'approve' ? 'Approve' : 'Deny'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RenewalRequests;
