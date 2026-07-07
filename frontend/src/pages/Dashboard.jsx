import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, borrowAPI, reservationAPI, membershipAPI } from '../services/api';
import { Container, Row, Col, Card, Table, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [todayLoans, setTodayLoans] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [pendingMemberships, setPendingMemberships] = useState([]);
  const [membershipMsg, setMembershipMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, overdueRes, todayLoansRes, pendingRes, membershipsRes] = await Promise.allSettled([
        reportAPI.getDashboardStats(),
        borrowAPI.getOverdue(),
        borrowAPI.getTodayLoans(),
        reservationAPI.getPending(),
        membershipAPI.getPending(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (overdueRes.status === 'fulfilled') setOverdueLoans(overdueRes.value.data || []);
      if (todayLoansRes.status === 'fulfilled') setTodayLoans(todayLoansRes.value.data || []);
      if (pendingRes.status === 'fulfilled') setPendingReservations(pendingRes.value.data || []);
      if (membershipsRes.status === 'fulfilled') setPendingMemberships(membershipsRes.value.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const bookStatusData = {
    labels: ['Available', 'Issued', 'Reserved'],
    datasets: [
      {
        data: [
          Math.max(0, (stats?.totalBooks || 0) - (stats?.activeLoans || 0)),
          stats?.activeLoans || 0,
          stats?.pendingReservations || 0,
        ],
        backgroundColor: ['#198754', '#dc3545', '#ffc107'],
        borderWidth: 0,
      },
    ],
  };

  const loanActivityData = {
    labels: ['Today\'s Loans', 'Today\'s Returns', 'Active Loans', 'Overdue'],
    datasets: [
      {
        label: 'Count',
        data: [
          stats?.todayLoans || 0,
          stats?.todayReturns || 0,
          stats?.activeLoans || 0,
          stats?.overdueLoans || 0,
        ],
        backgroundColor: ['#0d6efd', '#198754', '#0dcaf0', '#dc3545'],
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2"></i>Librarian Dashboard
        <Button variant="outline-secondary" size="sm" className="ms-3" onClick={fetchDashboardData}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </Button>
      </h2>

      {/* Quick Actions */}
      <Row className="g-3 mb-4">
        <Col>
          <Card>
            <Card.Body className="d-flex gap-3 flex-wrap">
              <Button as={Link} to="/librarian/issue" variant="dark" className="btn-pill">
                Issue Book
              </Button>
              <Button as={Link} to="/librarian/return" variant="dark" className="btn-pill">
                Return Book
              </Button>
              <Button as={Link} to="/librarian/inventory" variant="dark" className="btn-pill">
                Inventory
              </Button>
              <Button as={Link} to="/librarian/reservations" variant="dark" className="btn-pill">
                Reservations
              </Button>
              <Button as={Link} to="/librarian/fines" variant="dark" className="btn-pill">
                Fines
              </Button>
              <Button as={Link} to="/librarian/reports" variant="dark" className="btn-pill">
                Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card primary text-center">
            <Card.Body>
              <h4 className="mb-0">{stats?.totalBooks || 0}</h4>
              <small className="text-muted">Total Books</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card success text-center">
            <Card.Body>
              <h4 className="mb-0">{stats?.totalEBooks || 0}</h4>
              <small className="text-muted">eBooks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card info text-center">
            <Card.Body>
              <h4 className="mb-0">{stats?.totalUsers || 0}</h4>
              <small className="text-muted">Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card warning text-center">
            <Card.Body>
              <h4 className="mb-0">{stats?.activeLoans || 0}</h4>
              <small className="text-muted">Active Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card danger text-center">
            <Card.Body>
              <h4 className="mb-0">{stats?.overdueLoans || 0}</h4>
              <small className="text-muted">Overdue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card primary text-center">
            <Card.Body>
              <h4 className="mb-0">LKR {(stats?.outstandingFines || 0).toFixed(0)}</h4>
              <small className="text-muted">Outstanding Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-pie-chart me-2"></i>Book Status Distribution
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut
                  data={bookStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-bar-chart me-2"></i>Loan Activity
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar
                  data={loanActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row className="g-4">
        {/* Overdue Loans */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center fw-bold">
              Overdue Loans
              <Badge bg="danger">{overdueLoans.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ height: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Due Date</th>
                      <th>Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueLoans.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No overdue loans</td>
                      </tr>
                    ) : (
                      overdueLoans.slice(0, 10).map((loan) => {
                        const overdueDays = Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={loan.id}>
                            <td>
                              <div className="fw-semibold">{loan.userName}</div>
                              <small className="text-muted">{loan.studentStaffId}</small>
                            </td>
                            <td>{loan.bookTitle}</td>
                            <td>
                              <span className="text-danger">{loan.dueDate}</span>
                              <br />
                              <small className="text-muted">{overdueDays} days overdue</small>
                            </td>
                            <td className="text-danger fw-semibold">
                              LKR {(overdueDays * 5).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Today's Activity */}
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-bold">
              Today's Loans
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ height: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayLoans.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No loans today</td>
                      </tr>
                    ) : (
                      todayLoans.map((loan) => (
                        <tr key={loan.id}>
                          <td>
                            <div className="fw-semibold">{loan.userName}</div>
                            <small className="text-muted">{loan.studentStaffId}</small>
                          </td>
                          <td>{loan.bookTitle}</td>
                          <td>{loan.dueDate}</td>
                          <td>
                            <Badge bg={loan.status === 'ACTIVE' ? 'success' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reservations */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center fw-bold">
              Pending Reservations
              <Badge bg="warning" text="dark">{pendingReservations.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ height: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Queue Position</th>
                      <th>Reserved On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReservations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No pending reservations</td>
                      </tr>
                    ) : (
                      pendingReservations.map((res) => (
                        <tr key={res.id}>
                          <td>
                            <div className="fw-semibold">{res.userName}</div>
                            <small className="text-muted">{res.studentStaffId}</small>
                          </td>
                          <td>{res.bookTitle}</td>
                          <td>#{res.queuePosition}</td>
                          <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Membership Applications */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center fw-bold">
              Pending Membership Applications
              <Badge bg="info">{pendingMemberships.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {membershipMsg && <Alert variant="success" className="m-3 py-2">{membershipMsg}</Alert>}
              <div style={{ height: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Faculty</th>
                      <th>Programme</th>
                      <th>Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMemberships.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">No pending applications</td>
                      </tr>
                    ) : (
                      pendingMemberships.map((m) => (
                        <tr key={m.id}>
                          <td className="fw-semibold">{m.userFullName}</td>
                          <td>{m.userStudentStaffId}</td>
                          <td>{m.faculty}</td>
                          <td>{m.programme}</td>
                          <td>{m.appliedAt ? new Date(m.appliedAt).toLocaleDateString() : '-'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="dark"
                                className="btn-pill"
                                onClick={async () => {
                                  try {
                                    await membershipAPI.review(m.id, { approved: true, adminComments: '' });
                                    setMembershipMsg(`Membership approved for ${m.userFullName}`);
                                    setTimeout(() => setMembershipMsg(''), 4000);
                                    setPendingMemberships(prev => prev.filter(x => x.id !== m.id));
                                  } catch { setMembershipMsg('Action failed'); setTimeout(() => setMembershipMsg(''), 4000); }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="dark"
                                className="btn-pill"
                                onClick={async () => {
                                  const reason = window.prompt('Rejection reason (optional):') || '';
                                  try {
                                    await membershipAPI.review(m.id, { approved: false, adminComments: reason });
                                    setMembershipMsg(`Membership rejected for ${m.userFullName}`);
                                    setTimeout(() => setMembershipMsg(''), 4000);
                                    setPendingMemberships(prev => prev.filter(x => x.id !== m.id));
                                  } catch { setMembershipMsg('Action failed'); setTimeout(() => setMembershipMsg(''), 4000); }
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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