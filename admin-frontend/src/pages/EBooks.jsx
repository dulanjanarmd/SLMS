import React, { useState, useEffect } from 'react';
import { ebookAPI } from '../services/api';

const emptyEbookForm = { title: '', author: '', isbn: '', description: '', publisher: '', publicationYear: '', language: 'English' };
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ActionBtn = ({ onClick, color, bg, border, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      flex: 1,
      minWidth: 0,
      padding: '7px 8px',
      background: bg,
      color: color,
      border: border || 'none',
      borderRadius: 6,
      fontSize: '0.72rem',
      fontWeight: 700,
      fontFamily: 'Poppins, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'transform 0.15s, opacity 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
    onMouseLeave={e => !disabled && (e.currentTarget.style.transform = '')}
  >
    {children}
  </button>
);

const inputStyle = {
  width: '100%',
  padding: '11px 16px',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: '0.88rem',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
  background: '#f8fafc',
  color: '#1a1a2e',
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API.replace(/\/api$/, '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const EBooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [ebookForm, setEbookForm] = useState(emptyEbookForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', isbn: '', description: '', publisher: '', publicationYear: '', language: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlobUrl, setViewBlobUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => { fetchEBooks(); }, []);

  const fetchEBooks = async () => {
    try {
      setLoading(true);
      const res = await ebookAPI.getAllPublic();
      setEbooks(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load eBooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchKeyword.trim()) {
        const res = await ebookAPI.search(searchKeyword, { page: 0, size: 50 });
        setEbooks(res.data?.content || res.data || []);
      } else {
        fetchEBooks();
      }
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
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
      setError(err.response?.data?.message || 'Failed to upload eBook.');
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (ebook) => {
    setEditingEbook(ebook);
    setEditForm({
      title: ebook.title || '',
      author: ebook.author || '',
      isbn: ebook.isbn || '',
      description: ebook.description || '',
      publisher: ebook.publisher || '',
      publicationYear: ebook.publicationYear || '',
      language: ebook.language || 'English',
      isPublic: ebook.isPublic !== false,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingEbook) return;
    setSaving(true); setError('');
    try {
      await ebookAPI.update(editingEbook.id, editForm);
      setSuccess('eBook updated successfully.');
      setShowEdit(false); setEditingEbook(null); fetchEBooks();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update eBook.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this eBook?')) return;
    try {
      await ebookAPI.delete(id);
      setSuccess('eBook deleted successfully.');
      fetchEBooks();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to delete eBook.');
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await ebookAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'ebook'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError('Failed to download eBook.');
    }
  };

  const handleViewOnline = async (ebook) => {
    setViewing(ebook);
    setViewLoading(true);
    try {
      const res = await ebookAPI.download(ebook.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setViewBlobUrl(blobUrl);
    } catch {
      setError('Failed to load PDF preview.');
      setViewing(null);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div style={{ padding: '100px 20px 24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)',
        borderRadius: 20, padding: '36px 40px', color: 'white', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>eBook Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Manage digital library books, PDFs, and metadata</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'white', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
            position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)',
          }}
        >
          Upload eBook
        </button>
      </div>

      {/* Search & Feedback */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 280 }}>
          <input
            type="text"
            placeholder="Search eBooks by title, author, or ISBN..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={{
            padding: '11px 22px', borderRadius: 10, background: '#1a1a2e', color: 'white',
            border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
          }}>Search</button>
        </form>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: 10, marginBottom: 20 }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 20px', borderRadius: 10, marginBottom: 20 }}>{success}</div>}

      {/* eBook List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading eBooks...</div>
      ) : ebooks.length === 0 ? (
        <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', color: '#64748b' }}>
          No eBooks found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {ebooks.map(ebook => (
            <div key={ebook.id} style={{
              background: 'white', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', transition: 'transform 0.2s'
            }}>
              {/* Cover Header */}
              <div style={{
                height: 180, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative', borderBottom: '1px solid #f1f5f9'
              }}>
                {ebook.coverImageUrl ? (
                  <img src={getImageUrl(ebook.coverImageUrl)} alt={ebook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: '#94a3b8', textAlign: 'center', padding: 10 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>PDF</div>
                    <div style={{ fontSize: '0.75rem' }}>No Cover Image</div>
                  </div>
                )}
              </div>
              {/* Content */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>{ebook.title}</h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b' }}>By {ebook.author || 'Unknown Author'}</p>
                {ebook.isbn && <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#94a3b8' }}>ISBN: {ebook.isbn}</p>}
                
                {/* Action buttons */}
                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 12 }}>
                  <ActionBtn onClick={() => handleViewOnline(ebook)} bg="linear-gradient(135deg, #10b981, #059669)" color="white">
                    Read Online
                  </ActionBtn>
                  <ActionBtn onClick={() => handleDownload(ebook.id, ebook.title)} bg="linear-gradient(135deg, #4c1d95, #6d28d9)" color="white">
                    Download
                  </ActionBtn>
                  <ActionBtn onClick={() => openEdit(ebook)} bg="linear-gradient(135deg, #3730a3, #6366f1)" color="white">
                    Edit
                  </ActionBtn>
                  <ActionBtn onClick={() => handleDelete(ebook.id)} bg="linear-gradient(135deg, #b91c1c, #ef4444)" color="white">
                    Delete
                  </ActionBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div style={{ width: '100%', maxWidth: 550, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Upload New eBook</h2>
            </div>
            <form onSubmit={handleUpload} style={{ padding: 30, display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Title *</label>
                <input required value={ebookForm.title} onChange={e => setEbookForm({ ...ebookForm, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Author *</label>
                  <input required value={ebookForm.author} onChange={e => setEbookForm({ ...ebookForm, author: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>ISBN</label>
                  <input value={ebookForm.isbn} onChange={e => setEbookForm({ ...ebookForm, isbn: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Publisher</label>
                  <input value={ebookForm.publisher} onChange={e => setEbookForm({ ...ebookForm, publisher: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Publication Year</label>
                  <input type="number" value={ebookForm.publicationYear} onChange={e => setEbookForm({ ...ebookForm, publicationYear: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>PDF File *</label>
                <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Cover Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowUpload(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{ padding: '10px 24px', borderRadius: 999, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div style={{ width: '100%', maxWidth: 550, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Edit eBook Details</h2>
            </div>
            <form onSubmit={handleUpdate} style={{ padding: 30, display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Title</label>
                <input required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Author</label>
                  <input required value={editForm.author} onChange={e => setEditForm({ ...editForm, author: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>ISBN</label>
                  <input value={editForm.isbn} onChange={e => setEditForm({ ...editForm, isbn: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: 999, background: 'linear-gradient(135deg, #3730a3, #6366f1)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {viewing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', padding: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Reading: {viewing.title}</h3>
            <button onClick={() => { setViewing(null); setViewBlobUrl(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>Close</button>
          </div>
          <div style={{ flex: 1, background: 'white', borderRadius: 12, overflow: 'hidden' }}>
            {viewLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Loading PDF preview...</div>
            ) : viewBlobUrl ? (
              <iframe src={viewBlobUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Unable to load PDF preview.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EBooks;
