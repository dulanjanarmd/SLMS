import React, { useState } from 'react';
import { borrowAPI, bookAPI, userAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const IssueBook = () => {
  const [studentQuery, setStudentQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStudentSearch = async (e) => {
    e.preventDefault(); if (!studentQuery.trim()) return;
    setStudentLoading(true); setStudentError(''); setStudent(null);
    try {
      const res = await userAPI.searchUsers(studentQuery);
      const users = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      if (users.length === 0) setStudentError('No user found with that ID or name.');
      else setStudent(users[0]);
    } catch { setStudentError('Search failed.'); }
    finally { setStudentLoading(false); }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault(); if (!bookQuery.trim()) return;
    setBookLoading(true); setBookError(''); setBookResults([]);
    try {
      const res = await bookAPI.search(bookQuery, { page: 0, size: 8 });
      const books = res.data.content || [];
      if (books.length === 0) setBookError('No books found.');
      setBookResults(books);
    } catch { setBookError('Book search failed.'); }
    finally { setBookLoading(false); }
  };

  const getLoanDays = (role) => (role === 'FACULTY' || role === 'LIBRARIAN' ? 30 : 14);
  const getDueDate = () => {
    if (!student) return '';
    const d = new Date(); d.setDate(d.getDate() + getLoanDays(student.role));
    return d.toLocaleDateString();
  };

  const eligibilityIssues = () => {
    if (!student) return [];
    const issues = [];
    if (!student.isActive) issues.push('Account is deactivated.');
    if ((student.outstandingFine || 0) > 500) issues.push(`Outstanding fine LKR ${student.outstandingFine?.toFixed(2)} exceeds LKR 500.`);
    const max = student.maxBooksAllowed || 4;
    if ((student.currentBorrowCount || 0) >= max) issues.push(`Maximum borrow limit (${max}) reached.`);
    return issues;
  };

  const issues = eligibilityIssues();
  const canIssue = selectedBook && student && issues.length === 0 && selectedBook.availableCopies > 0;

  const handleIssue = async () => {
    setIssuing(true);
    try {
      const res = await borrowAPI.issue({ userId: student.id, bookId: selectedBook.id });
      setSuccess(res.data); setShowConfirm(false); setSelectedBook(null); setBookResults([]);
    } catch (err) { setStudentError(err.response?.data?.message || 'Issue failed.'); setShowConfirm(false); }
    finally { setIssuing(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4, position: 'relative', zIndex: 1 }}> Issue Book</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem', position: 'relative', zIndex: 1 }}>Process new book loans for members</p>
      </div>

      {success && (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)', border: '1.5px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}></div>
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 2 }}>Book Issued Successfully!</div>
            <div style={{ color: '#047857', fontSize: '0.88rem' }}>"{success.bookTitle}" issued to {success.userName}. Due on <strong>{success.dueDate}</strong>.</div>
          </div>
          <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#10b981', marginLeft: 'auto', fontSize: '1.2rem', cursor: 'pointer' }}></button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Member Selection */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span> Find Member
            </h3>
          </div>
          <div style={{ padding: '24px', flex: 1 }}>
            <form onSubmit={handleStudentSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <input type="text" placeholder="ID (e.g. IT12345678) or Name" value={studentQuery} onChange={e => setStudentQuery(e.target.value)} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <button type="submit" disabled={studentLoading} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 10, padding: '0 20px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', cursor: studentLoading ? 'not-allowed' : 'pointer' }}>
                {studentLoading ? <Spinner size="sm" /> : 'Search'}
              </button>
            </form>

            {studentError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>️ {studentError}</div>}

            {student && (
              <div style={{ background: 'linear-gradient(135deg, rgba(239,90,36,0.04), rgba(239,90,36,0.01))', border: '1px solid rgba(239,90,36,0.15)', borderRadius: 14, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(239,90,36,0.1)', color: '#ef5a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                    {student.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.05rem' }}>{student.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.studentStaffId} • {student.role}</div>
                  </div>
                  <span style={{ background: student.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: student.isActive ? '#10b981' : '#ef4444', borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700, marginLeft: 'auto' }}>
                    {student.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'white', padding: '12px', borderRadius: 10, border: '1px solid #e8ecf0' }}>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Borrowing</div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{student.currentBorrowCount} / {student.maxBooksAllowed}</div></div>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Outstanding Fine</div><div style={{ fontWeight: 600, fontSize: '0.85rem', color: student.outstandingFine > 0 ? '#ef4444' : '#10b981' }}>LKR {student.outstandingFine?.toFixed(2) || '0.00'}</div></div>
                </div>
                {issues.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '10px 14px', marginTop: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.8rem', marginBottom: 4 }}>Ineligible to borrow:</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#b91c1c', fontSize: '0.78rem' }}>
                      {issues.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Book Selection */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span> Find Book
            </h3>
          </div>
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <form onSubmit={handleBookSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <input type="text" placeholder="Title, ISBN, Author" value={bookQuery} onChange={e => setBookQuery(e.target.value)} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef5a24'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.background = '#f8fafc'; }} />
              </div>
              <button type="submit" disabled={bookLoading} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 10, padding: '0 20px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', cursor: bookLoading ? 'not-allowed' : 'pointer' }}>
                {bookLoading ? <Spinner size="sm" /> : 'Search'}
              </button>
            </form>

            {bookError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>️ {bookError}</div>}

            {selectedBook ? (
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(99,102,241,0.01))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: '20px', position: 'relative' }}>
                <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}></button>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 60, height: 80, borderRadius: 6, background: '#e8ecf0', overflow: 'hidden', flexShrink: 0 }}>
                    {selectedBook.coverImageUrl ? <img src={selectedBook.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}></div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.05rem', marginBottom: 2 }}>{selectedBook.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>by {selectedBook.author}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8 }}>ISBN: {selectedBook.isbn}</div>
                    <span style={{ background: selectedBook.availableCopies > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: selectedBook.availableCopies > 0 ? '#10b981' : '#ef4444', borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {selectedBook.availableCopies} Copies Available
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 250 }}>
                {bookResults.map(book => (
                  <div key={book.id} onClick={() => setSelectedBook(book)} style={{ display: 'flex', gap: 12, padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s', opacity: book.availableCopies > 0 ? 1 : 0.6 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ width: 40, height: 50, borderRadius: 4, background: '#e8ecf0', overflow: 'hidden', flexShrink: 0 }}>
                      {book.coverImageUrl ? <img src={book.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}></div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a2e' }}>{book.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {book.author}</div>
                      <div style={{ fontSize: '0.7rem', color: book.availableCopies > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{book.availableCopies} available</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px 32px', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span> Confirm Issue
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {student && selectedBook ? (
              canIssue ? <span>Will be due on <strong style={{ color: '#1a1a2e' }}>{getDueDate()}</strong></span> : <span style={{ color: '#ef4444' }}>Cannot issue book. Please check eligibility.</span>
            ) : 'Select a member and a book above.'}
          </div>
        </div>
        <button onClick={() => setShowConfirm(true)} disabled={!canIssue} style={{ background: canIssue ? 'linear-gradient(135deg, #ef5a24, #ff6b35)' : '#f1f5f9', color: canIssue ? 'white' : '#9ca3af', border: 'none', borderRadius: 10, padding: '12px 32px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: canIssue ? 'pointer' : 'not-allowed', boxShadow: canIssue ? '0 8px 24px rgba(239,90,36,0.3)' : 'none', transition: 'all 0.2s' }}>
          Issue Book
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1a1a2e', marginBottom: 20 }}>Confirm Issue</h3>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 24, fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
              Issue <strong>"{selectedBook?.title}"</strong> to <strong>{student?.fullName}</strong>?<br/>
              The book will be due on <strong style={{ color: '#ef5a24' }}>{getDueDate()}</strong>.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handleIssue} disabled={issuing} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: issuing ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                {issuing ? <Spinner size="sm" /> : 'Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueBook;