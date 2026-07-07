import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, borrowAPI, reservationAPI } from '../services/api';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [todayLoans, setTodayLoans] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, overdueRes, todayLoansRes, pendingRes] = await Promise.allSettled([
        reportAPI.getDashboardStats(),
        borrowAPI.getOverdue(),
        borrowAPI.getTodayLoans(),
        reservationAPI.getPending(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (overdueRes.status === 'fulfilled') setOverdueLoans(overdueRes.value.data || []);
      if (todayLoansRes.status === 'fulfilled') setTodayLoans(todayLoansRes.value.data || []);
      if (pendingRes.status === 'fulfilled') setPendingReservations(pendingRes.value.data || []);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  if (error && !stats) return (
    <Container className="py-4">
      <Alert variant="danger">
        {error}
        <div className="mt-2"><Button size="sm" variant="outline-danger" onClick={fetchData}>Retry</Button></div>
      </Alert>
    </Container>
  );

  const usersByRole = stats?.usersByRole || {};

  const bookStatusData = {
    labels: ['Available', 'Active Loans', 'Pending Reservations'],
    datasets: [{
      data: [
        Math.max(0, (stats?.totalBooks || 0) - (stats?.activeLoans || 0)),
        stats?.activeLoans || 0,
        stats?.pendingReservations || 0,
      ],
      backgroundColor: ['#198754', '#dc3545', '#ffc107'],
      borderWidth: 0,
    }],
  };

  const loanActivityData = {
    labels: ["Today's Loans", "Today's Returns", 'Active Loans', 'Overdue'],
    datasets: [{
      label: 'Count',
      data: [stats?.todayLoans || 0, stats?.todayReturns || 0, stats?.activeLoans || 0, stats?.overdueLoans || 0],
      backgroundColor: ['#0d6efd', '#198754', '#0dcaf0', '#dc3545'],
      borderRadius: 8,
    }],
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
        </h2>
        <Button variant="outline-primary" size="sm" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </Button>
      </div>

      {/* Top stat cards */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <Card className="stat-card primary h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-people fs-2 text-primary me-3"></i>
                <div>
                  <h4 className="mb-0">{stats?.totalUsers || 0}</h4>
                  <small className="text-muted">Total Users</small>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-1 mt-2">
                <Badge bg="info" className="fw-normal">Students: {usersByRole.STUDENT || 0}</Badge>
                <Badge bg="warning" text="dark" className="fw-normal">Faculty: {usersByRole.FACULTY || 0}</Badge>
                <Badge bg="success" className="fw-normal">Librarians: {usersByRole.LIBRARIAN || 0}</Badge>
                <Badge bg="danger" className="fw-normal">Admins: {usersByRole.ADMIN || 0}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="stat-card success text-center h-100">
            <Card.Body>
              <i className="bi bi-book fs-2 text-success mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.totalBooks || 0}</h4>
              <small className="text-muted">Total Books</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="stat-card warning text-center h-100">
            <Card.Body>
              <i className="bi bi-journal-check fs-2 text-warning mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.activeLoans || 0}</h4>
              <small className="text-muted">Active Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="stat-card danger text-center h-100">
            <Card.Body>
              <i className="bi bi-exclamation-triangle fs-2 text-danger mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.overdueLoans || 0}</h4>
              <small className="text-muted">Overdue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card danger text-center h-100">
            <Card.Body>
              <i className="bi bi-cash-coin fs-2 text-danger mb-2 d-block"></i>
              <h5 className="mb-0">LKR {(stats?.outstandingFines || 0).toFixed(2)}</h5>
              <small className="text-muted">Outstanding Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="fw-semibold"><i className="bi bi-pie-chart me-2"></i>Book Status</Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={bookStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="fw-semibold"><i className="bi bi-bar-chart me-2"></i>Loan Activity</Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar data={loanActivityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick actions */}
      <Row className="g-3 mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="fw-semibold"><i className="bi bi-lightning me-2"></i>Quick Actions</Card.Header>
            <Card.Body className="d-flex flex-wrap gap-3">
              <Button as={Link} to="/users" variant="primary"><i className="bi bi-people me-2"></i>Manage Users</Button>
              <Button as={Link} to="/books" variant="outline-primary"><i className="bi bi-book me-2"></i>Manage Books</Button>
              <Button as={Link} to="/categories" variant="outline-secondary"><i className="bi bi-tags me-2"></i>Categories</Button>
              <Button as={Link} to="/reports" variant="outline-success"><i className="bi bi-graph-up me-2"></i>Reports</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overdue + Today's Loans */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Overdue Loans</span>
              <Badge bg="danger">{overdueLoans.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: 280, overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead><tr><th>User</th><th>Book</th><th>Due Date</th><th>Fine</th></tr></thead>
                  <tbody>
                    {overdueLoans.length === 0
                      ? <tr><td colSpan="4" className="text-center text-muted py-3">No overdue loans</td></tr>
                      : overdueLoans.slice(0, 8).map((loan) => {
                          const days = Math.floor((new Date() - new Date(loan.dueDate)) / 86400000);
                          return (
                            <tr key={loan.id}>
                              <td><div className="fw-semibold">{loan.userName}</div><small className="text-muted">{loan.studentStaffId}</small></td>
                              <td>{loan.bookTitle}</td>
                              <td><span className="text-danger">{loan.dueDate}</span><br /><small className="text-muted">{days}d overdue</small></td>
                              <td className="text-danger fw-semibold">LKR {(days * 5).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-semibold"><i className="bi bi-calendar-check me-2"></i>Today's Loans</Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: 280, overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead><tr><th>User</th><th>Book</th><th>Due Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {todayLoans.length === 0
                      ? <tr><td colSpan="4" className="text-center text-muted py-3">No loans today</td></tr>
                      : todayLoans.map((loan) => (
                          <tr key={loan.id}>
                            <td><div className="fw-semibold">{loan.userName}</div><small className="text-muted">{loan.studentStaffId}</small></td>
                            <td>{loan.bookTitle}</td>
                            <td>{loan.dueDate}</td>
                            <td><Badge bg={loan.status === 'ACTIVE' ? 'success' : 'secondary'}>{loan.status}</Badge></td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reservations */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-warning"><i className="bi bi-bookmark me-2"></i>Pending Reservations</span>
              <Badge bg="warning" text="dark">{pendingReservations.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: 240, overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead><tr><th>User</th><th>Book</th><th>Queue</th><th>Reserved On</th></tr></thead>
                  <tbody>
                    {pendingReservations.length === 0
                      ? <tr><td colSpan="4" className="text-center text-muted py-3">No pending reservations</td></tr>
                      : pendingReservations.map((res) => (
                          <tr key={res.id}>
                            <td><div className="fw-semibold">{res.userName}</div><small className="text-muted">{res.studentStaffId}</small></td>
                            <td>{res.bookTitle}</td>
                            <td>#{res.queuePosition}</td>
                            <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
