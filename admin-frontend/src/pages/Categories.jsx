import React, { useState, useEffect } from 'react';
import { categoryAPI, bookAPI } from '../services/api';
import {
  Container, Table, Badge, Button, Form, Modal,
  Spinner, Card, Alert, InputGroup
} from 'react-bootstrap';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories based on search keyword
    if (searchKeyword.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const keyword = searchKeyword.toLowerCase();
      const filtered = categories.filter(category => 
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
      setFilteredCategories(filtered);
    }
  }, [searchKeyword, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await categoryAPI.getAll();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      
      // Fetch book counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const booksResponse = await bookAPI.getAll({ page: 0, size: 1000 });
            const books = booksResponse.data.content || booksResponse.data || [];
            const bookCount = books.filter(book => book.categoryId === category.id).length;
            return { ...category, bookCount };
          } catch (err) {
            return { ...category, bookCount: 0 };
          }
        })
      );
      
      setCategories(categoriesWithCounts);
      setFilteredCategories(categoriesWithCounts);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowFormModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowFormModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
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
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (editMode && selectedCategory) {
        await categoryAPI.update(selectedCategory.id, payload);
        setSuccess('Category updated successfully!');
      } else {
        await categoryAPI.add(payload);
        setSuccess('Category added successfully!');
      }
      
      setShowFormModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      setSuccess('');
      await categoryAPI.delete(selectedCategory.id);
      setSuccess('Category deleted successfully!');
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category. It may have associated books.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && categories.length === 0) {
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
          Category Management
        </h2>
        <Button variant="primary" onClick={openAddModal}>
          Add Category
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search Card */}
      <Card className="mb-4">
        <Card.Body>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search categories..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchKeyword('')}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Categories Table */}
      <Card>
        <Card.Body className="p-0">
          <Table striped hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th className="text-center">Book Count</th>
                <th>Created Date</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    {searchKeyword ? 'No categories match your search' : 'No categories found'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="fw-semibold align-middle">
                      {category.name}
                    </td>
                    <td className="align-middle text-muted">
                      {category.description || <em className="text-muted">No description</em>}
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg={category.bookCount > 0 ? 'primary' : 'secondary'}>
                        {category.bookCount || 0} books
                      </Badge>
                    </td>
                    <td className="align-middle">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openEditModal(category)}
                          title="Edit"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteModal(category)}
                          title="Delete"
                        >
                          Delete
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

      {/* Category Count Summary */}
      <div className="mt-3 text-muted">
        <small>
          Showing {filteredCategories.length} of {categories.length} categories
        </small>
      </div>

      {/* Add/Edit Category Modal */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Category Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter category name"
                required
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Enter category description (optional)"
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {formData.description.length}/500 characters
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update Category' : 'Add Category'}
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
          <p>Are you sure you want to delete this category?</p>
          {selectedCategory && (
            <div className="alert alert-warning">
              <strong>
                {selectedCategory.name}
              </strong>
              <br />
              <small className="text-muted">
                {selectedCategory.bookCount > 0 
                  ? `This category has ${selectedCategory.bookCount} associated book(s)`
                  : 'This category has no associated books'}
              </small>
            </div>
          )}
          {selectedCategory?.bookCount > 0 && (
            <p className="text-danger small mb-0">
              Warning: Deleting this category may affect associated books. 
              Please reassign books to another category first.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Categories;
