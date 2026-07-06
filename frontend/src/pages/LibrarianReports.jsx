import React, { useState, useEffect } from 'react';
import { reportAPI, borrowAPI } from '../services/api';
import {
  Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner, Tab, Tabs
} from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const LibrarianReports = () => {
  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [fineReport, setFineReport] = useState(null);
  const [todayLoans, setTodayLoans] = useState([]);
  const [todayReturns, setTodayReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, popularRes, overdueRes, inventoryRes, fineRes, todayLRes, todayRRes] = await Promise.all([
        reportAPI.getDashboardStats(),
        reportAPI.getPopularBooks(10),
        reportAPI.getOverdueItems(),
        reportAPI.getInventory(),
        reportAPI.getFineCollection(),
        borrowAPI.getTodayLoans(),
        borrowAPI.getTodayReturns(),
      ]);
      setStats(statsRes.data);
      setPopularBooks(popularRes.data || []);
      setOverdueItems(overdueRes.data || []);
      setInventory(inventoryRes.data || {});
      setFineReport(fineRes.data || {});
      setTodayLoans(todayLRes.data || []);
      setTodayReturns(todayRRes.data || []);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const inventoryChartData = inventory ? {
    labels: ['Available', 'Issued', 'Reserved', 'Unavailable'],
    datasets: [{
      data: [
        inventory.availableBooks || 0,
        inventory.issuedBooks || 0,
        inventory.reservedBooks || 0,
        inventory.unavailableBooks || 0
      ],
      backgroundColor: ['#198754', '#dc3545', '#ffc107', '#6c757d'],
      borderWidth: 0,
    }],
  } : null;

  const activityChartData = stats ? {
    labels: ["Today's Loans", "Today's Returns", 'Active Loans', 'Overdue'],
    datasets: [{
      label: 'Count',
      data: [
        stats.todayLoans || 0,
        stats.todayReturns || 0,
        stats.activeLoans || 0,
        stats.overdueLoans || 0
      ],
      backgroundColor: ['#0d6efd', '#198754', '#0dcaf0', '#dc3545'],
      borderRadius: 6,
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-bar-chart-line me-2 text-primary"></i>Reports
        </h2>
        <Button variant="outline-primary" onClick={fetchAll}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Summary Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: "Today's Loans", value: stats?.todayLoans || 0, color: 'primary', icon: 'bi-book' },
          { label: "Today's Returns", value: stats?.todayReturns || 0, color: 'success', icon: 'bi-arrow-return-left' },
          { label: 'Active Loans', value: stats?.activeLoans || 0, color: 'info', icon: 'bi-journal-check' },
          { label: 'Overdue', value: stats?.overdueLoans || 0, color: 'danger', icon: 'bi-exclamation-triangle' },
          { label: 'Pending Reservations', value: stats?.pendingReservations || 0, color: 'warning', icon: 'bi-bookmark' },
          { label: 'Outstanding Fines', value: `LKR ${(stats?.outstandingFines || 0).toFixed(0)}`, color: 'danger', icon: 'bi-cash-coin' },
        ].map(s => (
          <Col lg={2} md={4} sm={6} key={s.label}>
            <Card className={`stat-card ${s.color} text-center`}>
              <Card.Body>
                <i className={`bi ${s.icon} fs-3 text-${s.color} mb-1 d-block`}></i>
                <h5 className="fw-bold mb-0">{s.value}</h5>
                <small className="text-muted">{s.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-pie-chart me-2"></i>Inventory Status
            </Card.Header>
            <Card.Body>
              {inventoryChartData && (
                <div style={{ height: 260 }}>
                  <Doughnut
                    data={inventoryChartData}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-bar-chart me-2"></i>Loan Activity
            </Card.Header>
            <Card.Body>
              {activityChartData && (
                <div style={{ height: 260 }}>
                  <Bar
                    data={activityChartData}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabbed Reports */}
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="today" className="mb-3">

            {/* Today's Transactions */}
            <Tab eventKey="today" title={<><i className="bi bi-calendar-day me-1"></i>Today</>}>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-semibold mb-0">Today's Loans ({todayLoans.length})</h6>
                    <Button size="sm" variant="outline-primary" onClick={() => exportCSV(todayLoans, 'today_loans.csv')}>
                      <i className="bi bi-download me-1"></i>CSV
                    </Button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <Table size="sm" striped hover className="mb-0">
                      <thead><tr><th>User</th><th>Book</th><th>Due</th></tr></thead>
                      <tbody>
                        {todayLoans.length === 0
                          ? <tr><td colSpan="3" className="text-center text-muted py-3">No loans today.</td></tr>
                          : todayLoans.map(l => (
                            <tr key={l.id}>
                              <td>
                                <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{l.userName}</div>
                                <small className="text-muted">{l.studentStaffId}</small>
                              </td>
                              <td style={{ fontSize: '0.82rem' }}>{l.bookTitle}</td>
                              <td style={{ fontSize: '0.82rem' }}>{l.dueDate}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-semibold mb-0">Today's Returns ({todayReturns.length})</h6>
                    <Button size="sm" variant="outline-success" onClick={() => exportCSV(todayReturns, 'today_returns.csv')}>
                      <i className="bi bi-download me-1"></i>CSV
                    </Button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <Table size="sm" striped hover className="mb-0">
                      <thead><tr><th>User</th><th>Book</th><th>Fine</th></tr></thead>
                      <tbody>
                        {todayReturns.length === 0
                          ? <tr><td colSpan="3" className="text-center text-muted py-3">No returns today.</td></tr>
                          : todayReturns.map(l => (
                            <tr key={l.id}>
                              <td>
                                <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{l.userName}</div>
                                <small className="text-muted">{l.studentStaffId}</small>
                              </td>
                              <td style={{ fontSize: '0.82rem' }}>{l.bookTitle}</td>
                              <td className={l.fineAmount > 0 ? 'text-danger fw-bold' : ''} style={{ fontSize: '0.82rem' }}>
                                {l.fineAmount > 0 ? `LKR ${l.fineAmount?.toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </Tab>

            {/* Popular Books */}
            <Tab eventKey="popular" title={<><i className="bi bi-fire me-1"></i>Popular Books</>}>
              <div className="d-flex justify-content-end mb-2">
                <Button size="sm" variant="outline-primary" onClick={() => exportCSV(popularBooks, 'popular_books.csv')}>
                  <i className="bi bi-download me-1"></i>Export CSV
                </Button>
              </div>
              <Table striped hover responsive>
                <thead>
                  <tr><th>#</th><th>Title</th><th>Author</th><th>ISBN</th><th>Total Borrows</th><th>Available</th></tr>
                </thead>
                <tbody>
                  {popularBooks.length === 0
                    ? <tr><td colSpan="6" className="text-center text-muted py-3">No data.</td></tr>
                    : popularBooks.map((b, i) => (
                      <tr key={b.bookId}>
                        <td className="fw-bold text-primary">{i + 1}</td>
                        <td className="fw-semibold">{b.title}</td>
                        <td>{b.author}</td>
                        <td><small>{b.isbn}</small></td>
                        <td><Badge bg="primary">{b.borrowCount}</Badge></td>
                        <td>
                          <Badge bg={b.availableCopies > 0 ? 'success' : 'danger'}>
                            {b.availableCopies}/{b.totalCopies}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Tab>

            {/* Overdue */}
            <Tab eventKey="overdue" title={<><i className="bi bi-exclamation-triangle me-1"></i>Overdue ({overdueItems.length})</>}>
              <div className="d-flex justify-content-end mb-2">
                <Button size="sm" variant="outline-danger" onClick={() => exportCSV(overdueItems, 'overdue_books.csv')}>
                  <i className="bi bi-download me-1"></i>Export CSV
                </Button>
              </div>
              <Table striped hover responsive>
                <thead>
                  <tr><th>User</th><th>Contact</th><th>Book</th><th>Due Date</th><th>Days Overdue</th><th>Fine</th></tr>
                </thead>
                <tbody>
                  {overdueItems.length === 0
                    ? <tr><td colSpan="6" className="text-center text-muted py-3">No overdue items.</td></tr>
                    : overdueItems.map(item => (
                      <tr key={item.borrowId} className="table-danger">
                        <td>
                          <div className="fw-semibold">{item.userName}</div>
                          <small>{item.studentStaffId}</small>
                        </td>
                        <td><small>{item.email}<br />{item.phoneNumber}</small></td>
                        <td>
                          <div className="fw-semibold">{item.bookTitle}</div>
                          <small>{item.isbn}</small>
                        </td>
                        <td className="text-danger fw-bold">{item.dueDate}</td>
                        <td><Badge bg="danger">{item.overdueDays} days</Badge></td>
                        <td className="fw-bold text-danger">LKR {item.fineAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Tab>

            {/* Inventory */}
            <Tab eventKey="inventory" title={<><i className="bi bi-collection me-1"></i>Inventory</>}>
              {inventory && (
                <Row className="g-3 mt-1">
                  {[
                    { label: 'Total Books', value: inventory.totalBooks, color: 'primary' },
                    { label: 'Available', value: inventory.availableBooks, color: 'success' },
                    { label: 'Issued', value: inventory.issuedBooks, color: 'danger' },
                    { label: 'Reserved', value: inventory.reservedBooks, color: 'warning' },
                    { label: 'Unavailable', value: inventory.unavailableBooks, color: 'secondary' },
                    { label: 'Total eBooks', value: inventory.totalEBooks, color: 'info' },
                  ].map(s => (
                    <Col md={2} key={s.label}>
                      <Card className={`stat-card ${s.color} text-center`}>
                        <Card.Body>
                          <h4 className={`fw-bold text-${s.color} mb-0`}>{s.value || 0}</h4>
                          <small className="text-muted">{s.label}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>

            {/* Fine Collection */}
            <Tab eventKey="fines" title={<><i className="bi bi-cash-coin me-1"></i>Fines</>}>
              {fineReport && (
                <Row className="g-3 mt-1">
                  {[
                    { label: 'Total Fines Issued', value: fineReport.totalFinesIssued || 0, color: 'primary' },
                    { label: 'Total Collected', value: `LKR ${(fineReport.totalCollected || 0).toFixed(2)}`, color: 'success' },
                    { label: 'Total Outstanding', value: `LKR ${(fineReport.totalOutstanding || 0).toFixed(2)}`, color: 'danger' },
                    { label: 'Paid', value: fineReport.paidFines || 0, color: 'success' },
                    { label: 'Unpaid', value: fineReport.unpaidFines || 0, color: 'danger' },
                    { label: 'Waived', value: fineReport.waivedFines || 0, color: 'secondary' },
                  ].map(s => (
                    <Col md={2} key={s.label}>
                      <Card className={`stat-card ${s.color} text-center`}>
                        <Card.Body>
                          <h5 className={`fw-bold text-${s.color} mb-0`}>{s.value}</h5>
                          <small className="text-muted">{s.label}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>

          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LibrarianReports;
