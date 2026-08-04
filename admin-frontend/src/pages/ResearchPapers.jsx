import React, { useState, useEffect } from 'react';
import { researchPapersAPI } from '../services/api';

const emptyForm = { title: '', author: '', abstractText: '', journal: '', publicationYear: '', researchField: '', keywords: '' };
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

const ResearchPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlob, setViewBlob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => { loadPapers(); }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const res = await researchPapersAPI.getAllPublic();
      setPapers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load research papers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (search.trim()) {
        const res = await researchPapersAPI.search(search, { page: 0, size: 50 });
        setPapers(res.data?.content || res.data || []);
      } else {
        loadPapers();
      }
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file.'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      fd.append('file', pdfFile);
      if (coverFile) fd.append('coverImage', coverFile);
      await researchPapersAPI.upload(fd);
      setSuccess('Research paper uploaded successfully.');
      setShowUpload(false); setForm(emptyForm); setPdfFile(null); setCoverFile(null); loadPapers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload research paper.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;
    try {
      await researchPapersAPI.delete(id);
      setSuccess('Research paper deleted successfully.');
      loadPapers();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to delete research paper.');
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await researchPapersAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'research-paper'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError('Failed to download research paper.');
    }
  };

  const handleView = async (paper) => {
    setViewing(paper);
    setViewLoading(true);
    try {
      const res = await researchPapersAPI.download(paper.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setViewBlob(blobUrl);
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
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Research Paper Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Manage academic publications, journals, and research papers</p>
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
          Upload Research Paper
        </button>
      </div>

      {/* Search Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flex: 1 }}>
          <input
            type="text"
            placeholder="Search research papers by title, author, journal, or keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading research papers...</div>
      ) : papers.length === 0 ? (
        <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', color: '#64748b' }}>
          No research papers found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {papers.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              {p.coverImageUrl && (
                <div style={{ height: 160, background: '#f8fafc', overflow: 'hidden' }}>
                  <img src={getImageUrl(p.coverImageUrl)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e' }}>{p.title}</h3>
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#64748b' }}>By {p.author || 'Unknown Author'}</p>
                {p.journal && <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#ef5a24', fontWeight: 600 }}>Journal: {p.journal}</p>}
                {p.abstractText && (
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.abstractText}
                  </p>
                )}
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8, paddingTop: 12 }}>
                  <ActionBtn onClick={() => handleView(p)} bg="linear-gradient(135deg, #10b981, #059669)" color="white">Read</ActionBtn>
                  <ActionBtn onClick={() => handleDownload(p.id, p.title)} bg="linear-gradient(135deg, #4c1d95, #6d28d9)" color="white">Download</ActionBtn>
                  <ActionBtn onClick={() => handleDelete(p.id)} bg="linear-gradient(135deg, #b91c1c, #ef4444)" color="white">Delete</ActionBtn>
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
          <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Upload Research Paper</h2>
            </div>
            <form onSubmit={handleUpload} style={{ padding: 30, display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Author *</label>
                  <input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Journal / Publisher</label>
                  <input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Publication Year</label>
                  <input type="number" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Research Field</label>
                  <input value={form.researchField} onChange={e => setForm({ ...form, researchField: e.target.value })} style={inputStyle} placeholder="e.g. Artificial Intelligence" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Abstract</label>
                <textarea rows={3} value={form.abstractText} onChange={e => setForm({ ...form, abstractText: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
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
                  {uploading ? 'Uploading...' : 'Upload Paper'}
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
            <h3 style={{ margin: 0 }}>Viewing: {viewing.title}</h3>
            <button onClick={() => { setViewing(null); setViewBlob(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>Close</button>
          </div>
          <div style={{ flex: 1, background: 'white', borderRadius: 12, overflow: 'hidden' }}>
            {viewLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Loading PDF preview...</div>
            ) : viewBlob ? (
              <iframe src={viewBlob} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Unable to load PDF preview.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;
