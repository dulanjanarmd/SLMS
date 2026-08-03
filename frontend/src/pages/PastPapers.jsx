import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { pastPapersAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const emptyForm = {
  title: '',
  academicYear: '1st Year',
  academicSemester: '1',
  semester: '1',
  intakeBatch: '2024 July Intake',
  faculty: '',
  courseCode: '',
  courseName: '',
  department: '',
  examType: 'End Semester',
  description: ''
};
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ACADEMIC_SEMESTERS = ['1', '2', '3', '4'];
const INTAKE_BATCHES = ['2024 July Intake', '2024 January Intake', '2024 June Intake'];
const FACULTIES = ['School of Computing', 'School of Engineering', 'School of Business', 'School of Humanities'];
const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Quiz', 'Assignment', 'Mock Exam', 'Repeat'];

const PastPapers = () => {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ years: [], semesters: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlob, setViewBlob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => { load(); }, [selectedYear, selectedSem]);

  const load = async () => {
    try {
      setLoading(true);
      const [fRes, pRes] = await Promise.all([
        pastPapersAPI.getFilters().catch(() => ({ data: { years: [], semesters: [] } })),
        (selectedYear || selectedSem) ? pastPapersAPI.filter(selectedYear || null, selectedSem || null) : pastPapersAPI.getAllPublic(),
      ]);
      if (fRes?.data) setFilters({ years: fRes.data.years || [], semesters: fRes.data.semesters || [] });
      setPapers(Array.isArray(pRes.data) ? pRes.data : []);
    } catch { setError('Failed to load past papers'); } finally { setLoading(false); }
  };

  const clearFilters = () => { setSelectedYear(''); setSelectedSem(''); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file'); return; }
    if (!form.academicYear || !form.academicSemester || !form.semester || !form.intakeBatch || !form.faculty) {
      setError('Academic year, academic semester, semester, intake batch, and faculty are required');
      return;
    }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if (form[k]) fd.append(k, form[k]); });
      fd.append('file', pdfFile);
      await pastPapersAPI.upload(fd);
      setSuccess('Past paper uploaded successfully');
      setShowUpload(false); setForm(emptyForm); setPdfFile(null); load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this past paper?')) return;
    try { await pastPapersAPI.delete(id); setSuccess('Paper deleted'); load(); setTimeout(() => setSuccess(''), 4000); }
    catch { setError('Delete failed'); }
  };

  const handleDownload = async (paper) => {
    try {
      const res = await pastPapersAPI.download(paper.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', `${paper.courseCode || paper.title}_${paper.academicYear}_${paper.semester}.pdf`.replace(/\s+/g, '_'));
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
  };

  const handleView = async (paper) => {
    try {
      setViewLoading(true); setViewing(paper); setViewBlob(null);
      const res = await fetch(`${API}/past-papers/view/${paper.id}`, {
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

  const grouped = useMemo(() => {
    const g = {};
    papers.forEach(p => {
      const key = `${p.academicYear}__${p.academicSemester || p.semester}__${p.semester}`;
      if (!g[key]) g[key] = [];
      g[key].push(p);
    });
    const keys = Object.keys(g).sort((a, b) => {
      const [ya, sa] = a.split('__');
      const [yb, sb] = b.split('__');
      if (ya !== yb) return yb.localeCompare(ya);
      return sa.localeCompare(sb);
    });
    return { groups: g, keys };
  }, [papers]);

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
  const tabs = [
    { id: 'browse', label: 'Browse' },
    ...(isLibrarian ? [{ id: 'upload', label: 'Upload' }] : []),
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>Past Papers Archive</h1>
          <p style={{ opacity: 0.8, margin: 0, fontSize: '0.86rem' }}>Past exam papers by year, semester, and course — read online or download</p>
        </div>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>{success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f1f5f9', padding: 6, borderRadius: 14, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => t.id === 'upload' ? setShowUpload(true) : setActiveTab(t.id)}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              background: activeTab === t.id ? 'white' : 'transparent',
              color: activeTab === t.id ? '#7c2d12' : '#64748b',
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Academic Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={inputStyle}>
                  <option value="">All Years</option>
                  {(filters.years.length ? filters.years : ACADEMIC_YEARS).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Semester</label>
                <select value={selectedSem} onChange={e => setSelectedSem(e.target.value)} style={inputStyle}>
                  <option value="">All Semesters</option>
                  {(filters.semesters.length ? filters.semesters : ACADEMIC_SEMESTERS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={clearFilters} style={{ padding: '12px 20px', background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
            </div>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div> : papers.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No past papers found</div>
              <div style={{ fontSize: '0.88rem' }}>Try clearing filters or check back later.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {grouped.keys.map(key => {
                const [y, aSem, s] = key.split('__');
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                      <div style={{ background: 'linear-gradient(135deg, #7c2d12, #ef5a24)', color: 'white', padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{y}</span>
                      </div>
                      <div style={{ background: 'rgba(239,90,36,0.1)', color: '#c2410c', padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem' }}>
                        Sem {aSem || s}
                      </div>
                      <div style={{ background: 'rgba(37,99,235,0.08)', color: '#1d4ed8', padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem' }}>
                        {s}
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>• {grouped.groups[key].length} paper{grouped.groups[key].length === 1 ? '' : 's'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {grouped.groups[key].map(p => (
                        <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '18px 20px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(194,65,12,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,90,36,0.35)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8ecf0'; }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239,90,36,0.1)', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}></div>
                            {p.examType && <span style={{ background: 'rgba(124,45,18,0.1)', color: '#7c2d12', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>{p.examType}</span>}
                          </div>
                          {p.courseCode && (
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c2410c', letterSpacing: '0.5px', marginBottom: 4 }}>{p.courseCode}</div>
                          )}
                          <h3 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.courseName || p.title}
                          </h3>
                          {!p.courseName && p.title && <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 10px' }}>{p.title}</p>}
                          {(p.faculty || p.intakeBatch || p.department) && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                              {p.faculty && <div style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem' }}>{p.faculty}</div>}
                              {p.intakeBatch && <div style={{ display: 'inline-block', background: '#f8fafc', color: '#475569', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem' }}>{p.intakeBatch}</div>}
                              {p.department && <div style={{ display: 'inline-block', background: '#f8fafc', color: '#475569', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem' }}>{p.department}</div>}
                            </div>
                          )}
                          {p.description && <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                          {p.fileSize != null && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 14 }}>📄 PDF • {(p.fileSize / 1024 / 1024).toFixed(2)} MB</div>}

                          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                            <button onClick={() => handleView(p)} style={{ flex: 1, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(239,90,36,0.22)' }}>View</button>
                            <button onClick={() => handleDownload(p)} style={{ flex: 1, background: 'linear-gradient(135deg, #7c2d12, #c2410c)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>PDF</button>
                            {isLibrarian && <button onClick={() => handleDelete(p.id)} style={{ padding: '0 12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setError(''); setSuccess(''); } }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#7c2d12', margin: 0 }}>📤 Upload Past Paper</h3>
              <button onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Academic Year *</label>
                  <select required value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Academic Semester *</label>
                  <select required value={form.academicSemester} onChange={e => setForm({ ...form, academicSemester: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Semester *</label>
                  <select required value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Intake / Batch *</label>
                  <select required value={form.intakeBatch} onChange={e => setForm({ ...form, intakeBatch: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {INTAKE_BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Faculty *</label>
                  <select required value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Department</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Course Code</label><input value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. IT3010" style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Course Name / Paper Title</label><input value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} placeholder="e.g. Data Structures and Algorithms" style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Alternative Title (optional)</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 2024 End Semester - Data Structures" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Exam Type</label>
                  <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })} style={inputStyle}>
                    {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div></div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Description / Notes</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Additional info about the paper (optional)" />
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select PDF File *</div>
                <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
                {pdfFile && <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>📎 {pdfFile.name}</div>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #7c2d12, #ef5a24)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? <Spinner size="sm" /> : 'Upload Past Paper'}
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
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,90,36,0.2)', color: '#ef5a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📋</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600 }}>{viewing.courseName || viewing.title}</div>
                <div style={{ opacity: 0.7, fontSize: '0.82rem' }}>
                  {viewing.courseCode && <span>[{viewing.courseCode}] </span>}
                  {viewing.academicYear} • Sem {viewing.academicSemester || viewing.semester} • {viewing.intakeBatch || 'Batch not set'} • {viewing.faculty || ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(viewing)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #7c2d12, #c2410c)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>⬇️ Download</button>
              <button onClick={closeViewer} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>✕ Close</button>
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

export default PastPapers;