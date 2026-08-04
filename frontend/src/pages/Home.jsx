import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';
import { bookAPI, ebookAPI, eventAPI, libraryHoursAPI, contactInfoAPI, notificationAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Home = () => {
  const { user } = useAuth();
  const [popularBooks, setPopularBooks] = useState([]);
  const [newestBooks, setNewestBooks] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [viewingEbook, setViewingEbook] = useState(null);
  const [viewBlob, setViewBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  // Removed create announcement state (now handled in Admin portal)
  const [libraryHours, setLibraryHours] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [userStats, setUserStats] = useState({
    booksBorrowed: 0,
    booksReturned: 0,
    activeReservations: 0,
    unpaidFines: 0,
    readingGoal: 24,
    booksRead: 0,
  });

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const [popRes, newRes, ebookRes, eventsRes, hoursRes, contactRes, annRes, statsRes] = await Promise.allSettled([
        bookAPI.getPopular(6),
        bookAPI.getAll({ page: 0, size: 6, sort: 'createdDate,desc' }).catch(() => bookAPI.getAll({ page: 0, size: 12 })),
        ebookAPI.getAllPublic().catch(() => ({ data: [] })),
        eventAPI.getPublicUpcoming().catch(() => ({ data: [] })),
        libraryHoursAPI.getAll().catch(() => ({ data: [] })),
        contactInfoAPI.getActive().catch(() => ({ data: [] })),
        notificationAPI.getPublicAnnouncements().catch(() => ({ data: [] })),
        user ? fetch(`${API}/user/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).catch(() => ({ json: () => Promise.resolve({}) })) : Promise.resolve({ json: () => Promise.resolve({}) }),
      ]);
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data || []);
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
      if (eventsRes.status === 'fulfilled') {
        const arr = Array.isArray(eventsRes.value?.data?.content) ? eventsRes.value.data.content : (Array.isArray(eventsRes.value?.data) ? eventsRes.value.data : []);
        if (arr && arr.length > 0) {
          const mapped = arr.slice(0, 8).map(ev => {
            const dt = new Date(String(ev.eventDate) + 'T00:00:00');
            const fmtTime = (t) => {
              if (!t) return '';
              const s = String(t).slice(0, 5);
              const [h, m] = s.split(':');
              const hr = parseInt(h, 10);
              const ampm = hr >= 12 ? 'PM' : 'AM';
              const h12 = ((hr + 11) % 12) + 1;
              return `${h12}:${m} ${ampm}`;
            };
            let timeStr = fmtTime(ev.startTime);
            if (ev.endTime) timeStr += ` - ${fmtTime(ev.endTime)}`;
            return {
              date: String(dt.getDate()).padStart(2, '0'),
              month: dt.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
              title: ev.title,
              time: timeStr,
              desc: ev.description || (ev.category ? ev.category : ''),
              location: ev.location || '—',
              color: ev.color || '#ef5a24',
              banner: ev.banner,
              maxAttendees: ev.maxAttendees,
            };
          });
          setUpcomingEvents(mapped);
        }
      }
      if (hoursRes.status === 'fulfilled') {
        const hours = Array.isArray(hoursRes.value?.data) ? hoursRes.value.data : [];
        setLibraryHours(hours);
      }
      if (contactRes.status === 'fulfilled') {
        const contacts = Array.isArray(contactRes.value?.data) ? contactRes.value.data : [];
        setContactInfo(contacts);
      }
      if (statsRes.status === 'fulfilled') {
        const stats = await statsRes.value.json();
        setUserStats({
          booksBorrowed: stats.booksBorrowed || 0,
          booksReturned: stats.booksReturned || 0,
          activeReservations: stats.activeReservations || 0,
          unpaidFines: stats.unpaidFines || 0,
          readingGoal: stats.readingGoal || 24,
          booksRead: stats.booksRead || 0,
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };



  const handleReadOnline = async (ebook) => {
    try {
      setViewingEbook(ebook);
      setViewBlob(null);
      const res = await fetch(`${API}/ebooks/view/${ebook.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('View failed');
      const blob = await res.blob();
      setViewBlob(URL.createObjectURL(blob));
    } catch {
      setViewingEbook(null); setViewBlob(null);
      window.location.href = '/ebooks';
    }
  };

  const closeReader = () => {
    if (viewBlob) URL.revokeObjectURL(viewBlob);
    setViewingEbook(null); setViewBlob(null);
  };

  const services = [
    { icon: '⌕', title: 'Advanced Catalog Search', desc: 'Search by title, author, ISBN, year, category, and availability to quickly find the right resource.', color: '#ef5a24' },
    { icon: '◫', title: 'Online Reservations', desc: 'Place holds on checked-out books and collect them from the library counter once they are ready.', color: '#10b981' },
    { icon: '↻', title: 'Borrow & Renewal', desc: 'Manage active loans, renew eligible items, and track due dates through your personal account dashboard.', color: '#6366f1' },
    { icon: '◌', title: 'Digital Library Access', desc: 'Read eBooks, journals, research papers, and past papers anytime from your LibraryHub account.', color: '#0ea5e9' },
    { icon: '◈', title: 'Fine Management', desc: 'Review unpaid charges, see payment status, and keep your membership account in good standing.', color: '#f59e0b' },
    { icon: '◉', title: 'Smart Notifications', desc: 'Receive alerts for due dates, overdue reminders, reservation readiness, and important account updates.', color: '#8b5cf6' },
  ];


  const displayEvents = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents : [];

  const faqs = [
    { q: 'How many books can I borrow at a time?', a: 'Undergraduate members may borrow up to 6 books; Graduate and Faculty up to 12. Semester limits are occasionally extended during peak periods.' },
    { q: 'How long is the checkout period?', a: 'Standard checkout is 2 weeks for physical books, with up to 2 renewals available if the book is not on hold. eBooks check out for 7 days.' },
    { q: 'How do I reserve a book that is currently out?', a: 'Click "Reserve Book" on any book detail page (you must be an active member). You will be notified when the book is available for pickup.' },
    { q: 'Can I access eBooks from home?', a: 'Yes — all eBooks, research papers and past papers are available 24/7 from the Digital Library. Simply log in with your LibraryHub account.' },
    { q: 'How do I become a member?', a: 'Visit the Membership page, choose a plan, complete the short application form and submit payment. Most accounts are activated within 1 business day.' },
    { q: 'What if I lose or damage a book?', a: 'Report it immediately via the librarian desk or the issue form. You will be charged a replacement cost + 10% processing fee. Damage fees vary by condition.' },
  ];


  const todaysDay = new Date().toLocaleDateString(undefined, { weekday: 'long' });
  const isWeekend = todaysDay === 'Saturday' || todaysDay === 'Sunday';
  const now = new Date();
  const hourStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const isOpenNow = isWeekend ? (hourStr >= '09:00' && hourStr < '17:00') : (hourStr >= '07:30' && hourStr < '20:30');

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
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>Popular Now</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Most borrowed books this month</p>
            </div>
            <Link to="/books" style={{ background: '#1a1a2e', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20, alignItems: 'stretch' }}>
              {popularBooks.map((book, idx) => (
                <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none', height: '100%' }}>
                  <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s', animationDelay: `${idx * 80}ms`, height: '100%', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#ef5a2440'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                  >
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {book.coverImageUrl
                        ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3.5rem' }}></span>}
                    </div>
                    <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6, minHeight: '2.6em' }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>{book.author}</div>
                      <span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, marginTop: 'auto' }}>
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
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>Newest Arrivals</h2>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20, alignItems: 'stretch' }}>
              {newestBooks.map((book, idx) => (
                <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none', height: '100%' }}>
                  <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s', height: '100%', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#ef5a2440'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                  >
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {book.coverImageUrl
                        ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3.5rem' }}></span>}
                    </div>
                    <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6, minHeight: '2.6em' }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>{book.author}</div>
                      <span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, marginTop: 'auto' }}>
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
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
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>Digital eBooks</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Read or download instantly — no checkout required</p>
            </div>
            <Link to="/ebooks" style={{ background: '#1a1a2e', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner animation="border" style={{ color: '#6366f1' }} /></div>
          ) : ebooks.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', border: '1px solid #e8ecf0' }}>
              No eBooks available right now.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20, alignItems: 'stretch' }}>
              {ebooks.map((ebook, idx) => (
                <div key={ebook.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.22s', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#6366f160'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                >
                  {ebook.coverImageUrl ? (
                    <div style={{ height: 200, background: '#f8fafc', overflow: 'hidden', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                      <img src={ebook.coverImageUrl} alt={ebook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  ) : (
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.6rem', flexShrink: 0 }}>
                    </div>
                  )}
                  <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.6em' }}>{ebook.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>by {ebook.author}</p>
                    </div>
                    {ebook.description && <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.description}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 'auto' }}>
                      {ebook.publicationYear && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Year</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{ebook.publicationYear}</div></div>}
                      {ebook.fileSize != null && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Size</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{(ebook.fileSize / 1024 / 1024).toFixed(1)} MB</div></div>}
                      {ebook.language && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Lang</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{ebook.language}</div></div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleReadOnline(ebook)} style={{ flex: 1, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 12px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(239,90,36,0.25)' }}>
                        Read
                      </button>
                      <Link to="/ebooks" style={{ flex: 1, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 12px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Download
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Viewer (Home) */}
        {viewingEbook && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 10000, padding: 20 }} onClick={e => { if (e.target === e.currentTarget) closeReader(); }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginBottom: 12, fontFamily: 'Poppins, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,90,36,0.2)', color: '#ef5a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600 }}>{viewingEbook.title}</div>
                  <div style={{ opacity: 0.7, fontSize: '0.82rem' }}>by {viewingEbook.author}</div>
                </div>
              </div>
              <button onClick={closeReader} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Close</button>
            </div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
              {!viewBlob && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontFamily: 'Poppins, sans-serif' }}>
                  <Spinner animation="border" style={{ color: '#ef5a24' }} />
                  <div style={{ fontWeight: 600 }}>Loading PDF viewer...</div>
                </div>
              )}
              {viewBlob && <iframe src={viewBlob} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />}
            </div>
          </div>
        )}

        {/* LMS Dashboard Grid: Reading Tracker + Events + Library Info Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 24,
          marginBottom: 48,
        }}>
          {/* Left Column: Personal Dashboard & Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

            {/* Personal: Reading Progress / Welcome */}
            {user ? (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 55%, #4c1d95 100%)',
                borderRadius: 22,
                padding: '28px 28px 30px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 18px 50px rgba(26,26,46,0.25)',
              }}>
                {[...Array(2)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 180 + i * 90,
                    height: 180 + i * 90,
                    borderRadius: '50%',
                    background: i === 0 ? 'rgba(239,90,36,0.12)' : 'rgba(99,102,241,0.1)',
                    top: i === 0 ? -60 : 'auto',
                    bottom: i === 1 ? -70 : 'auto',
                    right: i === 0 ? -40 : -30,
                  }} />
                ))}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background:
                        user?.role === 'LIBRARIAN' ? 'linear-gradient(135deg, #1a1a2e, #2d1b69)' :
                        user?.role === 'FACULTY' ? 'linear-gradient(135deg, #4c1d95, #6d28d9)' :
                        user?.isMember ? 'linear-gradient(135deg, #10b981, #059669)' :
                        'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white', padding: '5px 14px', borderRadius: 999,
                      fontSize: '0.72rem', fontWeight: 700, marginBottom: 14, letterSpacing: 0.4,
                      boxShadow:
                        user?.role === 'LIBRARIAN' ? '0 4px 14px rgba(26,26,46,0.35)' :
                        user?.role === 'FACULTY' ? '0 4px 14px rgba(76,29,149,0.35)' :
                        user?.isMember ? '0 4px 14px rgba(16,185,129,0.35)' :
                        '0 4px 14px rgba(245,158,11,0.3)',
                    }}>
                      {user?.role === 'LIBRARIAN' ? 'Librarian Staff' :
                       user?.role === 'FACULTY' ? 'Faculty Member' :
                       user?.isMember ? 'Active Member' : 'Membership Required'}
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                      Welcome back, {user?.fullName?.split(' ')[0] || user?.fullName || 'Friend'}
                    </h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      Here's a snapshot of your library activity this semester.
                    </p>
                  </div>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '1.6rem', fontWeight: 800,
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 8px 24px rgba(239,90,36,0.45)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                  }}>
                    {user?.fullName ? user.fullName.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() : ''}
                  </div>
                </div>

                {/* Mini Stat Row */}
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 26 }}>
                  {[
                    { l: 'Books Borrowed', v: userStats.booksBorrowed },
                    { l: 'Books Returned', v: userStats.booksReturned },
                    { l: 'Active Reservations', v: userStats.activeReservations },
                    { l: 'Unpaid Fines', v: `$${userStats.unpaidFines}` },
                  ].map(m => (
                    <div key={m.l} style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 14,
                      padding: '14px 10px',
                      textAlign: 'center',
                      backdropFilter: 'blur(8px)',
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 4 }}>{m.v}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.68)', fontWeight: 500, lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: 0.3 }}>{m.l}</div>
                    </div>
                  ))}
                </div>

                {/* Reading Goal Progress */}
                <div style={{ position: 'relative', zIndex: 1, marginTop: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>2026 Reading Challenge</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffb088' }}>
                      {userStats.booksRead} / {userStats.readingGoal} books ({Math.round((userStats.booksRead / userStats.readingGoal) * 100)}%)
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 14,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: `${Math.min((userStats.booksRead / userStats.readingGoal) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ef5a24, #ff8c5a, #6366f1)',
                      borderRadius: 999,
                      boxShadow: '0 0 20px rgba(239,90,36,0.4)',
                      transition: 'width 0.6s',
                    }} />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                      {userStats.booksRead >= userStats.readingGoal 
                        ? 'Goal achieved! 🎉' 
                        : `${userStats.readingGoal - userStats.booksRead} more books needed`}
                    </div>
                    <Link to="/books" style={{
                      color: 'white', textDecoration: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1.5px solid rgba(255,255,255,0.25)',
                      padding: '8px 18px',
                      borderRadius: 999,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,90,36,0.3)'; e.currentTarget.style.borderColor = '#ef5a24'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                    >
                      Find Your Next Book →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 55%, #4c1d95 100%)',
                  borderRadius: 22,
                  padding: '32px 28px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  flexWrap: 'wrap',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 18px 50px rgba(26,26,46,0.25)',
                  cursor: 'pointer',
                  transition: 'transform 0.22s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                >
                  {[...Array(2)].map((_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      width: 180 + i * 80,
                      height: 180 + i * 80,
                      borderRadius: '50%',
                      background: i === 0 ? 'rgba(239,90,36,0.12)' : 'rgba(99,102,241,0.1)',
                      top: i === 0 ? -60 : 'auto',
                      bottom: i === 1 ? -70 : 'auto',
                      right: i === 0 ? -40 : -30,
                    }} />
                  ))}
                  <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                      padding: '5px 14px',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginBottom: 14,
                      letterSpacing: 0.4,
                    }}>SIGN IN REQUIRED</div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.2 }}>
                      Track your reading, set goals & see your dashboard
                    </h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      Log in to see your borrow history, active loans, reading progress, reservations, fines and personalized recommendations.
                    </p>
                  </div>
                  <div style={{
                    position: 'relative', zIndex: 1,
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'white',
                    boxShadow: '0 10px 28px rgba(239,90,36,0.45)',
                    flexShrink: 0,
                  }}>
                    Sign In to Continue →
                  </div>
                </div>
              </Link>
            )}

            {/* Upcoming Events Calendar */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e8ecf0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '22px 26px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                borderBottom: '1px solid #f1f5f9',
              }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1a1a2e', margin: 0, marginBottom: 3 }}>Upcoming Events</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Workshops, talks, closures & study sessions</p>
                </div>
                <Link to="/events" style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1.5px solid #6366f130',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
                  color: '#4f46e5',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  textDecoration: 'none',
                }}>
                  View Calendar →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayEvents.length === 0 ? (
                  <div style={{ padding: '40px 26px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No upcoming events scheduled
                  </div>
                ) : (
                  displayEvents.map((ev) => {
                    const eventDate = new Date(ev.eventDate);
                    const day = String(eventDate.getDate()).padStart(2, '0');
                    const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    
                    const formatTime = (timeStr) => {
                      if (!timeStr) return '';
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const hour12 = ((hour + 11) % 12) + 1;
                      return `${hour12}:${minutes} ${ampm}`;
                    };
                    
                    const timeStr = ev.startTime ? `${formatTime(ev.startTime)}${ev.endTime ? ' - ' + formatTime(ev.endTime) : ''}` : 'All day';
                    
                    return (
                      <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex',
                          gap: 16,
                          padding: '16px 26px',
                          borderBottom: '1px solid #f1f5f9',
                          alignItems: 'flex-start',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fafbfd'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                        >
                          <div style={{
                            width: 56,
                            borderRadius: 12,
                            background: `linear-gradient(180deg, ${ev.color || '#ef5a24'}, ${ev.color || '#ef5a24'}dd)`,
                            color: 'white',
                            textAlign: 'center',
                            padding: '8px 0',
                            boxShadow: `0 4px 12px ${(ev.color || '#ef5a24')}40`,
                            flexShrink: 0,
                          }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>{day}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5 }}>{month}</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontWeight: 700, fontSize: '0.96rem', color: '#1a1a2e', margin: '0 0 4px' }}>{ev.title}</h4>
                            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 5 }}>
                              <span style={{ fontSize: '0.78rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                {timeStr}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                {ev.location || '—'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>{ev.description || ''}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: `${ev.color || '#ef5a24'}15`,
                              color: ev.color || '#ef5a24',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 700,
                            }}>→</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Announcements Box */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e8ecf0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '22px 26px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                borderBottom: '1px solid #f1f5f9',
              }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1a1a2e', margin: 0, marginBottom: 3 }}>Announcements</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>System notices & updates</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {announcements.length === 0 ? (
                  <div style={{ padding: '40px 26px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No active announcements
                  </div>
                ) : (
                  announcements.map((ann, idx) => (
                    <div key={ann.id || idx} style={{
                      display: 'flex', gap: 16, padding: '16px 26px',
                      borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start',
                      transition: 'background 0.15s', cursor: 'default'
                    }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(239,90,36,0.1)', color: '#ef5a24',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', flexShrink: 0, fontWeight: 800
                      }}>!</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <h4 style={{ fontWeight: 700, fontSize: '0.96rem', color: '#1a1a2e', margin: 0 }}>{ann.title}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {ann.sentAt ? new Date(ann.sentAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                          {ann.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommended for You (uses popular books as fallback) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1a1a2e', margin: 0, marginBottom: 3 }}>Recommended for You</h2>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Based on your borrowing history & category preferences</p>
                </div>
                <Link to="/books" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 18px rgba(99,102,241,0.35)' }}>
                  See All Suggestions →
                </Link>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><Spinner animation="border" style={{ color: '#6366f1' }} /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 18, alignItems: 'stretch' }}>
                  {(popularBooks.length > 0 ? [...popularBooks].reverse().slice(0, 4) : newestBooks.slice(0, 4)).map((book) => (
                    <Link key={`rec-${book.id}`} to={`/books/${book.id}`} style={{ textDecoration: 'none', height: '100%' }}>
                      <div style={{
                        background: 'white', borderRadius: 16, overflow: 'hidden',
                        border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
                        transition: 'all 0.22s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = '#6366f150'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                      >
                        <div style={{ height: 200, background: 'linear-gradient(135deg, #4c1d95, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {book.coverImageUrl
                            ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '3.2rem' }}>📚</span>}
                        </div>
                        <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 5, minHeight: '2.6em' }}>{book.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 8 }}>{book.author}</div>
                          {book.category && (
                            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, marginTop: 'auto' }}>{book.category}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Library Hours + Status */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e8ecf0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '22px 22px 16px',
                background: `linear-gradient(135deg, ${isOpenNow ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'} 0%, rgba(99,102,241,0.04) 100%)`,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a1a2e', margin: 0, marginBottom: 3 }}>Library Hours</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.8rem' }}>Today is {todaysDay} · {hourStr}</p>
                </div>
                <div style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isOpenNow ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '7px 14px',
                  borderRadius: 999,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  boxShadow: isOpenNow ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 14px rgba(239,68,68,0.3)',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', boxShadow: '0 0 8px rgba(255,255,255,0.7)' }} />
                  {isOpenNow ? 'OPEN NOW' : 'CLOSED'}
                </div>
              </div>
              <div style={{ padding: '8px 22px 20px' }}>
                {libraryHours.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No library hours configured
                  </div>
                ) : (
                  libraryHours.map((hour) => {
                    const formatTime = (timeStr) => {
                      if (!timeStr) return 'Closed';
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const hour12 = ((hour + 11) % 12) + 1;
                      return `${hour12}:${minutes} ${ampm}`;
                    };
                    
                    const isToday = hour.dayOfWeek === todaysDay.toUpperCase();
                    const timeStr = hour.isOpen 
                      ? `${formatTime(hour.openTime)} – ${formatTime(hour.closeTime)}`
                      : 'Closed';
                    
                    return (
                      <div key={hour.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 0',
                        borderBottom: hour.dayOfWeek === 'SUNDAY' ? 'none' : '1px dashed #e2e8f0',
                      }}>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#ef5a24' : '#475569',
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                        }}>
                          {isToday && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef5a24' }} />}
                          {hour.dayOfWeek}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: isToday ? 700 : 600,
                          color: isToday ? '#1a1a2e' : '#64748b',
                        }}>{timeStr}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Membership Card (for non-members who are not staff) */}
            {user && !user?.isMember && user?.role !== 'LIBRARIAN' && user?.role !== 'FACULTY' && (
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fde68a 100%)',
                borderRadius: 20,
                border: '1px solid #fed7aa',
                padding: '24px 22px',
                boxShadow: '0 12px 32px rgba(239,90,36,0.12)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'rgba(239,90,36,0.1)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: 14,
                    boxShadow: '0 4px 12px rgba(239,90,36,0.3)',
                  }}>UPGRADE TODAY</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#7c2d12', lineHeight: 1.25 }}>
                    Unlock Premium Library Access
                  </h3>
                  <p style={{ margin: 0, marginBottom: 14, fontSize: '0.84rem', color: '#9a3412', lineHeight: 1.5 }}>
                    Get 6–12 book borrows, 3 reservations, overdue fee waivers and priority inter-library loans.
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      'Up to 12 physical books at a time',
                      '3 active reservations',
                      '2 automatic renewals per checkout',
                      'Priority access to research rooms',
                    ].map(b => (
                      <li key={b} style={{ fontSize: '0.78rem', color: '#7c2d12', fontWeight: 500 }}>{b}</li>
                    ))}
                  </ul>
                  <Link to="/membership" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 22px rgba(26,26,46,0.28)',
                  }}>
                    Apply for Membership →
                  </Link>
                </div>
              </div>
            )}

            {/* Contact + Resources */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e8ecf0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              padding: '22px 22px',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a1a2e', margin: 0, marginBottom: 4 }}>Quick Help Desk</h3>
              <p style={{ color: '#64748b', margin: 0, marginBottom: 16, fontSize: '0.82rem' }}>Get support for membership, borrowing, fines, and digital access.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contactInfo.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No contact information configured
                  </div>
                ) : (
                  contactInfo.slice(0, 5).map((contact) => {
                    const getGradient = (type) => {
                      const gradients = {
                        'EMAIL': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        'PHONE': 'linear-gradient(135deg, #10b981, #059669)',
                        'ADDRESS': 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                        'SOCIAL': 'linear-gradient(135deg, #ec4899, #f43f5e)',
                        'OTHER': 'linear-gradient(135deg, #64748b, #475569)',
                      };
                      return gradients[type] || gradients['OTHER'];
                    };
                    
                    const getBgColor = (type) => {
                      const colors = {
                        'EMAIL': 'rgba(99,102,241,0.06)',
                        'PHONE': 'rgba(16,185,129,0.06)',
                        'ADDRESS': 'rgba(239,90,36,0.06)',
                        'SOCIAL': 'rgba(236,72,153,0.06)',
                        'OTHER': 'rgba(100,116,139,0.06)',
                      };
                      return colors[type] || colors['OTHER'];
                    };
                    
                    const getBorderColor = (type) => {
                      const colors = {
                        'EMAIL': 'rgba(99,102,241,0.12)',
                        'PHONE': 'rgba(16,185,129,0.12)',
                        'ADDRESS': 'rgba(239,90,36,0.12)',
                        'SOCIAL': 'rgba(236,72,153,0.12)',
                        'OTHER': 'rgba(100,116,139,0.12)',
                      };
                      return colors[type] || colors['OTHER'];
                    };
                    
                    const getIcon = (type) => {
                      const icons = {
                        'EMAIL': '✉',
                        'PHONE': '☎',
                        'ADDRESS': '⌂',
                        'SOCIAL': '◌',
                        'OTHER': '◈',
                      };
                      return icons[type] || '◈';
                    };
                    
                    const href = contact.type === 'EMAIL' ? `mailto:${contact.value}` 
                               : contact.type === 'PHONE' ? `tel:${contact.value}`
                               : '#';
                    
                    return (
                      <a
                        key={contact.id}
                        href={href}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          textDecoration: 'none',
                          padding: '11px 12px',
                          borderRadius: 12,
                          background: getBgColor(contact.type),
                          border: `1px solid ${getBorderColor(contact.type)}`,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = getBorderColor(contact.type); }}
                        onMouseLeave={e => { e.currentTarget.style.background = getBgColor(contact.type); }}
                      >
                        <div style={{ 
                          width: 34, height: 34, borderRadius: 10, 
                          background: getGradient(contact.type), 
                          color: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontSize: '0.88rem', flexShrink: 0, fontFamily: 'Segoe UI Symbol, Arial, sans-serif', fontWeight: 700 
                        }}>{getIcon(contact.type)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, letterSpacing: 0.3 }}>
                            {contact.label || contact.type}
                          </div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1a1a2e', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {contact.value}
                          </div>
                        </div>
                      </a>
                    );
                  })
                )}
              </div>

              {/* Social Links */}
              {contactInfo.filter(c => c.type === 'SOCIAL').length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: 0.6, marginBottom: 10 }}>FOLLOW THE LIBRARY</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {contactInfo.filter(c => c.type === 'SOCIAL').map(social => (
                      <a
                        key={social.id}
                        href={social.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                          color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(236,72,153,0.35)',
                          transition: 'transform 0.15s',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                      >
                        {social.label?.substring(0, 2).toUpperCase() || '🌐'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Desk FAQ */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Quick Help Desk</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Answers to the most common library questions</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 14,
          }}>
            {faqs.map((f, i) => (
              <div key={i} style={{
                background: 'white',
                border: '1px solid #e8ecf0',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    textAlign: 'left',
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.93rem',
                    color: '#1a1a2e',
                    lineHeight: 1.4,
                    display: 'inline-flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800,
                      flexShrink: 0, marginTop: 1,
                    }}>Q</span>
                    {f.q}
                  </span>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: openFaq === i ? 'linear-gradient(135deg, #ef5a24, #ff8c5a)' : 'rgba(99,102,241,0.08)',
                    color: openFaq === i ? 'white' : '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800,
                    transition: 'all 0.22s',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                    flexShrink: 0,
                  }}>+</div>
                </button>
                <div style={{
                  maxHeight: openFaq === i ? 400 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  padding: openFaq === i ? '0 20px 20px 54px' : '0 20px 0 54px',
                }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(239,90,36,0.04), rgba(99,102,241,0.04))',
                    borderLeft: '3px solid #ef5a24',
                    color: '#475569',
                    fontSize: '0.87rem',
                    lineHeight: 1.65,
                  }}>
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-member CTA Banner */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 40%, #4c1d95 75%, #ef5a24 100%)',
            borderRadius: 28,
            padding: '44px 40px',
            marginBottom: 48,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 22px 60px rgba(26,26,46,0.3)',
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 120 + i * 60,
                height: 120 + i * 60,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                top: i === 0 ? -40 : i === 1 ? 'auto' : i === 2 ? 20 : 'auto',
                bottom: i === 1 ? -50 : i === 3 ? -30 : 'auto',
                right: i === 0 ? 100 : i === 1 ? 30 : 'auto',
                left: i === 2 ? '45%' : i === 3 ? 100 : 'auto',
              }} />
            ))}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280, maxWidth: 640 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  marginBottom: 18,
                  backdropFilter: 'blur(6px)',
                }}>NEW STUDENT? START HERE</div>
                <h2 style={{ color: 'white', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 12px' }}>
                  Your Library Card opens every door
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 22px', maxWidth: 540 }}>
                  Create a free account to reserve books, track your reading goals, get due-date reminders, and unlock our full collection of 15,000+ resources.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                    color: 'white',
                    padding: '13px 28px',
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    boxShadow: '0 10px 28px rgba(239,90,36,0.45)',
                  }}>
                    Create Free Account →
                  </Link>
                  <Link to="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    padding: '13px 28px',
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    border: '1.5px solid rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(6px)',
                  }}>
                    I Already Have an Account
                  </Link>
                </div>
              </div>
              <div style={{
                flexShrink: 0,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                width: 240,
              }}>
                {[
                  { i: '', l: '15,000+', s: 'Total Resources' },
                  { i: '', l: '5,600+', s: 'Active Members' },
                  { i: '', l: '32', s: 'Categories' },
                  { i: '', l: '4.7/5', s: 'Avg Rating' },
                ].map(m => (
                  <div key={m.l} style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '18px 14px',
                    textAlign: 'center',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{m.i}</div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1, marginBottom: 4 }}>{m.l}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{m.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        <div style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf1ec 100%)', borderRadius: 20, padding: '48px 40px', marginBottom: 40 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 }}>Library Services</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 36, fontSize: '0.9rem' }}>Everything you need, all in one place</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <div key={s.title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', textAlign: 'center', border: '1px solid #e8ecf0', transition: 'all 0.22s', minHeight: 230 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}18`; e.currentTarget.style.borderColor = s.color + '50'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e8ecf0'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.45rem', margin: '0 auto 16px', color: s.color, fontFamily: 'Segoe UI Symbol, Arial, sans-serif', fontWeight: 700 }}>{s.icon}</div>
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
