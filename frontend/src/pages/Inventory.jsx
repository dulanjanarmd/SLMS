import React, { useState, useEffect } from 'react';
import { bookAPI, categoryAPI } from '../services/api';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
  Table, Badge, Modal, Pagination
} from 'react-bootstrap';

const emptyForm = {
  title: '', author: '', additionalAuthors: '', isbn: '', isbn13: '',
  publisher: '', publicationYear: '', description: '', edition: '',
  language: 'English', format: 'Physical', shelfLocation: '',
  totalCopies: 1, replacementCost: '', ddcNumber: '',
  subjectHeadings: '', accessionNumber: '', categoryId: '',
  acquisitionDate: '',
};

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 15;

  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusBook, setStatusBook] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    fetchBooks();
    const interval = setInterval(fetchBooks, 30000);
    return () => clearInterval(interval);
  }, [page, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await bookAPI.search(keyword, {
          page,
          size: PAGE_SIZE,
          ...(statusFilter && { status: statusFilter }),
          ...(categoryFilter && { categoryId: categoryFilter }),
        });
      } else {
        res = await bookAPI.getAll({
          page,
          size: PAGE_SIZE,
          sort: 'createdAt,desc',
          ...(statusFilter && { status: statusFilter }),
          ...(categoryFilter && { categoryId: categoryFilter }),
        });
      }
      setBooks(res?.data?.content || []);
      setTotalPages(res?.data?.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Failed to load books. Please try again.');
      setBooks([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const openAdd = () => {
    setEditBook(null);
    setForm(emptyForm);
    setCoverImage(null);
    setCoverPreview('');
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title || '', author: book.author || '',
      additionalAuthors: book.additionalAuthors || '', isbn: book.isbn || '',
      isbn13: book.isbn13 || '', publisher: book.publisher || '',
      publicationYear: book.publicationYear || '', description: book.description || '',
      edition: book.edition || '', language: book.language || 'English',
      format: book.format || 'Physical', shelfLocation: book.shelfLocation || '',
      totalCopies: book.totalCopies || 1, replacementCost: book.replacementCost || '',
      ddcNumber: book.ddcNumber || '', subjectHeadings: book.subjectHeadings || '',
      accessionNumber: book.accessionNumber || '', categoryId: book.categoryId || '',
      acquisitionDate: book.acquisitionDate || '',
    });
    setCoverImage(null);
    setCoverPreview(book.coverImageUrl || '');
    setShowModal(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        publicationYear: form.publicationYear ? parseInt(form.publicationYear) : null,
        totalCopies: parseInt(form.totalCopies) || 1,
        replacementCost: form.replacementCost ? parseFloat(form.replacementCost) : 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      if (editBook) {
        await bookAPI.updateWithImage(editBook.id, payload, coverImage);
        setSuccess('Book updated successfully.');
      } else {
        await bookAPI.addWithImage(payload, coverImage);
        setSuccess('Book added successfully.');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await bookAPI.update(statusBook.id, { status: newStatus });
      setSuccess(`Book marked as ${newStatus}.`);
      setShowStatusModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    }
  };

  const statusBadge = (status) => {
    const map = { AVAILABLE: 'success', ISSUED: 'danger', RESERVED: 'warning', LOST: 'dark', DAMAGED: 'secondary', WITHDRAWN: 'secondary' };
    return <Badge bg={map[status] || 'secondary'} text={status === 'RESERVED' ? 'dark' : undefined}>{status}</Badge>;
  };

  const filteredBooks = books;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-collection me-2 text-primary"></i>Inventory Management
        </h2>
        <Button variant="dark" className="btn-pill" onClick={openAdd}>
          Add New Book
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search & Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Control
                  placeholder="Search title, author, ISBN..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ISSUED">Issued</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="LOST">Lost</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button type="submit" variant="dark" className="w-100 btn-pill">
                  Search
                </Button>
              </Col>
              <Col md={2}>
                <Button variant="dark" className="w-100 btn-pill"
                  onClick={() => { setKeyword(''); setStatusFilter(''); setCategoryFilter(''); setPage(0); fetchBooks(); }}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Books Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Title / Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Shelf</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No books found.</td></tr>
                ) : filteredBooks.map(book => (
                  <tr key={book.id}>
                    <td>
                      <div className="fw-semibold">{book.title}</div>
                      <small className="text-muted">{book.author}</small>
                    </td>
                    <td><small>{book.isbn}</small></td>
                    <td><small>{book.categoryName || '—'}</small></td>
                    <td><small>{book.shelfLocation || '—'}</small></td>
                    <td className="text-center">{book.totalCopies}</td>
                    <td className="text-center">
                      <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'}>
                        {book.availableCopies}
                      </Badge>
                    </td>
                    <td>{statusBadge(book.status)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="dark" className="btn-pill" onClick={() => openEdit(book)} title="Edit">
                          Edit
                        </Button>
                        <Button
                          size="sm" variant="dark" className="btn-pill"
                          title="Mark Lost/Damaged"
                          onClick={() => { setStatusBook(book); setNewStatus('LOST'); setShowStatusModal(true); }}
                        >
                          Update Status
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

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev disabled={page === 0} onClick={() => setPage(p => p - 1)} />
            {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
              <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>{i + 1}</Pagination.Item>
            ))}
            <Pagination.Next disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} />
          </Pagination>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editBook ? 'Edit Book' : 'Add New Book'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ISBN <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Author <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Additional Authors</Form.Label>
                  <Form.Control value={form.additionalAuthors} onChange={e => setForm({ ...form, additionalAuthors: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Control type="number" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Shelf Location</Form.Label>
                  <Form.Control value={form.shelfLocation} onChange={e => setForm({ ...form, shelfLocation: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Copies</Form.Label>
                  <Form.Control type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Replacement Cost</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.replacementCost} onChange={e => setForm({ ...form, replacementCost: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Edition</Form.Label>
                  <Form.Control value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Control value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>DDC Number</Form.Label>
                  <Form.Control value={form.ddcNumber} onChange={e => setForm({ ...form, ddcNumber: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Accession No.</Form.Label>
                  <Form.Control value={form.accessionNumber} onChange={e => setForm({ ...form, accessionNumber: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subject Headings</Form.Label>
                  <Form.Control placeholder="Comma separated" value={form.subjectHeadings} onChange={e => setForm({ ...form, subjectHeadings: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cover Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleCoverChange} />
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="mt-2 rounded"
                      style={{ height: 100, objectFit: 'cover' }}
                    />
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="btn-pill" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="dark" className="btn-pill" type="submit" disabled={saving}>
              {saving && <Spinner size="sm" className="me-2" />}
              {editBook ? 'Update Book' : 'Add Book'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Book Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Update status for: <strong>{statusBook?.title}</strong></p>
          <Form.Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            <option value="AVAILABLE">Available</option>
            <option value="LOST">Lost</option>
            <option value="DAMAGED">Damaged</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-pill" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant="dark" className="btn-pill" onClick={handleStatusChange}>Update Status</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inventory;