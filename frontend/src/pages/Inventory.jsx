import React, { useState, useEffect } from 'react';
import { bookAPI, categoryAPI } from '../services/api';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
  Table, Badge, Modal, Pagination
} from 'react-bootstrap';

const emptyForm = {
  title: '', author: '', additionalAuthors: '', isbn: '', isbn13: '',
  publisher: '', publicationYear: '', description: '', edition: '',
  language: 'English', format: 'Physical', shelfLocation: '',
  totalCopies: 1, replacementCost: '', ddcNumber: '',
  subjectHeadings: '', accessionNumber: '', categoryId: '',
  acquisitionDate: '',
};

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 15;

  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusBook, setStatusBook] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    fetchBooks();
    const interval = setInterval(fetchBooks, 30000);
    return () => clearInterval(interval);
  }, [page, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await bookAPI.search(keyword, {
          page,
          size: PAGE_SIZE,
          ...(statusFilter && { status: statusFilter }),
          ...(categoryFilter && { categoryId: categoryFilter }),
        });
      } else {
        res = await bookAPI.getAll({
          page,
          size: PAGE_SIZE,
          sort: 'createdAt,desc',
          ...(statusFilter && { status: statusFilter }),
          ...(categoryFilter && { categoryId: categoryFilter }),
        });
      }
      setBooks(res?.data?.content || []);
      setTotalPages(res?.data?.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Failed to load books. Please try again.');
      setBooks([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const openAdd = () => {
    setEditBook(null);
    setForm(emptyForm);
    setCoverImage(null);
    setCoverPreview('');
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title || '', author: book.author || '',
      additionalAuthors: book.additionalAuthors || '', isbn: book.isbn || '',
      isbn13: book.isbn13 || '', publisher: book.publisher || '',
      publicationYear: book.publicationYear || '', description: book.description || '',
      edition: book.edition || '', language: book.language || 'English',
      format: book.format || 'Physical', shelfLocation: book.shelfLocation || '',
      totalCopies: book.totalCopies || 1, replacementCost: book.replacementCost || '',
      ddcNumber: book.ddcNumber || '', subjectHeadings: book.subjectHeadings || '',
      accessionNumber: book.accessionNumber || '', categoryId: book.categoryId || '',
      acquisitionDate: book.acquisitionDate || '',
    });
    setCoverImage(null);
    setCoverPreview(book.coverImageUrl || '');
    setShowModal(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        publicationYear: form.publicationYear ? parseInt(form.publicationYear) : null,
        totalCopies: parseInt(form.totalCopies) || 1,
        replacementCost: form.replacementCost ? parseFloat(form.replacementCost) : 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      if (editBook) {
        await bookAPI.updateWithImage(editBook.id, payload, coverImage);
        setSuccess('Book updated successfully.');
      } else {
        await bookAPI.addWithImage(payload, coverImage);
        setSuccess('Book added successfully.');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await bookAPI.update(statusBook.id, { status: newStatus });
      setSuccess(`Book marked as ${newStatus}.`);
      setShowStatusModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    }
  };

  const statusBadge = (status) => {
    const map = { AVAILABLE: 'success', ISSUED: 'danger', RESERVED: 'warning', LOST: 'dark', DAMAGED: 'secondary', WITHDRAWN: 'secondary' };
    return <Badge bg={map[status] || 'secondary'} text={status === 'RESERVED' ? 'dark' : undefined}>{status}</Badge>;
  };

  const filteredBooks = books;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>Inventory Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Manage your entire library collection in real time</p>
        </div>
        <button onClick={openAdd} style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', backdropFilter: 'blur(8px)' }}>
          Add New Book
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>

        {error && (
          <div onClick={() => setError('')} style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 20, color: '#b91c1c',
            fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          }}>
            <span>️ {error}</span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>✕</span>
          </div>
        )}
        {success && (
          <div onClick={() => setSuccess('')} style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 20, color: '#065f46',
            fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          }}>
            <span> {success}</span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>✕</span>
          </div>
        )}

        {/* Search & Filters Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #e8ecf0',
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', margin: '0 0 18px' }}>
            🔍 Search & Filters
          </h3>
          <form onSubmit={handleSearch} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            alignItems: 'end',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Search</label>
              <input
                placeholder="Search title, author, ISBN..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.88rem',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#ef5a24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.88rem',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.15s',
                  background: 'white',
                  boxSizing: 'border-box',
                  color: '#1f2937',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#ef5a24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ISSUED">Issued</option>
                <option value="RESERVED">Reserved</option>
                <option value="LOST">Lost</option>
                <option value="DAMAGED">Damaged</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.88rem',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.15s',
                  background: 'white',
                  boxSizing: 'border-box',
                  color: '#1f2937',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#ef5a24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,90,36,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map(c => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
              </select>
            </div>
            <button type="submit"
              style={{
                padding: '11px 20px',
                borderRadius: 12,
                background: '#1a1a2e',
                color: 'white',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2d1b69'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a1a2e'; }}
            >
              Search
            </button>
            <button type="button"
              onClick={() => { setKeyword(''); setStatusFilter(''); setCategoryFilter(''); setPage(0); fetchBooks(); }}
              style={{
                padding: '11px 20px',
                borderRadius: 12,
                background: 'rgba(99,102,241,0.1)',
                color: '#4f46e5',
                border: '1.5px solid rgba(99,102,241,0.2)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
            >
              Clear
            </button>
          </form>
        </div>

        {/* Books Table Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #e8ecf0',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', margin: 0 }}>
              📚 All Books <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>({filteredBooks?.length || 0} shown)</span>
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <Spinner animation="border" style={{ color: '#ef5a24' }} />
                <div style={{ marginTop: 12, fontSize: '0.9rem', color: '#64748b', fontFamily: 'Poppins, sans-serif' }}>Loading books...</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif', minWidth: 900 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))' }}>
                    {['Title / Author', 'ISBN', 'Category', 'Shelf', 'Copies', 'Available', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '14px 18px',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#4f46e5',
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!Array.isArray(filteredBooks) || filteredBooks.length === 0) ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.95rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
                        No books found. Try adjusting your filters or add a new book.
                      </td>
                    </tr>
                  ) : filteredBooks.map((book, idx) => {
                    const statColor = {
                      AVAILABLE: { bg: 'rgba(16,185,129,0.1)', fg: '#059669' },
                      ISSUED: { bg: 'rgba(239,68,68,0.1)', fg: '#dc2626' },
                      RESERVED: { bg: 'rgba(245,158,11,0.12)', fg: '#d97706' },
                      LOST: { bg: 'rgba(17,24,39,0.08)', fg: '#1f2937' },
                      DAMAGED: { bg: 'rgba(107,114,128,0.1)', fg: '#4b5563' },
                      WITHDRAWN: { bg: 'rgba(107,114,128,0.08)', fg: '#6b7280' },
                    };
                    const c = statColor[book?.status] || statColor.DAMAGED;
                    return (
                      <tr key={book?.id || Math.random()} style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafbff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                      >
                        <td style={{ padding: '14px 18px', minWidth: 240 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1a1a2e', marginBottom: 2 }}>{book?.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{book?.author}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>{book?.isbn || '—'}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#374151' }}>{book?.categoryName || '—'}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#374151' }}>{book?.shelfLocation || '—'}</td>
                        <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, color: '#1a1a2e' }}>
                          {book?.totalCopies ?? '—'}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span style={{
                            background: book?.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: book?.availableCopies > 0 ? '#059669' : '#dc2626',
                            padding: '4px 12px',
                            borderRadius: 999,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}>
                            {book?.availableCopies ?? 0}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: c.bg, color: c.fg,
                            padding: '4px 12px',
                            borderRadius: 999,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap',
                          }}>
                            {(book?.status || '—').toLowerCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
                            <button onClick={() => openEdit(book)} title="Edit"
                              style={{
                                padding: '7px 14px',
                                borderRadius: 999,
                                background: '#1a1a2e',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ef5a24'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#1a1a2e'; }}
                            >
                              Edit
                            </button>
                            <button
                              title="Mark Lost/Damaged"
                              onClick={() => { setStatusBook(book); setNewStatus('LOST'); setShowStatusModal(true); }}
                              style={{
                                padding: '7px 14px',
                                borderRadius: 999,
                                background: 'rgba(99,102,241,0.1)',
                                color: '#4f46e5',
                                border: '1.5px solid rgba(99,102,241,0.2)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                            >
                              Update Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 6, flexWrap: 'wrap' }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                background: page === 0 ? '#f9fafb' : 'white',
                color: page === 0 ? '#9ca3af' : '#1f2937',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >← Prev</button>
            {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                style={{
                  minWidth: 38,
                  height: 38,
                  borderRadius: 10,
                  border: i === page ? 'none' : '1.5px solid #e5e7eb',
                  background: i === page ? 'linear-gradient(135deg, #ef5a24, #ff8c5a)' : 'white',
                  color: i === page ? 'white' : '#1f2937',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: i === page ? '0 4px 12px rgba(239,90,36,0.3)' : 'none',
                  transition: 'all 0.1s',
                }}
              >{i + 1}</button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                background: page >= totalPages - 1 ? '#f9fafb' : 'white',
                color: page >= totalPages - 1 ? '#9ca3af' : '#1f2937',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >Next →</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <div style={{
        display: showModal ? 'flex' : 'none',
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
      >
        <div style={{
          background: 'white',
          borderRadius: 24,
          width: '100%',
          maxWidth: 880,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 28px 80px rgba(0,0,0,0.25)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'white',
            borderRadius: '24px 24px 0 0',
            zIndex: 1,
          }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#1a1a2e' }}>
              {editBook ? '✏️ Edit Book' : '➕ Add New Book'}
            </h3>
            <button onClick={() => setShowModal(false)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                border: 'none', background: '#f1f5f9',
                color: '#475569', fontSize: '1.3rem',
                cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
            >✕</button>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '14px 16px' }}>
                <div style={{ gridColumn: 'span 8' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    ISBN <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input required value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Author <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Additional Authors
                  </label>
                  <input value={form.additionalAuthors} onChange={e => setForm({ ...form, additionalAuthors: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Publisher</label>
                  <input value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Year</label>
                  <input type="number" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    style={{ ...inputStyle, background: 'white' }}>
                    <option value="">Select...</option>
                    {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Shelf Location</label>
                  <input value={form.shelfLocation} onChange={e => setForm({ ...form, shelfLocation: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Copies</label>
                  <input type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Replacement Cost</label>
                  <input type="number" step="0.01" value={form.replacementCost} onChange={e => setForm({ ...form, replacementCost: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Edition</label>
                  <input value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Language</label>
                  <input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>DDC Number</label>
                  <input value={form.ddcNumber} onChange={e => setForm({ ...form, ddcNumber: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Accession No.</label>
                  <input value={form.accessionNumber} onChange={e => setForm({ ...form, accessionNumber: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
                </div>
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject Headings</label>
                  <input placeholder="Comma separated" value={form.subjectHeadings} onChange={e => setForm({ ...form, subjectHeadings: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Cover Image</label>
                  <div style={{
                    border: '1.5px dashed #d1d5db',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <label style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
                      color: 'white',
                      borderRadius: 999,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(76,29,149,0.25)',
                    }}>
                      Choose File
                      <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      {coverImage?.name || coverPreview ? (coverImage?.name || 'Existing cover image') : 'No file chosen'}
                    </span>
                  </div>
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover preview"
                      style={{ height: 100, marginTop: 10, borderRadius: 12, border: '1px solid #e5e7eb', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  )}
                </div>
              </div>
            </div>
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              background: '#f8fafc',
              borderRadius: '0 0 24px 24px',
            }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: 'white',
                  color: '#475569',
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{
                  padding: '12px 26px',
                  borderRadius: 999,
                  background: saving ? '#cbd5e1' : 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: saving ? 'none' : '0 8px 22px rgba(26,26,46,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                {saving && <Spinner size="sm" style={{ color: 'white' }} />}
                {editBook ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Status Change Modal */}
      <div style={{
        display: showStatusModal ? 'flex' : 'none',
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) setShowStatusModal(false); }}
      >
        <div style={{
          background: 'white',
          borderRadius: 24,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 28px 80px rgba(0,0,0,0.25)',
          fontFamily: 'Poppins, sans-serif',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1a1a2e' }}>
              🔄 Update Book Status
            </h3>
            <button onClick={() => setShowStatusModal(false)}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: 'none', background: '#f1f5f9',
                color: '#475569', fontSize: '1.1rem',
                cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
          <div style={{ padding: '22px 24px' }}>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 16px', lineHeight: 1.5 }}>
              Update status for: <strong style={{ color: '#1a1a2e' }}>{statusBook?.title}</strong>
            </p>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              style={{
                ...inputStyle,
                background: 'white',
                padding: '12px 14px',
                fontSize: '0.92rem',
                marginBottom: 8,
              }}
            >
              <option value="AVAILABLE">Available</option>
              <option value="LOST">Lost</option>
              <option value="DAMAGED">Damaged</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            background: '#f8fafc',
          }}>
            <button onClick={() => setShowStatusModal(false)}
              style={{
                padding: '11px 22px',
                borderRadius: 999,
                background: 'white',
                color: '#475569',
                border: '1.5px solid #e5e7eb',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >Cancel</button>
            <button onClick={handleStatusChange}
              style={{
                padding: '11px 22px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
                color: 'white',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 8px 22px rgba(239,90,36,0.35)',
              }}
            >Update Status</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid #e5e7eb',
  fontSize: '0.88rem',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
  transition: 'all 0.15s',
  boxSizing: 'border-box',
  color: '#1f2937',
  background: '#f8fafc',
};

export default Inventory;