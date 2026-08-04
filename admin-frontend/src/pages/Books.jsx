import React, { useState, useEffect } from 'react';
import { bookAPI, categoryAPI } from '../services/api';

const inputStyle = {
  borderRadius: 12,
  padding: '11px 14px',
  fontFamily: 'Poppins, sans-serif',
  background: '#f8fafc',
  border: '1.5px solid #e5e7eb',
  fontSize: '0.88rem',
  color: '#1f2937',
  outline: 'none',
  width: '100%',
  transition: 'all 0.18s',
};

const focusStyle = { borderColor: '#ef5a24', boxShadow: '0 0 0 3px rgba(239,90,36,0.12)', background: '#fff' };

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [focusField, setFocusField] = useState(null);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', description: '',
    publisher: '', publicationYear: '', totalCopies: '',
    categoryId: '', coverImageUrl: ''
  });

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchBooks(); }, [currentPage, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page: currentPage, size: 15, sort: 'createdAt,desc' };
      let response = searchKeyword ? await bookAPI.search(searchKeyword, params) : await bookAPI.getAll(params);
      let data = response.data.content || response.data;
      if (categoryFilter && Array.isArray(data)) {
        data = data.filter(book => book.categoryId?.toString() === categoryFilter);
      }
      setBooks(Array.isArray(data) ? data : []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBooks();
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedBook(null);
    setFormData({ title: '', author: '', isbn: '', description: '', publisher: '', publicationYear: '', totalCopies: '', categoryId: '', coverImageUrl: '' });
    setShowFormModal(true);
  };

  const openEditModal = (book) => {
    setEditMode(true);
    setSelectedBook(book);
    setFormData({ title: book.title || '', author: book.author || '', isbn: book.isbn || '', description: book.description || '', publisher: book.publisher || '', publicationYear: book.publicationYear?.toString() || '', totalCopies: book.totalCopies?.toString() || '', categoryId: book.categoryId?.toString() || '', coverImageUrl: book.coverImageUrl || '' });
    setShowFormModal(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      const payload = { ...formData, publicationYear: parseInt(formData.publicationYear) || null, totalCopies: parseInt(formData.totalCopies) || 1, categoryId: parseInt(formData.categoryId) || null };
      if (editMode && selectedBook) {
        await bookAPI.update(selectedBook.id, payload);
        setSuccess('Book updated successfully!');
      } else {
        await bookAPI.add(payload);
        setSuccess('Book added successfully!');
      }
      setShowFormModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      setError(''); setSuccess('');
      await bookAPI.delete(selectedBook.id);
      setSuccess('Book deleted successfully!');
      setShowDeleteModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (loading && books.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '0 20px 24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            Admin Portal
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Book Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>
            Add, update, and manage the library's physical and digital collection
          </p>
        </div>
        <button onClick={openAddModal} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
          color: 'white', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
          position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)',
        }}>
          Add Book
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 20, borderRadius: 14, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))', border: '1px solid #ef444440', color: '#991b1b', padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 20, borderRadius: 14, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))', border: '1px solid #10b98140', color: '#065f46', padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem' }}>
          {success}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 200px auto', gap: 12, alignItems: 'center' }}>
          <input type="text" placeholder="Search by title, author, or ISBN..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onFocus={() => setFocusField('search')} onBlur={() => setFocusField(null)} style={{ ...inputStyle, ...(focusField === 'search' ? focusStyle : {}) }} />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(0); }} onFocus={() => setFocusField('cat')} onBlur={() => setFocusField(null)} style={{ ...inputStyle, cursor: 'pointer', ...(focusField === 'cat' ? focusStyle : {}) }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <button type="submit" style={{ padding: '11px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Search
          </button>
          {(searchKeyword || categoryFilter) && (
            <button type="button" onClick={() => { setSearchKeyword(''); setCategoryFilter(''); setCurrentPage(0); fetchBooks(); }} style={{ padding: '11px 20px', borderRadius: 999, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))', border: '1.5px solid #6366f130', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 26px', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))', display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 140px 140px 100px 100px 140px', gap: 14, alignItems: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#4c1d95', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #eef2ff' }}>
          <div>Cover</div>
          <div>Title</div>
          <div>Author</div>
          <div>ISBN</div>
          <div>Category</div>
          <div style={{ textAlign: 'center' }}>Total</div>
          <div style={{ textAlign: 'center' }}>Available</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <div style={{ marginTop: 14, color: '#64748b', fontSize: '0.88rem' }}>Loading books...</div>
          </div>
        ) : books.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>No books found</div>
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Try changing your filters or search query.</div>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 140px 140px 100px 100px 140px', gap: 14, alignItems: 'center', padding: '16px 26px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <div>
                <img src={book.coverImageUrl || 'https://via.placeholder.com/60x90?text=No+Cover'} alt={book.title} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.target.src = 'https://via.placeholder.com/60x90?text=No+Cover'; }} />
              </div>
              <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{book.title}</div>
              <div style={{ color: '#374151', fontSize: '0.85rem' }}>{book.author}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{book.isbn}</div>
              <div><span style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{getCategoryName(book.categoryId)}</span></div>
              <div style={{ textAlign: 'center' }}><span style={{ background: 'rgba(100,116,139,0.1)', color: '#475569', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{book.totalCopies || 0}</span></div>
              <div style={{ textAlign: 'center' }}><span style={{ background: book.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: book.availableCopies > 0 ? '#059669' : '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{book.availableCopies || 0}</span></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => openEditModal(book)} style={{ padding: '7px 14px', borderRadius: 999, cursor: 'pointer', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', fontSize: '0.74rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  Edit
                </button>
                <button onClick={() => openDeleteModal(book)} style={{ padding: '7px 12px', borderRadius: 999, cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid #ef444440', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} style={{ padding: '8px 16px', borderRadius: 8, background: currentPage === 0 ? '#f1f5f9' : 'white', border: '1px solid #e8ecf0', color: currentPage === 0 ? '#9ca3af' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)} style={{ padding: '8px 14px', borderRadius: 8, background: i === currentPage ? '#ef5a24' : 'white', border: '1px solid #e8ecf0', color: i === currentPage ? 'white' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages - 1} style={{ padding: '8px 16px', borderRadius: 8, background: currentPage === totalPages - 1 ? '#f1f5f9' : 'white', border: '1px solid #e8ecf0', color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Next
          </button>
        </div>
      )}

      {showFormModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowFormModal(false); }}>
          <div style={{ width: '100%', maxWidth: 700, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{editMode ? 'Edit Book' : 'Add New Book'}</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>{editMode ? 'Update the book details below.' : 'Fill in the details to add a new book to the library.'}</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '26px 30px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Author <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="author" value={formData.author} onChange={handleFormChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>ISBN <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleFormChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Publisher</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Publication Year</label>
                  <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleFormChange} min="1000" max={new Date().getFullYear()} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Total Copies <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleFormChange} min="1" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Cover Image URL</label>
                  <input type="url" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleFormChange} placeholder="https://example.com/cover.jpg" style={inputStyle} />
                </div>
                {formData.coverImageUrl && (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                    <img src={formData.coverImageUrl} alt="Cover preview" style={{ maxWidth: '150px', maxHeight: '200px', objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: '1px solid #e8ecf0', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  {editMode ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 500, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Confirm Deletion</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>Are you sure you want to delete this book?</p>
            </div>
            <div style={{ padding: '26px 30px' }}>
              {selectedBook && (
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b40', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{selectedBook.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>by {selectedBook.author}</div>
                </div>
              )}
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>This action cannot be undone. All related borrowing records will be affected.</div>
            </div>
            <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: '1px solid #e8ecf0', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Books;
