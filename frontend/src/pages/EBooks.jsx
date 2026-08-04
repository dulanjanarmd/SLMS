import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ebookAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const emptyEbookForm = { title: '', author: '', isbn: '', description: '', publisher: '', publicationYear: '', language: 'English' };
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const DownloadBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ flex: 1, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
    {children}
  </button>
);

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
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlobUrl, setViewBlobUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

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
        const res = await ebookAPI.search(searchKeyword, { page: 0, size: 24 });
        setEbooks(res.data?.content || res.data || []);
      } else { fetchEBooks(); }
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file.'); return; }
    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.'); return;
    }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(ebookForm).forEach(k => {
        if (ebookForm[k] !== '' && ebookForm[k] !== null && ebookForm[k] !== undefined) {
          fd.append(k, ebookForm[k]);
        }
      });
      fd.append('file', pdfFile);
      if (coverFile) fd.append('coverImage', coverFile);
      await ebookAPI.upload(fd);
      setSuccess('eBook uploaded successfully.');
      setShowUpload(false); setEbookForm(emptyEbookForm); setPdfFile(null); setCoverFile(null); fetchEBooks();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Upload failed. Please check your connection and try again.';
      setError(typeof msg === 'string' ? msg : 'Upload failed.');
    } finally { setUploading(false); }
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
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
    } catch { setError('Download failed.'); }
  };

  const handleViewOnline = async (ebook) => {
    try {
      setViewLoading(true); setViewing(ebook);
      const res = await fetch(`${API}/ebooks/view/${ebook.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('View failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setViewBlobUrl(url);
    } catch { setError('Failed to open PDF viewer.'); setViewing(null); setViewBlobUrl(null); }
    finally { setViewLoading(false); }
  };

  const closeViewer = () => {
    if (viewBlobUrl) URL.revokeObjectURL(viewBlobUrl);
    setViewing(null); setViewBlobUrl(null);
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1300, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #8b5cf6 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>E-Books Digital Library</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Read and download digital books instantly anywhere</p>
        </div>
        {isLibrarian && (
          <button onClick={() => setShowUpload(true)} style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', backdropFilter: 'blur(8px)' }}>
            Upload E-Book
          </button>
        )}
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>{success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>{error}</div>}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}></span>
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
          <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No eBooks found</div>
          <div style={{ fontSize: '0.88rem' }}>Adjust your search terms to find digital content.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {ebooks.map(ebook => (
            <div key={ebook.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}>
              {ebook.coverImageUrl ? (
                <div style={{ height: 180, background: '#f8fafc', overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={ebook.coverImageUrl} alt={ebook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
              ) : (
                <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, position: 'relative' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.15))', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}></div>
                  <span style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>E-BOOK</span>
                </div>
              )}
              <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 12px' }}>by {ebook.author}</p>
                {ebook.description && <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ebook.description}</p>}

                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Size</div><div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{ebook.fileSize != null ? `${(ebook.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}</div></div>
                  <div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Format</div><div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{ebook.fileFormat || 'PDF'}</div></div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleViewOnline(ebook)} style={{ flex: 1, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(239,90,36,0.25)' }}>
                    Read Online
                  </button>
                  <DownloadBtn onClick={() => handleDownload(ebook.id, ebook.title)}>Download</DownloadBtn>
                  {isLibrarian && (
                    <button onClick={() => handleDelete(ebook.id)} style={{ padding: '0 14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setError(''); setSuccess(''); } }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1a1a2e', margin: 0 }}>Upload E-Book</h3>
              <button onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>×</button>
            </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>ISBN</label>
                  <input value={ebookForm.isbn} onChange={e => setEbookForm({ ...ebookForm, isbn: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Publisher</label>
                  <input value={ebookForm.publisher} onChange={e => setEbookForm({ ...ebookForm, publisher: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Year</label>
                  <input type="number" value={ebookForm.publicationYear} onChange={e => setEbookForm({ ...ebookForm, publicationYear: e.target.value })} style={inputStyle} min="1000" max={new Date().getFullYear()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Language</label>
                  <input value={ebookForm.language} onChange={e => setEbookForm({ ...ebookForm, language: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select PDF File *</div>
                  <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
                  {pdfFile && <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{pdfFile.name}</div>}
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Cover Figure (optional)</div>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
                  {coverFile && (
                    <div style={{ marginTop: 10 }}>
                      <img src={URL.createObjectURL(coverFile)} alt="preview" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e8ecf0' }} />
                      <div style={{ fontSize: '0.78rem', color: '#ef5a24', fontWeight: 600, marginTop: 6 }}>{coverFile.name}</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? <Spinner size="sm" /> : 'Upload E-Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 10000, padding: 20 }} onClick={e => { if (e.target === e.currentTarget) closeViewer(); }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginBottom: 12, fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,90,36,0.2)', color: '#ef5a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600 }}>{viewing.title}</div>
                <div style={{ opacity: 0.7, fontSize: '0.82rem' }}>by {viewing.author}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(viewing.id, viewing.title)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Download</button>
              <button onClick={closeViewer} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Close</button>
            </div>
          </div>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
            {viewLoading && !viewBlobUrl && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontFamily: 'Poppins, sans-serif' }}>
                <Spinner animation="border" style={{ color: '#ef5a24' }} />
                <div style={{ fontWeight: 600 }}>Loading PDF viewer...</div>
              </div>
            )}
            {viewBlobUrl && <iframe src={viewBlobUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default EBooks;