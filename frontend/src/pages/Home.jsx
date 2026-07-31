import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';
import { bookAPI, ebookAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Home = () => {
  const { user } = useAuth();
  const [popularBooks, setPopularBooks] = useState([]);
  const [newestBooks, setNewestBooks] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const [popRes, newRes, ebookRes] = await Promise.allSettled([
        bookAPI.getPopular(6),
        bookAPI.getAll({ page: 0, size: 6, sort: 'createdDate,desc' }).catch(() => bookAPI.getAll({ page: 0, size: 12 })),
        ebookAPI.getAllPublic().catch(() => ({ data: [] })),
      ]);
      if (popRes.status === 'fulfilled') setPopularBooks(popRes.value.data || []);
      if (newRes.status === 'fulfilled') {
        const all = Array.isArray(newRes.value?.data?.content) ? newRes.value.data.content : (Array.isArray(newRes.value?.data) ? newRes.value.data : []);
        const sorted = [...all].sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0)).slice(0, 6);
        setNewestBooks(sorted);
      }
      if (ebookRes.status === 'fulfilled') {
        const list = Array.isArray(ebookRes.value?.data?.content) ? ebookRes.value.data.content : (Array.isArray(ebookRes.value?.data) ? ebookRes.value.data : []);
        setEbooks(list.slice(0, 6));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const services = [
    { icon: '', title: 'Advanced Search', desc: 'Find books by title, author, ISBN, category and more with powerful filters.', color: '#ef5a24' },
    { icon: '', title: 'Online Reservations', desc: 'Reserve books online and collect them at the library counter anytime.', color: '#10b981' },
    { icon: '', title: 'Digital Library', desc: 'Access our growing collection of eBooks, journals and research papers.', color: '#6366f1' },
    { icon: '', title: 'Smart Alerts', desc: 'Get notified for due dates, overdue reminders, and reservation status updates.', color: '#f59e0b' },
  ];

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #4c1d95 70%, #ef5a24 100%)',
        padding: '64px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 200 + i * 80,
            height: 200 + i * 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: i === 0 ? -60 : i === 1 ? 'auto' : 30,
            bottom: i === 1 ? -80 : 'auto',
            right: i === 0 ? -60 : i === 1 ? 100 : 'auto',
            left: i === 2 ? '40%' : 'auto',
          }} />
        ))}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
              Welcome to{' '}
              <span style={{ background: 'linear-gradient(135deg, #ff8c5a, #ef5a24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                LibraryHub
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
              Your gateway to knowledge. Browse thousands of physical books and eBooks, manage your loans, and stay updated — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/books" style={{ background: '#ef5a24', color: 'white', padding: '13px 28px', borderRadius: 999, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(239,90,36,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                 Browse Catalog
              </Link>
              <Link to="/ebooks" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '13px 28px', borderRadius: 999, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                 eBooks
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 230, height: 230, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
              <img src={logo} alt="LibraryHub" style={{ width: 185, height: 185, borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px' }}>
        {/* Popular Books */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}> Popular Now</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Most borrowed books this month</p>
            </div>
            <Link to="/books" style={{ background: '#1a1a2e', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {popularBooks.map((book, idx) => (
                <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s', animationDelay: `${idx * 80}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#ef5a2440'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                  >
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {book.coverImageUrl
                        ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3.5rem' }}></span>}
                    </div>
                    <div style={{ padding: '14px 14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>{book.author}</div>
                      <span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {book.availableCopies > 0 ? ' Available' : ' Unavailable'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Newest Items */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>🆕 Newest Arrivals</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Latest additions to the library collection</p>
            </div>
            <Link to="/books" style={{ background: '#1a1a2e', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
          ) : newestBooks.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', border: '1px solid #e8ecf0' }}>
              No new arrivals yet — check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {newestBooks.map((book, idx) => (
                <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#ef5a2440'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                  >
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {book.coverImageUrl
                        ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3.5rem' }}>📘</span>}
                    </div>
                    <div style={{ padding: '14px 14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>{book.author}</div>
                      <span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {book.availableCopies > 0 ? '✅ Available' : '❌ Unavailable'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* eBooks */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>📖 Digital eBooks</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Read or download instantly — no checkout required</p>
            </div>
            <Link to="/ebooks" style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 6px 18px rgba(76,29,149,0.35)' }}>
              Browse eBooks →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner animation="border" style={{ color: '#6366f1' }} /></div>
          ) : ebooks.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', border: '1px solid #e8ecf0' }}>
              No eBooks available right now.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {ebooks.map((ebook, idx) => (
                <div key={ebook.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.22s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#6366f160'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                >
                  <div style={{ height: 110, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.6rem' }}>
                    📚
                  </div>
                  <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>by {ebook.author}</p>
                    </div>
                    {ebook.description && <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.description}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 'auto' }}>
                      {ebook.publicationYear && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Year</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{ebook.publicationYear}</div></div>}
                      {ebook.fileSize != null && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Size</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{(ebook.fileSize / 1024 / 1024).toFixed(1)} MB</div></div>}
                      {ebook.language && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Lang</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{ebook.language}</div></div>}
                    </div>
                    <Link to="/ebooks" style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 14px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textAlign: 'center', textDecoration: 'none' }}>
                      ⬇️ Read / Download
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Services */}
        <div style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf1ec 100%)', borderRadius: 20, padding: '48px 40px', marginBottom: 40 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 }}>Library Services</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 36, fontSize: '0.9rem' }}>Everything you need, all in one place</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <div key={s.title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', textAlign: 'center', border: '1px solid #e8ecf0', transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}18`; e.currentTarget.style.borderColor = s.color + '50'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e8ecf0'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>{s.icon}</div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', marginBottom: 10 }}>{s.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
