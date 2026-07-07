import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, borrowAPI, reservationAPI, userAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [reserving, setReserving] = useState(false);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    fetchBook();
    if (user) fetchProfile();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getById(id);
      setBook(response.data);
    } catch (err) {
      setError('Book not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
    } catch {
      // fallback to stale user
      setProfile(user);
    }
  };

  // Use live profile isMember, fallback to stored user
  const isMember = profile?.isMember ?? user?.isMember ?? false;
  const isLibrarian = user?.role === 'LIBRARIAN';

  const handleReserve = async () => {
    try {
      setReserving(true);
      setError('');
      setSuccess('');
      await reservationAPI.create({
        bookId: parseInt(id),
        userId: user.id,
      });
      setSuccess('Added to reservation queue! You will be notified when the book becomes available.');
      setShowReserveModal(false);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve book');
      setShowReserveModal(false);
    } finally {
      setReserving(false);
    }
  };

  const handleIssue = async () => {
    try {
      setIssuing(true);
      setError('');
      setSuccess('');
      const targetUserId = userId ? parseInt(userId) : user?.id;
      if (!targetUserId) {
        setError('Please enter a user ID');
        return;
      }
      await borrowAPI.issue({ userId: targetUserId, bookId: parseInt(id) });
      setSuccess('Book issued successfully!');
      setShowBorrowModal(false);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
      setShowBorrowModal(false);
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error && !book) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="dark" className="btn-pill" onClick={() => navigate('/books')}>
          Back to Catalog
        </Button>
      </Container>
    );
  }

  const renderActionButtons = () => {
    if (!user) return null;

    // Librarian: always show Issue button
    if (isLibrarian) {
      return (
        <Button variant="dark" className="btn-pill" onClick={() => setShowBorrowModal(true)}>
          Issue Book
        </Button>
      );
    }

    // Non-member: show membership prompt with option to join queue
    if (!isMember) {
      return (
        <>
          <Alert variant="warning" className="mb-2 py-2 small">
            <i className="bi bi-lock me-1"></i>Library membership required to borrow or reserve books.
          </Alert>
          <Button as={Link} to="/membership" variant="dark" size="sm" className="btn-pill">
            Apply for Membership
          </Button>
        </>
      );
    }

    // Member: only Reserve — students/faculty cannot directly borrow, must reserve first
    return (
      <>
        {book.availableCopies > 0 ? (
          <Button variant="dark" className="w-100 btn-pill" onClick={() => setShowReserveModal(true)}>
            Reserve Book
          </Button>
        ) : (
          <>
            <Alert variant="info" className="mb-2 py-2 small">
              <i className="bi bi-info-circle me-1"></i>All copies are currently borrowed.
            </Alert>
            <Button variant="dark" className="w-100 btn-pill" onClick={() => setShowReserveModal(true)}>
              Join Waiting Queue
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Button variant="dark" size="sm" className="mb-3 btn-pill" onClick={() => navigate('/books')}>
        Back to Catalog
      </Button>

      <Row>
        {/* Book Cover */}
        <Col lg={4} className="mb-4">
          <Card>
            <div
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                height: '400px',
                background: book.coverImageUrl
                  ? `url(${book.coverImageUrl}) center/cover`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px 12px 0 0',
              }}
            >
              {!book.coverImageUrl && <i className="bi bi-book" style={{ fontSize: '6rem' }}></i>}
            </div>
            <Card.Body className="text-center">
              <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'} className="fs-6 px-3 py-2">
                {book.availableCopies > 0
                  ? `${book.availableCopies} of ${book.totalCopies} Available`
                  : 'Currently Unavailable'}
              </Badge>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <Card className="mt-3">
            <Card.Body className="d-grid gap-2">
              {renderActionButtons()}
            </Card.Body>
          </Card>

          {/* Membership status indicator */}
          {user && !isLibrarian && (
            <div className="mt-2 text-center">
              {isMember ? (
                <small className="text-success">
                  <i className="bi bi-patch-check-fill me-1"></i>Active Member
                  {profile?.membershipId && ` · ${profile.membershipId}`}
                </small>
              ) : (
                <small className="text-muted">
                  <i className="bi bi-person-x me-1"></i>Not a member yet
                </small>
              )}
            </div>
          )}
        </Col>

        {/* Book Details */}
        <Col lg={8}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="fw-bold mb-2">{book.title}</h2>
              <p className="text-muted fs-5 mb-4">
                <i className="bi bi-person me-2"></i>
                {book.author}
                {book.additionalAuthors && <span className="fs-6">, {book.additionalAuthors}</span>}
              </p>

              {book.description && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Description</h5>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              <Row className="g-3">
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">ISBN</small>
                    <p className="mb-0 fw-semibold">{book.isbn}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">ISBN-13</small>
                    <p className="mb-0 fw-semibold">{book.isbn13 || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Publisher</small>
                    <p className="mb-0 fw-semibold">{book.publisher || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Publication Year</small>
                    <p className="mb-0 fw-semibold">{book.publicationYear || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Edition</small>
                    <p className="mb-0 fw-semibold">{book.edition || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Language</small>
                    <p className="mb-0 fw-semibold">{book.language || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Format</small>
                    <p className="mb-0 fw-semibold">{book.format || 'Physical'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Shelf Location</small>
                    <p className="mb-0 fw-semibold">{book.shelfLocation || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Category</small>
                    <p className="mb-0 fw-semibold">{book.categoryName || 'Uncategorized'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">DDC Number</small>
                    <p className="mb-0 fw-semibold">{book.ddcNumber || 'N/A'}</p>
                  </div>
                </Col>
                {book.replacementCost > 0 && (
                  <Col sm={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted">Replacement Cost</small>
                      <p className="mb-0 fw-semibold text-danger">LKR {book.replacementCost.toFixed(2)}</p>
                    </div>
                  </Col>
                )}
              </Row>

              {book.subjectHeadings && (
                <div className="mt-4">
                  <h6 className="fw-semibold">Subject Headings</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {book.subjectHeadings.split(',').map((tag, idx) => (
                      <Badge key={idx} bg="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showReserveModal} onHide={() => setShowReserveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bookmark-plus me-2"></i>
            {book?.availableCopies > 0 ? 'Reserve Book' : 'Join Waiting Queue'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to reserve <strong>"{book?.title}"</strong> by {book?.author}.
          </p>
          {book?.availableCopies > 0 ? (
            <Alert variant="info" className="py-2 small">
              <i className="bi bi-info-circle me-1"></i>
              This book is available. Your reservation will appear in the librarian's queue.
              Visit the library and give your <strong>Student ID or Reservation number</strong> to collect it.
            </Alert>
          ) : (
            <Alert variant="warning" className="py-2 small">
              <i className="bi bi-clock me-1"></i>
              All copies are borrowed. You will be notified when a copy becomes available.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-pill" onClick={() => setShowReserveModal(false)}>Cancel</Button>
          <Button variant="dark" className="btn-pill" onClick={handleReserve} disabled={reserving}>
            {reserving ? <Spinner size="sm" className="me-2" /> : null}
            Confirm Reservation
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Borrow / Issue Modal */}
      <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isLibrarian ? 'Issue Book' : 'Borrow Book'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to {isLibrarian ? 'issue' : 'borrow'} <strong>"{book?.title}"</strong>.</p>
          {isLibrarian && (
            <Form.Group className="mb-3">
              <Form.Label>User ID (leave blank for self)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Form.Text className="text-muted">
                As a librarian, you can issue books on behalf of other users.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-pill" onClick={() => setShowBorrowModal(false)}>Cancel</Button>
          <Button variant="dark" className="btn-pill" onClick={handleIssue} disabled={issuing}>
            {issuing ? <Spinner size="sm" className="me-2" /> : null}
            {isLibrarian ? 'Issue Now' : 'Borrow Now'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookDetail;