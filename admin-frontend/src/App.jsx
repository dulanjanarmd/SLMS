import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminNavbar from './components/AdminNavbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Books from './pages/Books';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Events from './pages/Events';
import EBooks from './pages/EBooks';
import PastPapers from './pages/PastPapers';
import ResearchPapers from './pages/ResearchPapers';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Dashboard />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Users />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/books"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Books />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Categories />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Reports />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Events />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/ebooks"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <EBooks />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/past-papers"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <PastPapers />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/research-papers"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <ResearchPapers />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Announcements />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <AuditLogs />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AdminNavbar />
                <div className="pt-3" style={{ padding: '24px 32px', minHeight: '100vh', background: '#f8fafc' }}>
                  <Settings />
                </div>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
