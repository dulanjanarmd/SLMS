import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ebookAPI } from '../services/api';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';

const EBooks = () => {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchEBooks();
  }, []);

  const fetchEBooks = async () => {
    try {
      setLoading(true);
      const response = await ebookAPI.getAllPublic();
      setEbooks(response.data);
    } catch (err) {
      setError('Failed to load eBooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchKeyword.trim()) {
        const response = await ebookAPI.search(searchKeyword, { page: 0, size: 12 });
        setEbooks(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        fetchEBooks();
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, title) => {
    const canDownload = user?.isMember || user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
    if (!canDownload) {
      setError('Library membership is required to download eBooks.');
      return;
    }
    try {
      const response = await ebookAPI.download(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed. Please login first.');
    }
  };

  const getFormatIcon = (format) => {
    switch (format?.toUpperCase()) {
      case 'PDF': return 'bi-file-earmark-pdf text-danger';
      case 'EPUB': return 'bi-book text-primary';
      case 'MP4': return 'bi-film text-warning';
      default: return 'bi-file-earmark text-secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Container>
      <h2 className="fw-bold mb-4">
        <i className="bi bi-file-earmark-pdf me-2"></i>eBooks & Digital Resources
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Search */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="search-bar flex-grow-1">
              <i className="bi bi-search search-icon"></i>
              <Form.Control
                type="text"
                placeholder="Search eBooks by title, author, or ISBN..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary">
              <i className="bi bi-search me-1"></i>Search
            </Button>
            {searchKeyword && (
              <Button variant="outline-danger" onClick={() => { setSearchKeyword(''); fetchEBooks(); }}>
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* eBooks Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : ebooks.length === 0 ? (
        <Alert variant="info">No eBooks found.</Alert>
      ) : (
        <Row>
          {ebooks.map((ebook) => (
            <Col key={ebook.id} lg={3} md={4} sm={6} className="mb-4">
              <Card className="h-100">
                <div
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    borderRadius: '12px 12px 0 0',
                  }}
                >
                  <i className={`bi ${getFormatIcon(ebook.fileFormat).split(' ')[0]} fs-1`}></i>
                </div>
                <Card.Body className="p-3">
                  <div className="d-flex gap-2 mb-2">
                    <Badge bg="danger">{ebook.fileFormat}</Badge>
                    <Badge bg="secondary">{formatFileSize(ebook.fileSize)}</Badge>
                  </div>
                  <Card.Title className="book-title">{ebook.title}</Card.Title>
                  <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-person me-1"></i>{ebook.author}
                  </Card.Text>
                  {ebook.publisher && (
                    <Card.Text className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                      {ebook.publisher} {ebook.publicationYear && `(${ebook.publicationYear})`}
                    </Card.Text>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                      <i className="bi bi-download me-1"></i>{ebook.downloadCount} downloads
                    </small>
                  </div>
                  {user?.isMember || user?.role === 'LIBRARIAN' || user?.role === 'ADMIN' ? (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 mt-2"
                      onClick={() => handleDownload(ebook.id, ebook.title)}
                    >
                      <i className="bi bi-download me-1"></i>Download
                    </Button>
                  ) : (
                    <Button as={Link} to="/membership" variant="outline-warning" size="sm" className="w-100 mt-2">
                      <i className="bi bi-lock me-1"></i>Members Only
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EBooks;
