import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, reservationAPI, userAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => { fetchBook(); if (user) fetchProfile(); }, [id]);

  const fetchBook = async () => {
    try { setLoading(true); const res = await bookAPI.getById(id); setBook(res.data); }
    catch { setError('Book not found'); }
    finally { setLoading(false); }
  };

  const fetchProfile = async () => {
    try { const res = await userAPI.getProfile(); setProfile(res.data); }
    catch { setProfile(user); }
  };

  const isMember = profile?.isMember ?? user?.isMember ?? false;
  const isLibrarian = user?.role === 'LIBRARIAN';

  const handleReserve = async () => {
    try {
      setReserving(true); setError(''); setSuccess('');
      await reservationAPI.create({ bookId: parseInt(id), userId: user.id });
      setSuccess('Added to reservation queue! Visit the library with your Reservation ID to collect the book.');
      setShowReserveModal(false); fetchBook();
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to reserve book'); setShowReserveModal(false); }
    finally { setReserving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>;

  if (error && !book) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}></div>
      <h2 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>{error}</h2>
      <button onClick={() => navigate('/books')} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>← Back to Catalog</button>
    </div>
  );

  const getStatus = () => {
    if (book.availableCopies > 0) return { label: `${book.availableCopies} Copies Available`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    if (book.status === 'RESERVED') return { label: 'Reserved / In Queue', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'Currently Unavailable', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  };
  const status = getStatus();

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#065f46', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}></span> {success}
      </div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#b91c1c', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}>️</span> {error}
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 32 }}>
        {/* Left Col: Cover & Action */}
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #4c1d95)', borderRadius: 20, padding: 8, boxShadow: '0 24px 60px rgba(0,0,0,0.12)', marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {book.coverImageUrl ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '6rem' }}></span>}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Availability</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: status.bg, color: status.color, borderRadius: 999, padding: '8px 20px', fontSize: '0.9rem', fontWeight: 800 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.color }}></span> {status.label}
              </div>
            </div>

            {user ? (
              isLibrarian ? (
                <Link to="/librarian/issue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', gap: 8, transition: 'transform 0.2s' }}>
                   Go to Issue Book
                </Link>
              ) : !isMember ? (
                <div style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '16px', borderRadius: 12, fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Membership Required</div>
                  You need an active membership to reserve books. <Link to="/membership" style={{ color: '#d97706', fontWeight: 800 }}>Apply Now</Link>
                </div>
              ) : (
                <button onClick={() => setShowReserveModal(true)} disabled={book.availableCopies === 0} style={{ width: '100%', padding: '14px', background: book.availableCopies > 0 ? 'linear-gradient(135deg, #ef5a24, #ff6b35)' : '#f1f5f9', color: book.availableCopies > 0 ? 'white' : '#9ca3af', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: book.availableCopies > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Poppins, sans-serif', boxShadow: book.availableCopies > 0 ? '0 8px 24px rgba(239,90,36,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                   {book.availableCopies > 0 ? 'Reserve Book' : 'Currently Unavailable'}
                </button>
              )
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Link to="/login" style={{ display: 'block', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, boxShadow: '0 8px 24px rgba(239,90,36,0.3)' }}>Login to Reserve</Link>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Don't have an account? <Link to="/register" style={{ color: '#ef5a24', fontWeight: 600 }}>Sign up</Link></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Details */}
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 20 }}>
            ← Back
          </button>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{book.categoryName}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>•</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{book.publicationYear}</span>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: '2.4rem', color: '#1a1a2e', lineHeight: 1.2, margin: '0 0 8px' }}>{book.title}</h1>
            <h2 style={{ fontWeight: 500, fontSize: '1.2rem', color: '#64748b', margin: 0 }}>by {book.author}</h2>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 16px' }}>About this Book</h3>
            <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem', margin: '0 0 24px' }}>{book.description || 'No description available for this book.'}</p>

            {book.subjectHeadings && (
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', margin: '0 0 10px' }}>Subject Headings</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {String(book.subjectHeadings).split(',').filter(s => s.trim()).map((s, i) => (
                    <span key={i} style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
                      color: '#4f46e5',
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 16px' }}>Book Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              {[
                { l: 'ISBN-10', v: book.isbn || '—' },
                { l: 'ISBN-13', v: book.isbn13 || '—' },
                { l: 'Author', v: book.author || 'Unknown' },
                { l: 'Additional Authors', v: book.additionalAuthors || '—' },
                { l: 'Publisher', v: book.publisher || 'Unknown' },
                { l: 'Publication Year', v: book.publicationYear || '—' },
                { l: 'Edition', v: book.edition || '—' },
                { l: 'Language', v: book.language || 'English' },
                { l: 'Format', v: book.format || 'Physical' },
                { l: 'Category', v: book.categoryName || '—' },
                { l: 'Shelf Location', v: book.shelfLocation || '—' },
                { l: 'DDC Number', v: book.ddcNumber || '—' },
                { l: 'Accession No.', v: book.accessionNumber || '—' },
                { l: 'Acquisition Date', v: book.acquisitionDate ? new Date(book.acquisitionDate).toLocaleDateString() : '—' },
                { l: 'Replacement Cost', v: book.replacementCost != null && book.replacementCost !== '' ? `$${Number(book.replacementCost).toFixed(2)}` : '—' },
                { l: 'Added On', v: book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '—' },
              ].map(d => (
                <div key={d.l} style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{d.l}</span>
                  <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{d.v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(239,90,36,0.05), rgba(99,102,241,0.05))', border: '1px solid rgba(99,102,241,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { l: 'Total Copies', v: book.totalCopies ?? book.availableCopies ?? 0 },
                { l: 'Available', v: book.availableCopies ?? 0 },
                { l: 'Currently Out', v: (book.totalCopies ?? book.availableCopies ?? 0) - (book.availableCopies ?? 0) },
              ].map(d => (
                <div key={d.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 2 }}>{d.v}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      {showReserveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '36px', width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', marginBottom: 12 }}>Confirm Reservation</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
              Are you sure you want to reserve <strong>"{book.title}"</strong>? 
              Once reserved, you will need to pick it up from the library within 48 hours.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowReserveModal(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Cancel</button>
              <button onClick={handleReserve} disabled={reserving} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: reserving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', boxShadow: '0 8px 24px rgba(239,90,36,0.3)' }}>
                {reserving ? <Spinner size="sm" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
