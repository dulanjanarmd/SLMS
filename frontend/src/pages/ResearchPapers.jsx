import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { researchPapersAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const emptyForm = { title: '', author: '', abstractText: '', journal: '', publicationYear: '', researchField: '', keywords: '' };
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ResearchPapers = () => {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
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

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const res = await researchPapersAPI.getAllPublic(); setPapers(Array.isArray(res.data) ? res.data : []); }
    catch { setError('Failed to load research papers'); } finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (search.trim()) {
        const res = await researchPapersAPI.search(search, { page: 0, size: 50 });
        setPapers(res.data?.content || res.data || []);
      } else load();
    } catch { setError('Search failed'); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if (form[k]) fd.append(k, form[k]); });
      fd.append('file', pdfFile);
      if (coverFile) fd.append('coverImage', coverFile);
      await researchPapersAPI.upload(fd);
      setSuccess('Research paper uploaded successfully');
      setShowUpload(false); setForm(emptyForm); setPdfFile(null); setCoverFile(null); load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this research paper?')) return;
    try { await researchPapersAPI.delete(id); setSuccess('Paper deleted'); load(); setTimeout(() => setSuccess(''), 4000); }
    catch { setError('Delete failed'); }
  };

  const handleDownload = async (paper) => {
    try {
      const res = await researchPapersAPI.download(paper.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', `${paper.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
  };

  const handleView = async (paper) => {
    try {
      setViewLoading(true); setViewing(paper); setViewBlob(null);
      const res = await fetch(`${API}/research-papers/view/${paper.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('View failed');
      const blob = await res.blob();
      setViewBlob(URL.createObjectURL(blob));
    } catch { setError('Failed to open PDF viewer'); setViewing(null); setViewBlob(null); }
    finally { setViewLoading(false); }
  };

  const closeViewer = () => {
    if (viewBlob) URL.revokeObjectURL(viewBlob);
    setViewing(null); setViewBlob(null);
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #06b6d4 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>Research Papers Repository</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.86rem' }}>Browse, read and cite university research publications</p>
        </div>
        {isLibrarian && (
          <button onClick={() => setShowUpload(true)} style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', backdropFilter: 'blur(8px)' }}>
            Upload Research Paper
          </button>
        )}
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>{success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>{error}</div>}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '20px 24px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="text" placeholder="Search papers by title, author, keywords or field..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 42, background: 'white' }} />
          </div>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)', color: 'white', border: 'none', borderRadius: 10, padding: '0 28px', height: 46, fontWeight: 700, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}>Search</button>
        </form>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#06b6d4' }} /></div> : papers.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No research papers found</div>
          <div style={{ fontSize: '0.88rem' }}>Check back later for new publications.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {papers.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,182,212,0.15)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}>
              {p.coverImageUrl ? (
                <div style={{ height: 160, overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={p.coverImageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
              ) : (
                <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, rgba(30,58,138,0.12), rgba(6,182,212,0.12))', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}></div>
                  <span style={{ marginLeft: 'auto', background: 'rgba(6,182,212,0.1)', color: '#0891b2', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>RESEARCH</span>
                </div>
              )}
              <div style={{ padding: p.coverImageUrl ? '18px 22px 22px' : '14px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px' }}>by {p.author}</p>
                {p.researchField && <span style={{ display: 'inline-block', width: 'fit-content', background: 'rgba(99,102,241,0.1)', color: '#4f46e5', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, marginBottom: 10 }}>{p.researchField}</span>}
                {p.abstractText && <p style={{ color: '#475569', fontSize: '0.83rem', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.abstractText}</p>}

                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: '#f8fafc', padding: '10px 12px', borderRadius: 8, marginBottom: 14 }}>
                  {p.publicationYear && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Year</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{p.publicationYear}</div></div>}
                  {p.fileSize != null && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Size</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{(p.fileSize / 1024 / 1024).toFixed(1)} MB</div></div>}
                  {p.journal && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Source</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{p.journal.slice(0, 18)}{p.journal.length > 18 ? '…' : ''}</div></div>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleView(p)} style={{ flex: 1, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(239,90,36,0.22)' }}>Read Online</button>
                  <button onClick={() => handleDownload(p)} style={{ flex: 1, background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Download</button>
                  {isLibrarian && <button onClick={() => handleDelete(p.id)} style={{ padding: '0 14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Delete</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setError(''); setSuccess(''); } }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Upload Research Paper</h3>
              <button onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Author(s) *</label><input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Abstract / Summary</label>
                <textarea rows="3" value={form.abstractText} onChange={e => setForm({ ...form, abstractText: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Journal</label><input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Year</label><input type="number" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Research Field</label><input value={form.researchField} onChange={e => setForm({ ...form, researchField: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Keywords (comma separated)</label>
                <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} style={inputStyle} placeholder="e.g. machine learning, AI, classification" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>PDF File *</div>
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
                <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? <Spinner size="sm" /> : 'Upload Research Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <button onClick={() => handleDownload(viewing)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Download</button>
              <button onClick={closeViewer} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Close</button>
            </div>
          </div>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
            {viewLoading && !viewBlob && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontFamily: 'Poppins, sans-serif' }}>
                <Spinner animation="border" style={{ color: '#ef5a24' }} />
                <div style={{ fontWeight: 600 }}>Loading PDF viewer...</div>
              </div>
            )}
            {viewBlob && <iframe src={viewBlob} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;
