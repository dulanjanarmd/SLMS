import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Container, Row, Col, Card, Table, Badge, Spinner, Button, Tabs, Tab } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [popularBooks, setPopularBooks] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [fineReport, setFineReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [popularRes, overdueRes, fineRes, inventoryRes, userRes] = await Promise.allSettled([
        reportAPI.getPopularBooks(10),
        reportAPI.getOverdueItems(),
        reportAPI.getFineCollection(),
        reportAPI.getInventory(),
        reportAPI.getUserActivity(),
      ]);
      if (popularRes.status === 'fulfilled') setPopularBooks(popularRes.value.data || []);
      if (overdueRes.status === 'fulfilled') setOverdueItems(overdueRes.value.data || []);
      if (fineRes.status === 'fulfilled') setFineReport(fineRes.value.data || {});
      if (inventoryRes.status === 'fulfilled') setInventoryReport(inventoryRes.value.data || {});
      if (userRes.status === 'fulfilled') setUserActivity(userRes.value.data || {});
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const inventoryData = inventoryReport ? {
    labels: ['Available', 'Issued', 'Reserved'],
    datasets: [{
      data: [inventoryReport.availableBooks, inventoryReport.issuedBooks, inventoryReport.reservedBooks],
      backgroundColor: ['#198754', '#dc3545', '#ffc107'],
      borderWidth: 0,
    }],
  } : null;

  const fineData = fineReport ? {
    labels: ['Paid', 'Unpaid', 'Waived', 'Partially Paid'],
    datasets: [{
      label: 'Count',
      data: [fineReport.paidFines, fineReport.unpaidFines, fineReport.waivedFines, 0],
      backgroundColor: ['#198754', '#dc3545', '#6c757d', '#ffc107'],
      borderRadius: 8,
    }],
  } : null;

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
        <i className="bi bi-graph-up me-2"></i>Reports & Analytics
      </h2>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title={<span><i className="bi bi-grid me-1"></i>Overview</span>}>
          <Row className="g-4">
            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Inventory Distribution</Card.Header>
                <Card.Body>
                  {inventoryData && (
                    <div style={{ height: '250px' }}>
                      <Doughnut
                        data={inventoryData}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Fine Status Distribution</Card.Header>
                <Card.Body>
                  {fineData && (
                    <div style={{ height: '250px' }}>
                      <Bar
                        data={fineData}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mt-2">
            <Col md={3}>
              <Card className="text-center p-3">
                <h3 className="text-primary fw-bold">{userActivity?.totalUsers || 0}</h3>
                <small className="text-muted">Total Registered Users</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h3 className="text-success fw-bold">{userActivity?.activeUsers || 0}</h3>
                <small className="text-muted">Active Users</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h3 className="text-warning fw-bold">{userActivity?.usersWithFines || 0}</h3>
                <small className="text-muted">Users with Fines</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h3 className="text-info fw-bold">{userActivity?.totalBorrowRecords || 0}</h3>
                <small className="text-muted">Total Borrow Records</small>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Popular Books Tab */}
        <Tab eventKey="popular" title={<span><i className="bi bi-fire me-1"></i>Popular Books</span>}>
          <Card>
            <Card.Header className="fw-semibold">Top 10 Most Borrowed Books</Card.Header>
            <Card.Body className="p-0">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Total Borrows</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {popularBooks.map((book, idx) => (
                    <tr key={book.bookId}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>
                        <Badge bg="primary">{book.borrowCount} borrows</Badge>
                      </td>
                      <td>
                        <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'}>
                          {book.availableCopies}/{book.totalCopies}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Overdue Tab */}
        <Tab eventKey="overdue" title={<span><i className="bi bi-exclamation-triangle me-1"></i>Overdue Items</span>}>
          <Card>
            <Card.Header className="fw-semibold text-danger">
              Overdue Books ({overdueItems.length})
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Student ID</th>
                      <th>Book</th>
                      <th>ISBN</th>
                      <th>Due Date</th>
                      <th>Days Overdue</th>
                      <th>Fine (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">No overdue items</td>
                      </tr>
                    ) : (
                      overdueItems.map((item) => (
                        <tr key={item.borrowId}>
                          <td>{item.userName}</td>
                          <td>{item.studentStaffId}</td>
                          <td className="fw-semibold">{item.bookTitle}</td>
                          <td>{item.isbn}</td>
                          <td className="text-danger">{item.dueDate}</td>
                          <td className="text-danger fw-semibold">{item.overdueDays} days</td>
                          <td className="text-danger fw-semibold">{item.fineAmount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Fine Collection Tab */}
        <Tab eventKey="fines" title={<span><i className="bi bi-cash-coin me-1"></i>Fine Collection</span>}>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="text-center p-4 stat-card success">
                <h3 className="text-success fw-bold">LKR {(fineReport?.totalCollected || 0).toFixed(2)}</h3>
                <small className="text-muted">Total Collected</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center p-4 stat-card danger">
                <h3 className="text-danger fw-bold">LKR {(fineReport?.totalOutstanding || 0).toFixed(2)}</h3>
                <small className="text-muted">Total Outstanding</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center p-4 stat-card primary">
                <h3 className="text-primary fw-bold">{fineReport?.totalFinesIssued || 0}</h3>
                <small className="text-muted">Total Fines Issued</small>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Inventory Tab */}
        <Tab eventKey="inventory" title={<span><i className="bi bi-box-seam me-1"></i>Inventory</span>}>
          <Row className="g-4">
            <Col md={3}>
              <Card className="text-center p-3">
                <h4 className="fw-bold text-primary">{inventoryReport?.totalBooks || 0}</h4>
                <small className="text-muted">Total Books</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h4 className="fw-bold text-success">{inventoryReport?.availableBooks || 0}</h4>
                <small className="text-muted">Available</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h4 className="fw-bold text-danger">{inventoryReport?.issuedBooks || 0}</h4>
                <small className="text-muted">Issued</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-3">
                <h4 className="fw-bold text-warning">{inventoryReport?.reservedBooks || 0}</h4>
                <small className="text-muted">Reserved</small>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;
