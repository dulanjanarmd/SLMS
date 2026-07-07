import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Container, Table, Badge, Button, Form, Spinner, Card, Pagination, Alert } from 'react-bootstrap';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        page: currentPage,
        size: 15,
        sort: 'createdAt,desc',
      });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        keyword: searchKeyword,
        page: 0,
        size: 15,
      });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setError('');
      setSuccess('');
      if (currentStatus) {
        await userAPI.deactivateUser(id);
        setSuccess('User deactivated');
      } else {
        await userAPI.activateUser(id);
        setSuccess('User activated');
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      setError('');
      setSuccess('');
      await userAPI.changeRole(id, newRole);
      setSuccess(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge bg="danger">Admin</Badge>;
      case 'LIBRARIAN': return <Badge bg="primary">Librarian</Badge>;
      case 'FACULTY': return <Badge bg="info">Faculty</Badge>;
      case 'STUDENT': return <Badge bg="success">Student</Badge>;
      default: return <Badge bg="secondary">{role}</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-people me-2"></i>User Management
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button type="submit" variant="dark" className="btn-pill">
              Search
            </Button>
            {searchKeyword && (
              <Button variant="dark" className="btn-pill" onClick={() => { setSearchKeyword(''); fetchUsers(); }}>
                Clear
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Student/Staff ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Faculty</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td className="fw-semibold">{u.fullName}</td>
                  <td>{u.studentStaffId}</td>
                  <td>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>{u.faculty || 'N/A'}</td>
                  <td>
                    <Badge bg={u.isActive ? 'success' : 'secondary'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="dark"
                        size="sm"
                        className="btn-pill"
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default Users;