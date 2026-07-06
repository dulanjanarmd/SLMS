import React, { useState } from 'react';
import { borrowAPI, bookAPI } from '../services/api';
import api from '../services/api';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
  Table, Badge, Modal
} from 'react-bootstrap';

const ReturnBook = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [returning, setReturning] = useState(false);

  // Search active loans by student ID, name, or book title/ISBN
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      // Get all active loans and filter client-side
      const res = await api.get('/librarian/borrow/all-active');
      const loans = res.data || [];
      const q = query.toLowerCase();
      const filtered = loans.filter(l =>
        l.userName?.toLowerCase().includes(q) ||
        l.studentStaffId?.toLowerCase().includes(q) ||
        l.bookTitle?.toLowerCase().includes(q) ||
        l.isbn?.toLowerCase().includes(q)
      );
      if (filtered.length === 0) setError('No active loans found matching that query.');
      setResults(filtered);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calcFine = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    if (today <= due) return { overdue: false, days: 0, amount: 0 };
    const days = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return { overdue: true, days, amount: days * 5 };
  };

  const handleReturn = async () => {
    setReturning(true);
    try {
      const res = await borrowAPI.return(selected.id);
      setSuccess(res.data);
      setShowConfirm(false);
      setSelected(null);
      setResults(prev => prev.filter(r => r.id !== selected.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed.');
      setShowConfirm(false);
    } finally {
      setReturning(false);
    }
  };

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-arrow-return-left me-2 text-success"></i>Return Book
      </h2>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <i className="bi bi-check-circle me-2"></i>
          <strong>Returned!</strong> "{success.bookTitle}" returned by <strong>{success.userName}</strong>.
          {success.fineAmount > 0 && (
            <span className="ms-2 text-danger fw-bold">Fine imposed: LKR {success.fineAmount?.toFixed(2)}</span>
          )}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="fw-semibold" style={{ background: '#003366', color: '#fff' }}>
          <i className="bi bi-search me-2"></i>Search Active Loans
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end g-2">
              <Col md={8}>
                <Form.Label>Student/Staff ID, Name, Book Title, or ISBN</Form.Label>
                <Form.Control
                  placeholder="e.g. IT12345678 or Clean Code"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  required
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : <><i className="bi bi-search me-1"></i>Search</>}
                </Button>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary" className="w-100"
                  onClick={async () => {
                    setLoading(true); setError(''); setQuery('');
                    try {
                      const res = await api.get('/librarian/borrow/all-active');
                      setResults(res.data || []);
                    } catch { setError('Failed to load.'); }
                    finally { setLoading(false); }
                  }}
                >
                  <i className="bi bi-list me-1"></i>All Active
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      {results.length > 0 && (
        <Card>
          <Card.Header className="fw-semibold">
            Active Loans ({results.length})
          </Card.Header>
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine (if returned today)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map(loan => {
                  const fine = calcFine(loan.dueDate);
                  return (
                    <tr key={loan.id} className={fine.overdue ? 'table-danger' : ''}>
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
                        <span className={fine.overdue ? 'text-danger fw-bold' : ''}>{loan.dueDate}</span>
                        {fine.overdue && (
                          <div className="text-danger" style={{ fontSize: '0.75rem' }}>
                            {fine.days} days overdue
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg={fine.overdue ? 'danger' : loan.status === 'RENEWED' ? 'info' : 'success'}>
                          {fine.overdue ? 'OVERDUE' : loan.status}
                        </Badge>
                      </td>
                      <td>
                        {fine.overdue ? (
                          <span className="text-danger fw-bold">LKR {fine.amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-success">No fine</span>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm" variant="success"
                          onClick={() => { setSelected(loan); setShowConfirm(true); }}
                        >
                          <i className="bi bi-arrow-return-left me-1"></i>Return
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Confirm Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (() => {
            const fine = calcFine(selected.dueDate);
            return (
              <>
                <p>Return <strong>"{selected.bookTitle}"</strong> from <strong>{selected.userName}</strong>?</p>
                {fine.overdue ? (
                  <Alert variant="danger" className="py-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Overdue by {fine.days} days.</strong> Fine: <strong>LKR {fine.amount.toFixed(2)}</strong> will be imposed.
                  </Alert>
                ) : (
                  <Alert variant="success" className="py-2">
                    <i className="bi bi-check-circle me-2"></i>Returned on time. No fine.
                  </Alert>
                )}
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="success" onClick={handleReturn} disabled={returning}>
            {returning && <Spinner size="sm" className="me-2" />}Confirm Return
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReturnBook;
