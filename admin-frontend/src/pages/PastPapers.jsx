import React, { useState, useEffect } from 'react';
import { pastPapersAPI } from '../services/api';

const emptyForm = {
  title: '',
  academicYear: '1st Year',
  academicSemester: '1',
  semester: '1',
  intakeBatch: '2024 January',
  faculty: '',
  degreeLevel: 'Undergraduate',
  courseCode: '',
  courseName: '',
  department: '',
  examType: 'End Semester',
  description: ''
};

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ACADEMIC_SEMESTERS = ['1', '2'];
const FACULTIES = ['Faculty of Computing', 'Faculty of Business', 'Faculty of Engineering', 'Faculty of Humanities and Science', 'Faculty of Architecture', 'Faculty of Law'];
const DEGREE_LEVELS = ['Undergraduate', 'Postgraduate'];
const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Quiz', 'Assignment', 'Mock Exam', 'Repeat'];

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

const PastPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [searchModule, setSearchModule] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlob, setViewBlob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => { loadPapers(); }, [selectedFaculty, selectedDegreeLevel, selectedYear, selectedSem, searchModule]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      if (selectedFaculty || selectedDegreeLevel || selectedYear || selectedSem || searchModule) {
        const res = await pastPapersAPI.filter(selectedYear || null, selectedSem || null, selectedDegreeLevel || null, selectedFaculty || null, null, searchModule || null);
        setPapers(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await pastPapersAPI.getAllPublic();
        setPapers(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      setError('Failed to load past papers.');
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
      await pastPapersAPI.upload(fd);
      setSuccess('Past paper uploaded successfully.');
      setShowUpload(false); setForm(emptyForm); setPdfFile(null); loadPapers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload past paper.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this past paper?')) return;
    try {
      await pastPapersAPI.delete(id);
      setSuccess('Past paper deleted successfully.');
      loadPapers();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to delete past paper.');
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await pastPapersAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'past-paper'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError('Failed to download past paper.');
    }
  };

  const handleView = async (paper) => {
    setViewing(paper);
    setViewLoading(true);
    try {
      const res = await pastPapersAPI.download(paper.id);
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
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Past Paper Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Manage examination papers, filter by faculty and course modules</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            padding: '12px 24px', borderRadius: 999,
            background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: '0.88rem',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 8px 20px rgba(239,90,36,0.3)', transition: 'transform 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          + Upload Past Paper
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #f1f5f9', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} style={inputStyle}>
          <option value="">All Faculties</option>
          {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={selectedDegreeLevel} onChange={e => setSelectedDegreeLevel(e.target.value)} style={inputStyle}>
          <option value="">All Degree Levels</option>
          {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={inputStyle}>
          <option value="">All Years</option>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={selectedSem} onChange={e => setSelectedSem(e.target.value)} style={inputStyle}>
          <option value="">All Semesters</option>
          {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <input
          type="text"
          placeholder="Module / Course Code..."
          value={searchModule}
          onChange={e => setSearchModule(e.target.value)}
          style={inputStyle}
        />
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: 10, marginBottom: 20 }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 20px', borderRadius: 10, marginBottom: 20 }}>{success}</div>}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading past papers...</div>
      ) : papers.length === 0 ? (
        <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', color: '#64748b' }}>
          No past papers found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {papers.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: 16, padding: 22,
              border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ background: 'rgba(239,90,36,0.1)', color: '#ef5a24', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                  {p.courseCode || 'PAST PAPER'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.examType}</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e' }}>{p.title}</h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b' }}>{p.courseName || p.department || 'SLIIT Exam'}</p>
              
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div>Year: {p.academicYear}</div>
                <div>Sem: {p.semester}</div>
                <div>Faculty: {p.faculty || '—'}</div>
                <div>Batch: {p.intakeBatch || '—'}</div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <ActionBtn onClick={() => handleView(p)} bg="linear-gradient(135deg, #10b981, #059669)" color="white">View</ActionBtn>
                <ActionBtn onClick={() => handleDownload(p.id, p.title)} bg="linear-gradient(135deg, #4c1d95, #6d28d9)" color="white">Download</ActionBtn>
                <ActionBtn onClick={() => handleDelete(p.id)} bg="linear-gradient(135deg, #b91c1c, #ef4444)" color="white">Delete</ActionBtn>
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
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Upload Past Paper</h2>
            </div>
            <form onSubmit={handleUpload} style={{ padding: 30, display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="e.g. OOP End Semester Exam 2023" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Course Code *</label>
                  <input required value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} style={inputStyle} placeholder="e.g. IT1020" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Course Name</label>
                  <input value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} style={inputStyle} placeholder="e.g. Object Oriented Programming" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Faculty</label>
                  <select value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} style={inputStyle}>
                    <option value="">Select Faculty</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Exam Type</label>
                  <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })} style={inputStyle}>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Academic Year</label>
                  <select value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} style={inputStyle}>
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Semester</label>
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={inputStyle}>
                    {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>PDF File *</label>
                <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={inputStyle} />
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

export default PastPapers;
