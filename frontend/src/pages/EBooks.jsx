import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ebookAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const emptyEbookForm = { title: '', author: '', isbn: '', description: '', publisher: '', publicationYear: '', language: 'English' };

const EBooks = () => {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';

  const [showUpload, setShowUpload] = useState(false);
  const [ebookForm, setEbookForm] = useState(emptyEbookForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchEBooks(); }, []);

  const fetchEBooks = async () => {
    try { setLoading(true); const res = await ebookAPI.getAllPublic(); setEbooks(Array.isArray(res.data) ? res.data : []); }
    catch { setError('Failed to load eBooks'); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchKeyword.trim()) {
        const res = await ebookAPI.search(searchKeyword, { page: 0, size: 12 });
        setEbooks(res.data?.content || res.data || []);
      } else { fetchEBooks(); }
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault(); if (!pdfFile) { setError('Please select a PDF file.'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(ebookForm).forEach(k => { if (ebookForm[k]) fd.append(k, ebookForm[k]); });
      fd.append('file', pdfFile);
      await ebookAPI.upload(fd);
      setSuccess('eBook uploaded successfully.');
      setShowUpload(false); setEbookForm(emptyEbookForm); setPdfFile(null); fetchEBooks();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this eBook?')) return;
    try { await ebookAPI.delete(id); setSuccess('eBook deleted.'); fetchEBooks(); setTimeout(() => setSuccess(''), 4000); }
    catch { setError('Delete failed.'); }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await ebookAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch { setError('Download failed.'); }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #8b5cf6 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>📱 E-Books Digital Library</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Read and download digital books instantly anywhere</p>
        </div>
        {isLibrarian && (
          <button onClick={() => setShowUpload(true)} style={{ background: 'white', color: '#4c1d95', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
            + Upload E-Book
          </button>
        )}
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>✅ {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}>🔍</span>
            <input type="text" placeholder="Search digital library..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 42, background: 'white' }}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '0 28px', height: 46, fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#8b5cf6' }} /></div>
      ) : ebooks.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📱</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No eBooks found</div>
          <div style={{ fontSize: '0.88rem' }}>Adjust your search terms to find digital content.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {ebooks.map(ebook => (
            <div key={ebook.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1))', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📱</div>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>E-BOOK</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3 }}>{ebook.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 12px' }}>by {ebook.author}</p>
                {ebook.description && <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.description}</p>}
                
                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: '12px', borderRadius: 8, marginBottom: 20 }}>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Size</div><div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{(ebook.fileSize / 1024 / 1024).toFixed(1)} MB</div></div>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Format</div><div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>PDF</div></div>
                </div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleDownload(ebook.id, ebook.title)} style={{ flex: 1, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>⬇️ Download</button>
                  {isLibrarian && (
                    <button onClick={() => handleDelete(ebook.id)} style={{ padding: '0 16px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: '0 0 24px' }}>Upload E-Book</h3>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Title *</label>
                  <input required value={ebookForm.title} onChange={e => setEbookForm({ ...ebookForm, title: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Author *</label>
                  <input required value={ebookForm.author} onChange={e => setEbookForm({ ...ebookForm, author: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Description</label>
                <textarea rows="3" value={ebookForm.description} onChange={e => setEbookForm({ ...ebookForm, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>ISBN</label>
                  <input value={ebookForm.isbn} onChange={e => setEbookForm({ ...ebookForm, isbn: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Year</label>
                  <input type="number" value={ebookForm.publicationYear} onChange={e => setEbookForm({ ...ebookForm, publicationYear: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Language</label>
                  <input value={ebookForm.language} onChange={e => setEbookForm({ ...ebookForm, language: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select PDF File *</div>
                <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowUpload(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                  {uploading ? <Spinner size="sm" /> : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EBooks;