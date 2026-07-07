import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, reservationAPI, userAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserving, setReserving] = useState(false);

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
      setProfile(user);
    }
  };

  const isMember = profile?.isMember ?? user?.isMember ?? false;
  const isLibrarian = user?.role === 'LIBRARIAN';

  const handleReserve = async () => {
    try {
      setReserving(true);
      setError('');
      setSuccess('');
      await reservationAPI.create({ bookId: parseInt(id), userId: user.id });
      setSuccess('Added to reservation queue! Visit the library with your Reservation ID to collect the book.');
      setShowReserveModal(false);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve book');
      setShowReserveModal(false);
    } finally {
      setReserving(false);
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

    // Librarian: link to dedicated Issue Book page
    if (isLibrarian) {
      return (
        <Button variant="dark" className="btn-pill w-100" as={Link} to="/librarian/issue">
          <i className="bi bi-book-half me-2"></i>Go to Issue Book
        </Button>
      );
    }

    // Non-member
    if (!isMember) {
      return (
        <>
          <Alert variant="warning" className="mb-2 py-2 small">
            <i className="bi bi-lock me-1"></i>Library membership required to reserve books.
          </Alert>
          <Button as={Link} to="/membership" variant="dark" size="sm" className="btn-pill w-100">
            Apply for Membership
          </Button>
        </>
      );
    }

    // Member: Reserve only
    return (
      <>
        {book.availableCopies > 0 ? (
          <Button variant="dark" className="w-100 btn-pill" onClick={() => setShowReserveModal(true)}>
            <i className="bi bi-bookmark-plus me-2"></i>Reserve Book
          </Button>
        ) : (
          <>
            <Alert variant="info" className="mb-2 py-2 small">
              <i className="bi bi-info-circle me-1"></i>All copies are currently borrowed.
            </Alert>
            <Button variant="dark" className="w-100 btn-pill" onClick={() => setShowReserveModal(true)}>
              <i className="bi bi-clock me-2"></i>Join Waiting Queue
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
        <i className="bi bi-arrow-left me-1"></i>Back to Catalog
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

          <Card className="mt-3">
            <Card.Body className="d-grid gap-2">
              {renderActionButtons()}
            </Card.Body>
          </Card>

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
                {[
                  { label: 'ISBN', value: book.isbn },
                  { label: 'ISBN-13', value: book.isbn13 || 'N/A' },
                  { label: 'Publisher', value: book.publisher || 'N/A' },
                  { label: 'Publication Year', value: book.publicationYear || 'N/A' },
                  { label: 'Edition', value: book.edition || 'N/A' },
                  { label: 'Language', value: book.language || 'N/A' },
                  { label: 'Format', value: book.format || 'Physical' },
                  { label: 'Shelf Location', value: book.shelfLocation || 'N/A' },
                  { label: 'Category', value: book.categoryName || 'Uncategorized' },
                  { label: 'DDC Number', value: book.ddcNumber || 'N/A' },
                ].map(({ label, value }) => (
                  <Col sm={6} key={label}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted">{label}</small>
                      <p className="mb-0 fw-semibold">{value}</p>
                    </div>
                  </Col>
                ))}
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

      {/* Reserve Modal */}
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
              This book is available. Visit the library and show your{' '}
              <strong>Student ID or Reservation number</strong> to collect it.
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
    </Container>
  );
};

export default BookDetail;
