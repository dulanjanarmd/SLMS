import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, categoryAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({ title: '', author: '', isbn: '', year: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMode, setSearchMode] = useState('all');
  const pageSize = 12;

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const loadBooks = useCallback(async (mode, page) => {
    setLoading(true); setError('');
    try {
      let res;
      if (mode === 'keyword' && searchKeyword.trim()) {
        res = await bookAPI.search(searchKeyword, { page, size: pageSize });
      } else if (mode === 'advanced') {
        res = await bookAPI.advancedSearch({ title: advancedSearch.title || undefined, author: advancedSearch.author || undefined, isbn: advancedSearch.isbn || undefined, year: advancedSearch.year || undefined, categoryId: selectedCategory || undefined, status: selectedStatus || undefined, page, size: pageSize });
      } else if (mode === 'category' && selectedCategory) {
        res = await bookAPI.advancedSearch({ categoryId: selectedCategory, page, size: pageSize });
      } else {
        res = await bookAPI.getAll({ page, size: pageSize, sort: 'createdAt,desc' });
      }
      setBooks(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { setError('Failed to load books.'); }
    finally { setLoading(false); }
  }, [searchKeyword, advancedSearch, selectedCategory, selectedStatus]);

  useEffect(() => { loadBooks(searchMode, currentPage); }, [currentPage]);

  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(0); setSearchMode('keyword'); loadBooks('keyword', 0); };
  const handleAdvancedSearch = (e) => { e.preventDefault(); setCurrentPage(0); setSearchMode('advanced'); loadBooks('advanced', 0); };
  const handleCategoryClick = (catId) => { setSelectedCategory(catId); setCurrentPage(0); const m = catId ? 'category' : 'all'; setSearchMode(m); loadBooks(m, 0); };
  const handleClear = () => { setSearchKeyword(''); setSelectedCategory(''); setSelectedStatus(''); setAdvancedSearch({ title: '', author: '', isbn: '', year: '' }); setCurrentPage(0); setSearchMode('all'); loadBooks('all', 0); };
  const handlePageChange = (p) => { setCurrentPage(p); loadBooks(searchMode, p); };

  const inputStyle = { width: '100%', padding: '11px 16px', background: 'white', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };
  const btnPrimary = { background: 'linear-gradient(135deg, #ef5a24, #ff6b35)', color: 'white', border: 'none', borderRadius: 999, padding: '9px 20px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>📚 Book Catalog</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Browse, search, and discover books from our collection</p>
        </div>
        {!loading && <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 20px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1 }}>{books.length}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Books showing</div>
        </div>}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}

      {/* Search Area */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}>🔍</span>
            <input type="text" placeholder="Search by title, author, ISBN, or keywords..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 42 }}
              onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <button type="submit" style={btnPrimary}>🔍 Search</button>
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} style={{ ...btnPrimary, background: showAdvanced ? '#1a1a2e' : 'rgba(26,26,46,0.08)', color: showAdvanced ? 'white' : '#1a1a2e' }}>
            ⚙️ {showAdvanced ? 'Hide Filters' : 'Filters'}
          </button>
          <button type="button" onClick={handleClear} style={{ ...btnPrimary, background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>✕ Clear</button>
        </form>

        {showAdvanced && (
          <form onSubmit={handleAdvancedSearch} style={{ borderTop: '1px solid #f1f5f9', marginTop: 16, paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
              {[
                { label: 'Title', key: 'title', placeholder: 'Book title' },
                { label: 'Author', key: 'author', placeholder: 'Author name' },
                { label: 'ISBN', key: 'isbn', placeholder: 'ISBN number' },
                { label: 'Year', key: 'year', placeholder: 'e.g. 2022', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder} value={advancedSearch[f.key]} onChange={e => setAdvancedSearch({ ...advancedSearch, [f.key]: e.target.value })} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 5 }}>Status</label>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={inputStyle}>
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ISSUED">Issued</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 5 }}>Category</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={inputStyle}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={btnPrimary}>⚙️ Apply Filters</button>
          </form>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {[{ id: '', name: 'All Books' }, ...categories.slice(0, 9)].map(cat => {
          const isActive = cat.id === '' ? selectedCategory === '' && searchMode !== 'keyword' && searchMode !== 'advanced' : selectedCategory === String(cat.id);
          return (
            <button key={cat.id} onClick={() => handleCategoryClick(String(cat.id))} style={{ padding: '7px 18px', borderRadius: 999, border: isActive ? 'none' : '1.5px solid #e8ecf0', background: isActive ? '#1a1a2e' : 'white', color: isActive ? 'white' : '#374151', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div>
      ) : books.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No books found</div>
          <div style={{ fontSize: '0.88rem' }}>Try adjusting your search terms or filters</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            {books.map((book, idx) => {
              const avail = book.availableCopies > 0;
              return (
                <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#ef5a2440'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}
                  >
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {book.coverImageUrl
                        ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '4rem' }}>📖</span>}
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <span style={{ background: avail ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)', color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                          {avail ? `✓ ${book.availableCopies} avail.` : '✗ Unavail.'}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '14px 14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>by {book.author}</div>
                      {book.isbn && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>ISBN: {book.isbn}</div>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8ecf0', background: 'white', color: '#374151', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.82rem', opacity: currentPage === 0 ? 0.4 : 1 }}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
                <button key={i} onClick={() => handlePageChange(i)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: i === currentPage ? 'none' : '1.5px solid #e8ecf0', background: i === currentPage ? '#ef5a24' : 'white', color: i === currentPage ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.85rem' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8ecf0', background: 'white', color: '#374151', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.82rem', opacity: currentPage === totalPages - 1 ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Books;
