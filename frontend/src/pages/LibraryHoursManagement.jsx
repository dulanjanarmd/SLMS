import React, { useState, useEffect } from 'react';
import { libraryHoursAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const LibraryHoursManagement = () => {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY',
    openTime: '07:30',
    closeTime: '20:30',
    isOpen: true,
    notes: '',
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    setLoading(true);
    try {
      const res = await libraryHoursAPI.getAll();
      setHours(res.data || []);
    } catch (err) {
      console.error('Failed to load library hours:', err);
      setFlash({ type: 'error', message: 'Failed to load library hours' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await libraryHoursAPI.update(editingId, form);
        setFlash({ type: 'success', message: 'Library hours updated successfully' });
      } else {
        await libraryHoursAPI.create(form);
        setFlash({ type: 'success', message: 'Library hours created successfully' });
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ dayOfWeek: 'MONDAY', openTime: '07:30', closeTime: '20:30', isOpen: true, notes: '' });
      loadHours();
    } catch (err) {
      console.error('Failed to save library hours:', err);
      setFlash({ type: 'error', message: 'Failed to save library hours' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hour) => {
    setForm({
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isOpen: hour.isOpen,
      notes: hour.notes || '',
    });
    setEditingId(hour.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete these library hours?')) return;
    try {
      await libraryHoursAPI.delete(id);
      setFlash({ type: 'success', message: 'Library hours deleted successfully' });
      loadHours();
    } catch (err) {
      console.error('Failed to delete library hours:', err);
      setFlash({ type: 'error', message: 'Failed to delete library hours' });
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #4c1d95 70%, #ef5a24 100%)',
        borderRadius: 24, padding: '40px 34px', color: 'white',
        marginBottom: 32, position: 'relative', overflow: 'hidden',
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
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, marginBottom: 8 }}>Library Hours Management</h1>
            <p style={{ margin: 0, opacity: 0.78, fontSize: '0.95rem', maxWidth: 600 }}>
              Manage library operating hours for each day of the week
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setForm({ dayOfWeek: 'MONDAY', openTime: '07:30', closeTime: '20:30', isOpen: true, notes: '' }); }}
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              background: 'white',
              color: '#1a1a2e',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 8px 22px rgba(0,0,0,0.2)',
            }}
          >
            + Add Hours
          </button>
        </div>
      </div>

      {/* Flash Message */}
      {flash && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          marginBottom: 24,
          background: flash.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${flash.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: flash.type === 'success' ? '#059669' : '#dc2626',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          {flash.message}
        </div>
      )}

      {/* Hours List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spinner animation="border" style={{ color: '#ef5a24' }} />
          <div style={{ marginTop: 16, color: '#64748b', fontSize: '0.9rem' }}>Loading library hours...</div>
        </div>
      ) : hours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🕒</div>
          <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>No library hours configured</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Add library operating hours for each day of the week</p>
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setForm({ dayOfWeek: 'MONDAY', openTime: '07:30', closeTime: '20:30', isOpen: true, notes: '' }); }}
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Add First Hours Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {daysOfWeek.map(day => {
            const dayHours = hours.find(h => h.dayOfWeek === day);
            return (
              <div
                key={day}
                style={{
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid #e8ecf0',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 8 }}>
                    {day}
                  </h3>
                  {dayHours ? (
                    <>
                      <div style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 600, marginBottom: 4 }}>
                        {dayHours.isOpen ? (
                          <span style={{ color: '#10b981' }}>Open: {formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Closed</span>
                        )}
                      </div>
                      {dayHours.notes && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{dayHours.notes}</div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>Not configured</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => dayHours ? handleEdit(dayHours) : () => { setShowModal(true); setEditingId(null); setForm({ dayOfWeek: day, openTime: '07:30', closeTime: '20:30', isOpen: true, notes: '' }); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: '1.5px solid #e5e7eb',
                      background: 'white',
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {dayHours ? 'Edit' : 'Add'}
                  </button>
                  {dayHours && (
                    <button
                      onClick={() => handleDelete(dayHours.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: '1.5px solid #fee2e2',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
                {editingId ? 'Edit Library Hours' : 'Add Library Hours'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 30px' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Day of Week</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Open Time</label>
                  <input
                    type="time"
                    value={form.openTime}
                    onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Close Time</label>
                  <input
                    type="time"
                    value={form.closeTime}
                    onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isOpen}
                    onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Library is open on this day</span>
                </label>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any special notes for this day..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontFamily: 'Poppins, sans-serif',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 999,
                    background: 'white',
                    color: '#374151',
                    border: '1.5px solid #e5e7eb',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryHoursManagement;
