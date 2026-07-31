import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

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

const eventColors = [
  { name: 'Orange', value: '#ef5a24' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Sky', value: '#0ea5e9' },
];

const categoryOptions = ['Workshop', 'Seminar', 'Author Talk', 'Study Camp', 'Training', 'Holiday', 'Closure', 'Meeting', 'Exhibition', 'Other'];

const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  location: '',
  category: 'Workshop',
  color: '#ef5a24',
  isActive: true,
  isPublic: true,
  banner: '',
  maxAttendees: '',
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [focusField, setFocusField] = useState(null);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAll();
      setEvents(res.data || []);
    } catch {
      flash('Failed to load events.', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditingId(e.id);
    setForm({
      title: e.title || '',
      description: e.description || '',
      eventDate: e.eventDate ? String(e.eventDate).slice(0, 10) : '',
      startTime: e.startTime ? String(e.startTime).slice(0, 5) : '',
      endTime: e.endTime ? String(e.endTime).slice(0, 5) : '',
      location: e.location || '',
      category: e.category || 'Workshop',
      color: e.color || '#ef5a24',
      isActive: e.isActive !== false,
      isPublic: e.isPublic !== false,
      banner: e.banner || '',
      maxAttendees: e.maxAttendees ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return flash('Event title is required.', false);
    if (!form.eventDate) return flash('Event date is required.', false);
    if (!form.startTime) return flash('Start time is required.', false);
    setSaving(true);
    try {
      const payload = {
        ...form,
        maxAttendees: form.maxAttendees === '' || form.maxAttendees == null ? null : Number(form.maxAttendees),
      };
      if (editingId) {
        await eventAPI.update(editingId, payload);
        flash('Event updated successfully!');
      } else {
        await eventAPI.create(payload);
        flash('Event created successfully!');
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      const msgText = err?.response?.data?.message || err?.message || 'Save failed.';
      flash(msgText, false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete event "${ev.title}"? This cannot be undone.`)) return;
    try {
      await eventAPI.delete(ev.id);
      flash('Event deleted.');
      loadEvents();
    } catch {
      flash('Delete failed.', false);
    }
  };

  const handleToggle = async (ev) => {
    try {
      await eventAPI.toggleActive(ev.id);
      flash(ev.isActive ? 'Event hidden from public.' : 'Event is now public.');
      loadEvents();
    } catch {
      flash('Toggle failed.', false);
    }
  };

  const filtered = events.filter(e => {
    const matchSearch = !search ||
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(search.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === 'ALL' || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(String(d) + 'T00:00:00');
      return {
        day: String(dt.getDate()).padStart(2, '0'),
        month: dt.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        full: dt.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      };
    } catch { return { day: '??', month: '???', full: String(d) }; }
  };

  const fmtTime = (t) => {
    if (!t) return '';
    const s = String(t).slice(0, 5);
    const [h, m] = s.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = ((hr + 11) % 12) + 1;
    return `${h12}:${m} ${ampm}`;
  };

  const isPast = (d) => {
    if (!d) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dt = new Date(String(d) + 'T00:00:00');
    return dt < today;
  };

  const totalActive = events.filter(e => e.isActive).length;
  const totalUpcoming = events.filter(e => !isPast(e.eventDate) && e.isActive).length;
  const totalPublic = events.filter(e => e.isPublic && e.isActive).length;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #4c1d95 70%, #ef5a24 100%)',
        borderRadius: 24, padding: '30px 34px', color: 'white',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: 180 + i * 80,
            height: 180 + i * 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: i === 0 ? -70 : i === 1 ? 'auto' : 30,
            bottom: i === 1 ? -80 : 'auto',
            right: i === 0 ? -60 : i === 1 ? 80 : 'auto',
            left: i === 2 ? '35%' : 'auto',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0, marginBottom: 6 }}>Event Management</h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: '0.92rem', maxWidth: 480 }}>
            Create, schedule and manage library events — workshops, author talks, closures, study sessions and more.
          </p>
        </div>
        <button onClick={openCreate} style={{
          background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
          color: 'white', border: 'none',
          padding: '13px 24px', borderRadius: 999,
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 10px 28px rgba(239,90,36,0.45)',
          cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          transition: 'transform 0.18s', position: 'relative', zIndex: 1,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          Create New Event
        </button>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { i: '', l: 'Total Events', v: events.length, c: '#6366f1' },
          { i: '', l: 'Active', v: totalActive, c: '#10b981' },
          { i: '', l: 'Upcoming', v: totalUpcoming, c: '#ef5a24' },
          { i: '', l: 'Public', v: totalPublic, c: '#8b5cf6' },
        ].map(s => (
          <div key={s.l} style={{
            background: 'white', borderRadius: 18, padding: '20px 20px 22px',
            border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${s.c}15, ${s.c}05)`,
              transform: 'translate(25%, -25%)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `linear-gradient(135deg, ${s.c}, ${s.c}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.15rem',
                boxShadow: `0 6px 16px ${s.c}40`,
              }}>{s.i}</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.l}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginTop: 10, position: 'relative', zIndex: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div style={{
          marginBottom: 20, borderRadius: 14,
          background: msg.ok ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))',
          border: `1px solid ${msg.ok ? '#10b98140' : '#ef444440'}`,
          color: msg.ok ? '#065f46' : '#991b1b',
          padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem',
        }}>{msg.text}</div>
      )}

      {/* Search + Filters */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '20px 22px',
        border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 220px auto',
          gap: 12, alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Search by title, location or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocusField('search')}
              onBlur={() => setFocusField(null)}
              style={{ ...inputStyle, ...(focusField === 'search' ? focusStyle : {}) }}
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            onFocus={() => setFocusField('cat')}
            onBlur={() => setFocusField(null)}
            style={{ ...inputStyle, cursor: 'pointer', ...(focusField === 'cat' ? focusStyle : {}) }}
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => { setSearch(''); setFilterCat('ALL'); }} style={{
            padding: '11px 20px', borderRadius: 999,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
            border: '1.5px solid #6366f130',
            color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          }}>Clear</button>
        </div>
      </div>

      {/* Events list */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1px solid #e8ecf0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 26px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))',
          display: 'grid', gridTemplateColumns: '100px 2fr 160px 2fr 110px 200px',
          gap: 14, alignItems: 'center',
          fontWeight: 700, fontSize: '0.78rem', color: '#4c1d95',
          textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #eef2ff',
        }}>
          <div>Date</div>
          <div>Event Details</div>
          <div>Time</div>
          <div>Location / Category</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spinner animation="border" style={{ color: '#ef5a24' }} />
            <div style={{ marginTop: 14, color: '#64748b', fontSize: '0.88rem' }}>Loading events...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>No events found</div>
            <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>
              {events.length === 0 ? "Get started by creating your first event." : "Try changing your filters or search query."}
            </div>
            {events.length === 0 && (
              <button onClick={openCreate} style={{
                background: 'linear-gradient(135deg, #1a1a2e, #4c1d95)',
                color: 'white', border: 'none', padding: '11px 22px', borderRadius: 999,
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              }}>Create First Event</button>
            )}
          </div>
        ) : (
          filtered.map(ev => {
            const fd = formatDate(ev.eventDate);
            const past = isPast(ev.eventDate);
            return (
              <div key={ev.id} style={{
                display: 'grid', gridTemplateColumns: '100px 2fr 160px 2fr 110px 200px',
                gap: 14, alignItems: 'center',
                padding: '16px 26px',
                borderBottom: '1px solid #f1f5f9',
                transition: 'background 0.15s',
                background: past ? 'rgba(248,250,252,0.5)' : 'white',
              }}
              onMouseEnter={e => e.currentTarget.style.background = past ? 'rgba(241,245,249,0.7)' : '#fafbff'}
              onMouseLeave={e => e.currentTarget.style.background = past ? 'rgba(248,250,252,0.5)' : 'white'}
              >
                {/* Date chip */}
                <div style={{
                  borderRadius: 14,
                  background: `linear-gradient(180deg, ${ev.color || '#ef5a24'}, ${ev.color || '#ef5a24'}cc)`,
                  color: 'white', textAlign: 'center',
                  padding: '10px 0',
                  boxShadow: `0 4px 12px ${ev.color || '#ef5a24'}40`,
                  opacity: past ? 0.55 : 1,
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{fd.day}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5 }}>{fd.month}</div>
                </div>

                {/* Details */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '0.96rem', color: '#1a1a2e',
                    lineHeight: 1.3, marginBottom: 4,
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                    opacity: past ? 0.6 : 1,
                  }}>
                    {ev.title}
                    {past && <span style={{
                      background: 'rgba(148,163,184,0.15)', color: '#64748b',
                      padding: '2px 8px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700,
                    }}>PAST</span>}
                  </div>
                  {ev.description && (
                    <div style={{
                      color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{ev.description}</div>
                  )}
                </div>

                {/* Time */}
                <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {fmtTime(ev.startTime)}
                    {ev.endTime && <span style={{ color: '#94a3b8' }}> — {fmtTime(ev.endTime)}</span>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 3, fontWeight: 500 }}>{fd.full}</div>
                </div>

                {/* Location / category */}
                <div style={{ minWidth: 0 }}>
                  {ev.location && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 4,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.location}</span>
                    </div>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: `linear-gradient(135deg, ${ev.color || '#ef5a24'}12, ${ev.color || '#ef5a24'}08)`,
                    color: ev.color || '#ef5a24',
                    padding: '4px 12px', borderRadius: 999,
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.3,
                  }}>
                    {ev.category || 'General'}
                  </span>
                  {!ev.isPublic && ev.isActive && (
                    <span style={{
                      marginLeft: 6, display: 'inline-flex',
                      background: 'rgba(245,158,11,0.12)', color: '#d97706',
                      padding: '4px 10px', borderRadius: 999,
                      fontSize: '0.65rem', fontWeight: 700,
                    }}>Private</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 999,
                    fontSize: '0.72rem', fontWeight: 700,
                    background: ev.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                    color: ev.isActive ? '#059669' : '#475569',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: ev.isActive ? '#10b981' : '#64748b',
                    }} />
                    {ev.isActive ? 'ACTIVE' : 'HIDDEN'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleToggle(ev)} title={ev.isActive ? 'Hide from public' : 'Make public'} style={{
                    padding: '7px 11px', borderRadius: 999, cursor: 'pointer',
                    background: ev.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: ev.isActive ? '#d97706' : '#059669',
                    border: `1px solid ${ev.isActive ? '#f59e0b40' : '#10b98140'}`,
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    {ev.isActive ? '👁️ Hide' : '🟢 Show'}
                  </button>
                  <button onClick={() => openEdit(ev)} style={{
                    padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                    color: 'white', border: 'none',
                    fontSize: '0.74rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >✏️ Edit</button>
                  <button onClick={() => handleDelete(ev)} style={{
                    padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#dc2626', border: '1px solid #ef444440',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '40px 20px', overflowY: 'auto',
          fontFamily: 'Poppins, sans-serif',
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            width: '100%', maxWidth: 880,
            background: 'white', borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 2,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)',
              padding: '22px 30px', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingId ? '✏️ Edit Event' : '➕ Create New Event'}
                </h2>
                <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>
                  {editingId ? 'Update the event details below.' : 'Fill in the details to schedule a new library event.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.25)',
                cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.4)'; e.currentTarget.style.borderColor = '#ef444480'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '26px 30px 6px' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14,
              }}>
                {/* Title - span 8 */}
                <div style={{ gridColumn: 'span 8' }}>
                  <label style={labelStyle}>Event Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    placeholder="e.g. Research Writing Workshop"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    onFocus={() => setFocusField('title')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'title' ? focusStyle : {}) }}
                  />
                </div>
                {/* Category - span 4 */}
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    onFocus={() => setFocusField('cat2')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, cursor: 'pointer', ...(focusField === 'cat2' ? focusStyle : {}) }}
                  >
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Date - span 4 */}
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={labelStyle}>Event Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={e => setForm({ ...form, eventDate: e.target.value })}
                    onFocus={() => setFocusField('date')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'date' ? focusStyle : {}) }}
                  />
                </div>
                {/* Start time - span 4 */}
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={labelStyle}>Start Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    onFocus={() => setFocusField('st')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'st' ? focusStyle : {}) }}
                  />
                </div>
                {/* End time - span 4 */}
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={labelStyle}>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    onFocus={() => setFocusField('et')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'et' ? focusStyle : {}) }}
                  />
                </div>

                {/* Location - span 6 */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={labelStyle}>📍 Location</label>
                  <input
                    placeholder="e.g. Room 301, Main Auditorium, Library Lobby..."
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    onFocus={() => setFocusField('loc')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'loc' ? focusStyle : {}) }}
                  />
                </div>
                {/* Max Attendees - span 3 */}
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={labelStyle}>👥 Max Attendees</label>
                  <input
                    type="number" min="0" placeholder="Optional"
                    value={form.maxAttendees}
                    onChange={e => setForm({ ...form, maxAttendees: e.target.value })}
                    onFocus={() => setFocusField('max')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'max' ? focusStyle : {}) }}
                  />
                </div>
                {/* Banner - span 3 */}
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={labelStyle}>🎨 Banner Emoji</label>
                  <input
                    placeholder="📚, 🎓, etc."
                    value={form.banner}
                    onChange={e => setForm({ ...form, banner: e.target.value })}
                    onFocus={() => setFocusField('bn')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, ...(focusField === 'bn' ? focusStyle : {}) }}
                  />
                </div>

                {/* Color picker - span 6 */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={labelStyle}>🎨 Event Color</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {eventColors.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.name}
                        onClick={() => setForm({ ...form, color: c.value })}
                        style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: c.value,
                          border: form.color === c.value ? '3px solid #1a1a2e' : '3px solid transparent',
                          cursor: 'pointer',
                          boxShadow: form.color === c.value ? `0 0 0 3px ${c.value}35, 0 4px 10px rgba(0,0,0,0.15)` : '0 2px 6px rgba(0,0,0,0.1)',
                          transition: 'all 0.18s', transform: form.color === c.value ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Toggles - span 6 */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={labelStyle}>Settings</label>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{
                        position: 'relative', width: 40, height: 22, borderRadius: 999,
                        background: form.isActive ? 'linear-gradient(135deg, #10b981, #059669)' : '#cbd5e1',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{
                          position: 'absolute', top: 2, left: form.isActive ? 20 : 2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'all 0.2s',
                        }} />
                      </span>
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ display: 'none' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Active</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{
                        position: 'relative', width: 40, height: 22, borderRadius: 999,
                        background: form.isPublic ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#cbd5e1',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{
                          position: 'absolute', top: 2, left: form.isPublic ? 20 : 2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'all 0.2s',
                        }} />
                      </span>
                      <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} style={{ display: 'none' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Public on Home page</span>
                    </label>
                  </div>
                </div>

                {/* Description - span 12 */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a brief description of the event — who should attend, what will be covered, any prerequisites..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    onFocus={() => setFocusField('desc')}
                    onBlur={() => setFocusField(null)}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 100, ...(focusField === 'desc' ? focusStyle : {}) }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 14,
              padding: '16px 30px 22px',
              background: '#f8fafc',
              borderTop: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 500 }}>
                <span style={{ color: '#ef4444' }}>*</span> Required fields
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowModal(false)} disabled={saving} style={{
                  padding: '11px 22px', borderRadius: 999,
                  background: 'white', color: '#374151',
                  border: '1.5px solid #e5e7eb',
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif', opacity: saving ? 0.6 : 1,
                }}>Cancel</button>
                <button onClick={handleSubmit} disabled={saving} style={{
                  padding: '11px 28px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #1a1a2e, #2d1b69, #4c1d95)',
                  color: 'white', border: 'none',
                  fontWeight: 700, fontSize: '0.88rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 8px 22px rgba(26,26,46,0.28)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  opacity: saving ? 0.8 : 1,
                  transition: 'transform 0.18s',
                }}
                onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {saving ? <Spinner animation="border" size="sm" /> : null}
                  {editingId ? '💾 Save Changes' : '✨ Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: '0.74rem', fontWeight: 700,
  color: '#475569', marginBottom: 6, letterSpacing: 0.3,
  textTransform: 'uppercase',
};

export default Events;
