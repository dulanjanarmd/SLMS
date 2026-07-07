import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppNavbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import MyBooks from './pages/MyBooks';
import MyReservations from './pages/MyReservations';
import MyFines from './pages/MyFines';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import EBooks from './pages/EBooks';
import MembershipApplication from './pages/MembershipApplication';
import IssueBook from './pages/IssueBook';
import ReturnBook from './pages/ReturnBook';
import Inventory from './pages/Inventory';
import ReservationManagement from './pages/ReservationManagement';
import RenewalRequests from './pages/RenewalRequests';
import FineManagement from './pages/FineManagement';
import LibrarianReports from './pages/LibrarianReports';
import NotFound from './pages/NotFound';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#dc3545' }}>Something went wrong</h3>
          <pre style={{ color: '#666', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppNavbar />
                <div className="pt-3">
                  <Home />
                </div>
              </PrivateRoute>
            }
          />
          <Route path="/books" element={<PrivateRoute><AppNavbar /><div className="pt-3"><Books /></div></PrivateRoute>} />
          <Route path="/books/:id" element={<PrivateRoute><AppNavbar /><div className="pt-3"><BookDetail /></div></PrivateRoute>} />
          <Route path="/ebooks" element={<PrivateRoute><AppNavbar /><div className="pt-3"><EBooks /></div></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><AppNavbar /><div className="pt-3"><Profile /></div></PrivateRoute>} />
          <Route path="/my-books" element={<PrivateRoute><AppNavbar /><div className="pt-3"><MyBooks /></div></PrivateRoute>} />
          <Route path="/my-reservations" element={<PrivateRoute><AppNavbar /><div className="pt-3"><MyReservations /></div></PrivateRoute>} />
          <Route path="/my-fines" element={<PrivateRoute><AppNavbar /><div className="pt-3"><MyFines /></div></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><AppNavbar /><div className="pt-3"><Notifications /></div></PrivateRoute>} />
          <Route path="/membership" element={<PrivateRoute allowedRoles={['STUDENT','FACULTY']}><AppNavbar /><div className="pt-3"><MembershipApplication /></div></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><Dashboard /></div></PrivateRoute>} />
          <Route path="/librarian/issue" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><IssueBook /></div></PrivateRoute>} />
          <Route path="/librarian/return" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><ReturnBook /></div></PrivateRoute>} />
          <Route path="/librarian/inventory" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><Inventory /></div></PrivateRoute>} />
          <Route path="/librarian/reservations" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><ReservationManagement /></div></PrivateRoute>} />
          <Route path="/librarian/renewals" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><RenewalRequests /></div></PrivateRoute>} />
          <Route path="/librarian/fines" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><FineManagement /></div></PrivateRoute>} />
          <Route path="/librarian/reports" element={<PrivateRoute allowedRoles={['LIBRARIAN']}><AppNavbar /><div className="pt-3"><LibrarianReports /></div></PrivateRoute>} />
          <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['STUDENT']}><AppNavbar /><div className="pt-3"><StudentDashboard /></div></PrivateRoute>} />
          <Route path="/faculty/dashboard" element={<PrivateRoute allowedRoles={['FACULTY']}><AppNavbar /><div className="pt-3"><FacultyDashboard /></div></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
