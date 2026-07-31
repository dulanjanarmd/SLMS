import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: '40px 24px' }}>
    <div style={{ textAlign: 'center', maxWidth: 500 }}>
      <div style={{ fontSize: '7rem', marginBottom: 8, animation: 'pulse 2s infinite' }}></div>
      <div style={{ fontSize: '6rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1, marginBottom: 8 }}>404</div>
      <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#374151', marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={{ background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', padding: '13px 28px', borderRadius: 999, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(239,90,36,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
           Go Home
        </Link>
        <Link to="/books" style={{ background: 'rgba(239,90,36,0.08)', color: '#ef5a24', padding: '13px 28px', borderRadius: 999, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid rgba(239,90,36,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
           Browse Books
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
