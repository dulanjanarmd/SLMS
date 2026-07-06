import React, { useState } from 'react';
import { borrowAPI, bookAPI, userAPI } from '../services/api';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
  Table, Badge, Modal
} from 'react-bootstrap';

const IssueBook = () => {
  const [studentQuery, setStudentQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!studentQuery.trim()) return;
    setStudentLoading(true);
    setStudentError('');
    setStudent(null);
    try {
      const res = await userAPI.searchUsers(studentQuery);
      const users = res.data.content || [];
      if (users.length === 0) {
        setStudentError('No user found with that ID or name.');
      } else {
        setStudent(users[0]);
      }
    } catch {
      setStudentError('Search failed. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault();
    if (!bookQuery.trim()) return;
    setBookLoading(true);
    setBookError('');
    setBookResults([]);
    try {
      const res = await bookAPI.search(bookQuery, { page: 0, size: 8 });
      const books = res.data.content || [];
      if (books.length === 0) setBookError('No books found.');
      setBookResults(books);
    } catch {
      setBookError('Book search failed.');
    } finally {
      setBookLoading(false);
    }
  };

  const getLoanDays = (role) => (role === 'FACULTY' || role === 'LIBRARIAN' ? 30 : 14);

  const getDueDate = () => {
    if (!student) return '';
    const d = new Date();
    d.setDate(d.getDate() + getLoanDays(student.role));
    return d.toLocaleDateString();
  };

  const eligibilityIssues = () => {
    if (!student) return [];
    const issues = [];
    if (!student.isActive) issues.push('Account is deactivated.');
    if ((student.outstandingFine || 0) > 500)
      issues.push(`Outstanding fine LKR ${student.outstandingFine?.toFixed(2)} exceeds LKR 500.`);
    const max = student.maxBooksAllowed || 4;
    if ((student.currentBorrowCount || 0) >= max)
      issues.push(`Borrow limit reached (${student.currentBorrowCount}/${max}).`);
    return issues;
  };

  const canIssue =
    student && selectedBook && selectedBook.availableCopies > 0 && eligibilityIssues().length === 0;

  const handleIssue = async () => {
    setIssuing(true);
    try {
      const res = await borrowAPI.issue({ userId: student.id, bookId: selectedBook.id });
      setSuccess(res.data);
      setShowConfirm(false);
      setStudent(null); setSelectedBook(null); setBookResults([]);
      setStudentQuery(''); setBookQuery('');
    } catch (err) {
      setBookError(err.response?.data?.message || 'Failed to issue book.');
      setShowConfirm(false);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-book-half me-2 text-primary"></i>Issue Book
      </h2>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <i className="bi bi-check-circle me-2"></i>
          <strong>Issued!</strong> "{success.bookTitle}" → <strong>{success.userName}</strong>.
          Due: <strong>{success.dueDate}</strong>
        </Alert>
      )}

      <Row className="g-4">
        {/* Step 1 */}
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-semibold" style={{ background: '#003366', color: '#fff' }}>
              <i className="bi bi-person-search me-2"></i>Step 1 — Find Borrower
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleStudentSearch}>
                <Form.Label>Student/Staff ID or Name</Form.Label>
                <div className="d-flex gap-2 mb-3">
                  <Form.Control
                    placeholder="e.g. IT12345678 or John Doe"
                    value={studentQuery}
                    onChange={e => setStudentQuery(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" disabled={studentLoading}>
                    {studentLoading ? <Spinner size="sm" /> : <i className="bi bi-search"></i>}
                  </Button>
                </div>
              </Form>

              {studentError && <Alert variant="danger" className="py-2 small">{studentError}</Alert>}

              {student && (
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{student.fullName}</div>
                      <div className="text-muted small">{student.studentStaffId} · {student.email}</div>
                      <div className="text-muted small">{student.faculty || ''}</div>
                    </div>
                    <Badge bg={student.role === 'FACULTY' ? 'info' : 'primary'}>{student.role}</Badge>
                  </div>
                  <Row className="text-center mt-2 g-1">
                    <Col xs={4}>
                      <div className="fw-bold text-primary">{student.currentBorrowCount || 0}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Active Loans</div>
                    </Col>
                    <Col xs={4}>
                      <div className="fw-bold text-primary">{student.maxBooksAllowed || 4}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Max Books</div>
                    </Col>
                    <Col xs={4}>
                      <div className={`fw-bold ${(student.outstandingFine || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                        LKR {(student.outstandingFine || 0).toFixed(0)}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Fine</div>
                    </Col>
                  </Row>
                  {eligibilityIssues().length > 0 ? (
                    <Alert variant="danger" className="mt-2 mb-0 py-2 small">
                      {eligibilityIssues().map((i, k) => <div key={k}><i className="bi bi-x-circle me-1"></i>{i}</div>)}
                    </Alert>
                  ) : (
                    <Alert variant="success" className="mt-2 mb-0 py-2 small">
                      <i className="bi bi-check-circle me-1"></i>Eligible · Loan period: <strong>{getLoanDays(student.role)} days</strong>
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Step 2 */}
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-semibold" style={{ background: '#003366', color: '#fff' }}>
              <i className="bi bi-search me-2"></i>Step 2 — Find Book
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleBookSearch}>
                <Form.Label>Title, ISBN, or Barcode</Form.Label>
                <div className="d-flex gap-2 mb-3">
                  <Form.Control
                    placeholder="e.g. Clean Code or 978-0-13-468599-1"
                    value={bookQuery}
                    onChange={e => setBookQuery(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" disabled={bookLoading}>
                    {bookLoading ? <Spinner size="sm" /> : <i className="bi bi-search"></i>}
                  </Button>
                </div>
              </Form>

              {bookError && <Alert variant="danger" className="py-2 small">{bookError}</Alert>}

              {bookResults.length > 0 && !selectedBook && (
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <Table hover size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Title / Author</th>
                        <th>ISBN</th>
                        <th>Avail.</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookResults.map(b => (
                        <tr key={b.id}>
                          <td>
                            <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{b.title}</div>
                            <small className="text-muted">{b.author}</small>
                          </td>
                          <td><small>{b.isbn}</small></td>
                          <td>
                            <Badge bg={b.availableCopies > 0 ? 'success' : 'danger'}>
                              {b.availableCopies}/{b.totalCopies}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              size="sm" variant="outline-primary"
                              disabled={b.availableCopies === 0}
                              onClick={() => { setSelectedBook(b); setBookResults([]); }}
                            >
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {selectedBook && (
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{selectedBook.title}</div>
                      <div className="text-muted small">{selectedBook.author}</div>
                      <div className="text-muted small">ISBN: {selectedBook.isbn} · Shelf: {selectedBook.shelfLocation || 'N/A'}</div>
                    </div>
                    <div className="text-end">
                      <Badge bg={selectedBook.availableCopies > 0 ? 'success' : 'danger'} className="d-block mb-1">
                        {selectedBook.availableCopies} avail.
                      </Badge>
                      <Button size="sm" variant="outline-secondary" onClick={() => setSelectedBook(null)}>
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Step 3: Confirm */}
      {student && selectedBook && (
        <Card className="mt-4 border-success">
          <Card.Header className="fw-semibold bg-success text-white">
            <i className="bi bi-check2-square me-2"></i>Step 3 — Confirm Issue
          </Card.Header>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <div className="text-muted small mb-1">BORROWER</div>
                <div className="fw-bold">{student.fullName}</div>
                <div className="text-muted small">{student.studentStaffId} · {student.role}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small mb-1">BOOK</div>
                <div className="fw-bold">{selectedBook.title}</div>
                <div className="text-muted small">{selectedBook.author}</div>
              </Col>
              <Col md={2}>
                <div className="text-muted small mb-1">DUE DATE</div>
                <div className="fw-bold text-primary">{getDueDate()}</div>
                <div className="text-muted small">{getLoanDays(student.role)} days</div>
              </Col>
              <Col md={2} className="text-end">
                <Button
                  variant="success" size="lg"
                  disabled={!canIssue || issuing}
                  onClick={() => setShowConfirm(true)}
                >
                  <i className="bi bi-book me-2"></i>Issue
                </Button>
                {!canIssue && selectedBook.availableCopies === 0 && (
                  <div className="text-danger small mt-1">Not available</div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Issue <strong>"{selectedBook?.title}"</strong> to <strong>{student?.fullName}</strong>?
          <div className="text-muted small mt-1">Due date: {getDueDate()}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="success" onClick={handleIssue} disabled={issuing}>
            {issuing && <Spinner size="sm" className="me-2" />}Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IssueBook;
