import React, { useState, useEffect } from 'react';
import { bookAPI, categoryAPI } from '../services/api';
import {
  Container, Table, Badge, Button, Form, Modal,
  Spinner, Card, Pagination, Alert, Row, Col, Image
} from 'react-bootstrap';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publisher: '',
    publicationYear: '',
    totalCopies: '',
    categoryId: '',
    coverImageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { 
        page: currentPage, 
        size: 15, 
        sort: 'createdAt,desc' 
      };
      
      let response;
      if (searchKeyword) {
        response = await bookAPI.search(searchKeyword, params);
      } else {
        response = await bookAPI.getAll(params);
      }
      
      let data = response.data.content || response.data;
      
      // Filter by category if selected
      if (categoryFilter && Array.isArray(data)) {
        data = data.filter(book => book.categoryId?.toString() === categoryFilter);
      }
      
      setBooks(Array.isArray(data) ? data : []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBooks();
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      publisher: '',
      publicationYear: '',
      totalCopies: '',
      categoryId: '',
      coverImageUrl: ''
    });
    setShowFormModal(true);
  };

  const openEditModal = (book) => {
    setEditMode(true);
    setSelectedBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear?.toString() || '',
      totalCopies: book.totalCopies?.toString() || '',
      categoryId: book.categoryId?.toString() || '',
      coverImageUrl: book.coverImageUrl || ''
    });
    setShowFormModal(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const payload = {
        ...formData,
        publicationYear: parseInt(formData.publicationYear) || null,
        totalCopies: parseInt(formData.totalCopies) || 1,
        categoryId: parseInt(formData.categoryId) || null
      };

      if (editMode && selectedBook) {
        await bookAPI.update(selectedBook.id, payload);
        setSuccess('Book updated successfully!');
      } else {
        await bookAPI.add(payload);
        setSuccess('Book added successfully!');
      }
      
      setShowFormModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      setSuccess('');
      await bookAPI.delete(selectedBook.id);
      setSuccess('Book deleted successfully!');
      setShowDeleteModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (loading && books.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-book me-2"></i>Book Management
        </h2>
        <Button variant="primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Book
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search and Filter Card */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap align-items-center">
            <div className="flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Form.Select
              style={{ width: 200 }}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
            <Button type="submit" variant="primary">
              <i className="bi bi-search"></i>
            </Button>
            {(searchKeyword || categoryFilter) && (
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchKeyword('');
                  setCategoryFilter('');
                  setCurrentPage(0);
                  fetchBooks();
                }}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Books Table */}
      <Card>
        <Card.Body className="p-0">
          <Table striped hover responsive className="mb-0">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th className="text-center">Total Copies</th>
                <th className="text-center">Available</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No books found
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <Image
                        src={book.coverImageUrl || 'https://via.placeholder.com/60x90?text=No+Cover'}
                        alt={book.title}
                        style={{ 
                          width: '60px', 
                          height: '90px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60x90?text=No+Cover';
                        }}
                      />
                    </td>
                    <td className="fw-semibold align-middle">{book.title}</td>
                    <td className="align-middle">{book.author}</td>
                    <td className="align-middle text-muted">{book.isbn}</td>
                    <td className="align-middle">
                      <Badge bg="info">{getCategoryName(book.categoryId)}</Badge>
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg="secondary">{book.totalCopies || 0}</Badge>
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'}>
                        {book.availableCopies || 0}
                      </Badge>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openEditModal(book)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteModal(book)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev 
              disabled={currentPage === 0} 
              onClick={() => setCurrentPage(p => p - 1)} 
            />
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              disabled={currentPage === totalPages - 1} 
              onClick={() => setCurrentPage(p => p + 1)} 
            />
          </Pagination>
        </div>
      )}

      {/* Add/Edit Book Modal */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Edit Book' : 'Add New Book'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publication Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="publicationYear"
                    value={formData.publicationYear}
                    onChange={handleFormChange}
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Copies <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="totalCopies"
                    value={formData.totalCopies}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/cover.jpg"
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.coverImageUrl && (
              <div className="text-center mb-3">
                <Image
                  src={formData.coverImageUrl}
                  alt="Cover preview"
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '200px', 
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update Book' : 'Add Book'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this book?</p>
          {selectedBook && (
            <div className="alert alert-warning">
              <strong>{selectedBook.title}</strong>
              <br />
              <small className="text-muted">by {selectedBook.author}</small>
            </div>
          )}
          <p className="text-muted small mb-0">
            This action cannot be undone. All related borrowing records will be affected.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Book
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Books;
