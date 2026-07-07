import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ebookAPI } from '../services/api';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';

const emptyEbookForm = {
  title: '', author: '', isbn: '', description: '',
  publisher: '', publicationYear: '', language: 'English',
};

const EBooks = () => {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [ebookForm, setEbookForm] = useState(emptyEbookForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        setEbooks(response.data?.content || response.data || []);
      } else {
        fetchEBooks();
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file.'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', ebookForm.title);
      formData.append('author', ebookForm.author);
      if (ebookForm.isbn) formData.append('isbn', ebookForm.isbn);
      if (ebookForm.description) formData.append('description', ebookForm.description);
      if (ebookForm.publisher) formData.append('publisher', ebookForm.publisher);
      if (ebookForm.publicationYear) formData.append('publicationYear', ebookForm.publicationYear);
      if (ebookForm.language) formData.append('language', ebookForm.language);
      formData.append('file', pdfFile);
      await ebookAPI.upload(formData);
      setSuccess('eBook uploaded successfully.');
      setShowUpload(false);
      setEbookForm(emptyEbookForm);
      setPdfFile(null);
      fetchEBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this eBook?')) return;
    try {
      await ebookAPI.delete(id);
      setSuccess('eBook deleted.');
      fetchEBooks();
    } catch {
      setError('Delete failed.');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-file-earmark-pdf me-2"></i>eBooks & Digital Resources
        </h2>
        {isLibrarian && (
          <Button variant="dark" className="btn-pill" onClick={() => { setShowUpload(true); setEbookForm(emptyEbookForm); setPdfFile(null); }}>
            <i className="bi bi-upload me-2"></i>Upload eBook
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

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
            <Button type="submit" variant="dark" className="btn-pill">
              Search
            </Button>
            {searchKeyword && (
              <Button variant="dark" className="btn-pill" onClick={() => { setSearchKeyword(''); fetchEBooks(); }}>
                Clear
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
                    <div className="d-grid gap-1 mt-2">
                      <Button
                        variant="dark"
                        size="sm"
                        className="btn-pill"
                        onClick={() => handleDownload(ebook.id, ebook.title)}
                      >
                        <i className="bi bi-download me-1"></i>Download
                      </Button>
                      {isLibrarian && (
                        <Button variant="outline-danger" size="sm" className="btn-pill" onClick={() => handleDelete(ebook.id)}>
                          <i className="bi bi-trash me-1"></i>Delete
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button as={Link} to="/membership" variant="dark" size="sm" className="w-100 mt-2 btn-pill">
                      Members Only
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Upload eBook Modal — librarian only */}
      <Modal show={showUpload} onHide={() => setShowUpload(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-upload me-2"></i>Upload eBook</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpload}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    value={ebookForm.title}
                    onChange={e => setEbookForm({ ...ebookForm, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Author <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    value={ebookForm.author}
                    onChange={e => setEbookForm({ ...ebookForm, author: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    value={ebookForm.isbn}
                    onChange={e => setEbookForm({ ...ebookForm, isbn: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control
                    value={ebookForm.publisher}
                    onChange={e => setEbookForm({ ...ebookForm, publisher: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={ebookForm.publicationYear}
                    onChange={e => setEbookForm({ ...ebookForm, publicationYear: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    value={ebookForm.language}
                    onChange={e => setEbookForm({ ...ebookForm, language: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={ebookForm.description}
                    onChange={e => setEbookForm({ ...ebookForm, description: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>PDF File <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files[0] || null)}
                  />
                  {pdfFile && (
                    <Form.Text className="text-success">
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button variant="dark" className="btn-pill" type="submit" disabled={uploading}>
              {uploading ? <><Spinner size="sm" className="me-2" />Uploading...</> : <><i className="bi bi-upload me-2"></i>Upload eBook</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EBooks;