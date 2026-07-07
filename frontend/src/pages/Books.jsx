import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, categoryAPI } from '../services/api';
import { Container, Row, Col, Card, Form, Button, Badge, Pagination, Spinner, Alert } from 'react-bootstrap';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({ title: '', author: '', isbn: '', year: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // Track which mode we're in so pagination works correctly
  const [searchMode, setSearchMode] = useState('all'); // 'all' | 'keyword' | 'advanced' | 'category'

  useEffect(() => {
    categoryAPI.getAll()
      .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const loadBooks = useCallback(async (mode, page) => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'keyword' && searchKeyword.trim()) {
        res = await bookAPI.search(searchKeyword, { page, size: pageSize });
      } else if (mode === 'advanced') {
        res = await bookAPI.advancedSearch({
          title: advancedSearch.title || undefined,
          author: advancedSearch.author || undefined,
          isbn: advancedSearch.isbn || undefined,
          year: advancedSearch.year || undefined,
          categoryId: selectedCategory || undefined,
          status: selectedStatus || undefined,
          page,
          size: pageSize,
        });
      } else if (mode === 'category' && selectedCategory) {
        res = await bookAPI.advancedSearch({
          categoryId: selectedCategory,
          page,
          size: pageSize,
        });
      } else {
        res = await bookAPI.getAll({ page, size: pageSize, sort: 'createdAt,desc' });
      }
      setBooks(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, advancedSearch, selectedCategory, selectedStatus]);

  // Initial load
  useEffect(() => {
    loadBooks(searchMode, currentPage);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchMode('keyword');
    loadBooks('keyword', 0);
  };

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchMode('advanced');
    loadBooks('advanced', 0);
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(0);
    const mode = catId ? 'category' : 'all';
    setSearchMode(mode);
    loadBooks(mode, 0);
  };

  const handleClear = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedStatus('');
    setAdvancedSearch({ title: '', author: '', isbn: '', year: '' });
    setCurrentPage(0);
    setSearchMode('all');
    loadBooks('all', 0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadBooks(searchMode, page);
  };

  const getStatusBadge = (book) => {
    if (book.availableCopies > 0)
      return <Badge bg="success">Available ({book.availableCopies})</Badge>;
    if (book.status === 'RESERVED')
      return <Badge bg="warning" text="dark">Reserved</Badge>;
    return <Badge bg="danger">Unavailable</Badge>;
  };

  return (
    <Container>
      <h2 className="fw-bold mb-4">
        <i className="bi bi-search me-2"></i>Book Catalog
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

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
            <div className="d-flex gap-2 flex-wrap">
              <Button type="submit" variant="dark" className="btn-pill">
                <i className="bi bi-search me-1"></i>Search
              </Button>
              <Button variant="outline-dark" className="btn-pill" onClick={() => setShowAdvanced(!showAdvanced)}>
                <i className="bi bi-sliders me-1"></i>Advanced Filters
              </Button>
              <Button variant="outline-secondary" className="btn-pill" onClick={handleClear}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </Button>
            </div>
          </Form>

          {/* Advanced Search */}
          {showAdvanced && (
            <Form onSubmit={handleAdvancedSearch} className="mt-3 pt-3 border-top">
              <Row className="g-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      placeholder="Book title"
                      value={advancedSearch.title}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, title: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Author</Form.Label>
                    <Form.Control
                      placeholder="Author name"
                      value={advancedSearch.author}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, author: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>ISBN</Form.Label>
                    <Form.Control
                      placeholder="ISBN"
                      value={advancedSearch.isbn}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, isbn: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g. 2022"
                      value={advancedSearch.year}
                      onChange={(e) => setAdvancedSearch({ ...advancedSearch, year: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="">All</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="ISSUED">Issued</option>
                      <option value="RESERVED">Reserved</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-3">
                <Button type="submit" variant="dark" size="sm" className="btn-pill">
                  <i className="bi bi-funnel me-1"></i>Apply Filters
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Category Quick Filter */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === '' && searchMode !== 'keyword' && searchMode !== 'advanced' ? 'primary' : 'outline-primary'}
          size="sm"
          className="btn-pill"
          onClick={() => handleCategoryClick('')}
        >
          All
        </Button>
        {categories.slice(0, 8).map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === String(cat.id) ? 'primary' : 'outline-primary'}
            size="sm"
            className="btn-pill"
            onClick={() => handleCategoryClick(String(cat.id))}
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
            {books.map(book => (
              <Col key={book.id} lg={3} md={4} sm={6} className="mb-4">
                <Card as={Link} to={`/books/${book.id}`} className="book-card text-decoration-none h-100">
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center text-white"
                    style={{
                      height: '200px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      overflow: 'hidden',
                    }}
                  >
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="bi bi-book" style={{ fontSize: '4rem' }}></i>
                    )}
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

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                  <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
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
