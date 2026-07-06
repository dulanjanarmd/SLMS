import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, categoryAPI } from '../services/api';
import { Container, Row, Col, Card, Form, Button, Badge, Pagination, Spinner, Alert } from 'react-bootstrap';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    author: '',
    isbn: '',
    year: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getAll({
        page: currentPage,
        size: pageSize,
        sort: 'createdAt,desc',
      });
      setBooks(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 0);
      setError('');
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchKeyword.trim()) {
        const response = await bookAPI.search(searchKeyword, {
          page: 0,
          size: pageSize,
        });
        setBooks(response.data.content || response.data || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        fetchBooks();
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await bookAPI.advancedSearch({
        ...advancedSearch,
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        page: 0,
        size: pageSize,
      });
      setBooks(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Advanced search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      if (categoryId) {
        const response = await bookAPI.getByCategory(categoryId);
        setBooks(response.data);
      } else {
        fetchBooks();
      }
    } catch (err) {
      setError('Failed to filter by category');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (book) => {
    if (book.availableCopies > 0) return <Badge bg="success">Available ({book.availableCopies})</Badge>;
    if (book.status === 'RESERVED') return <Badge bg="warning" text="dark">Reserved</Badge>;
    return <Badge bg="danger">Unavailable</Badge>;
  };

  return (
    <Container>
      <h2 className="fw-bold mb-4">
        <i className="bi bi-search me-2"></i>Book Catalog
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Search Bar */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="search-bar mb-3">
              <i className="bi bi-search search-icon"></i>
              <Form.Control
                type="text"
                placeholder="Search by title, author, ISBN, or keywords..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                <i className="bi bi-search me-1"></i>Search
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowAdvanced(!showAdvanced)}>
                <i className="bi bi-sliders me-1"></i>Advanced
              </Button>
              {searchKeyword && (
                <Button variant="outline-danger" onClick={() => { setSearchKeyword(''); fetchBooks(); }}>
                  <i className="bi bi-x-lg me-1"></i>Clear
                </Button>
              )}
            </div>
          </Form>

          {/* Advanced Search */}
          {showAdvanced && (
            <Form onSubmit={handleAdvancedSearch} className="mt-3 pt-3 border-top">
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Book title"
                      value={advancedSearch.title}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, title: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Author</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Author name"
                      value={advancedSearch.author}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, author: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>ISBN</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="ISBN number"
                      value={advancedSearch.isbn}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, isbn: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Publication year"
                      value={advancedSearch.year}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, year: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="">All Statuses</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="ISSUED">Issued</option>
                      <option value="RESERVED">Reserved</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="primary" size="sm">
                <i className="bi bi-funnel me-1"></i>Apply Filters
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Category Quick Filter */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === '' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handleCategoryFilter('')}
        >
          All
        </Button>
        {categories.slice(0, 8).map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === String(cat.id) ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => handleCategoryFilter(String(cat.id))}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : books.length === 0 ? (
        <Alert variant="info">No books found matching your criteria.</Alert>
      ) : (
        <>
          <Row>
            {books.map((book) => (
              <Col key={book.id} lg={3} md={4} sm={6} className="mb-4">
                <Card as={Link} to={`/books/${book.id}`} className="book-card text-decoration-none h-100">
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center text-white"
                    style={{
                      height: '200px',
                      background: book.coverImageUrl
                        ? `url(${book.coverImageUrl}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {!book.coverImageUrl && <i className="bi bi-book" style={{ fontSize: '4rem' }}></i>}
                  </div>
                  <Card.Body className="p-3">
                    <Card.Title className="book-title">{book.title}</Card.Title>
                    <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-person me-1"></i>{book.author}
                    </Card.Text>
                    <Card.Text className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-upc me-1"></i>{book.isbn}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      {getStatusBadge(book)}
                      <small className="text-muted">{book.publicationYear}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {Array.from({ length: totalPages }, (_, i) => (
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Books;
