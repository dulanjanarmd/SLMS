import React, { useState, useEffect } from 'react';
import { contactInfoAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const ContactInfoManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  const [form, setForm] = useState({
    type: 'EMAIL',
    label: '',
    value: '',
    description: '',
    isActive: true,
    displayOrder: 0,
  });

  const contactTypes = ['EMAIL', 'PHONE', 'ADDRESS', 'SOCIAL', 'OTHER'];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await contactInfoAPI.getAll();
      setContacts(res.data || []);
    } catch (err) {
      console.error('Failed to load contact info:', err);
      setFlash({ type: 'error', message: 'Failed to load contact information' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await contactInfoAPI.update(editingId, form);
        setFlash({ type: 'success', message: 'Contact information updated successfully' });
      } else {
        await contactInfoAPI.create(form);
        setFlash({ type: 'success', message: 'Contact information created successfully' });
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ type: 'EMAIL', label: '', value: '', description: '', isActive: true, displayOrder: 0 });
      loadContacts();
    } catch (err) {
      console.error('Failed to save contact info:', err);
      setFlash({ type: 'error', message: 'Failed to save contact information' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact) => {
    setForm({
      type: contact.type,
      label: contact.label,
      value: contact.value,
      description: contact.description || '',
      isActive: contact.isActive,
      displayOrder: contact.displayOrder || 0,
    });
    setEditingId(contact.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact information?')) return;
    try {
      await contactInfoAPI.delete(id);
      setFlash({ type: 'success', message: 'Contact information deleted successfully' });
      loadContacts();
    } catch (err) {
      console.error('Failed to delete contact info:', err);
      setFlash({ type: 'error', message: 'Failed to delete contact information' });
    }
  };

  const handleToggleActive = async (contact) => {
    try {
      await contactInfoAPI.update(contact.id, { ...contact, isActive: !contact.isActive });
      setFlash({ type: 'success', message: 'Contact status updated successfully' });
      loadContacts();
    } catch (err) {
      console.error('Failed to toggle contact status:', err);
      setFlash({ type: 'error', message: 'Failed to update contact status' });
    }
  };

  const getIconForType = (type) => {
    const icons = {
      'EMAIL': '📧',
      'PHONE': '📞',
      'ADDRESS': '📍',
      'SOCIAL': '🌐',
      'OTHER': 'ℹ️',
    };
    return icons[type] || 'ℹ️';
  };

  const sortedContacts = [...contacts].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, marginBottom: 8 }}>Contact & Help Management</h1>
            <p style={{ margin: 0, opacity: 0.78, fontSize: '0.95rem', maxWidth: 600 }}>
              Manage contact information, help desk details, and social media links
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setForm({ type: 'EMAIL', label: '', value: '', description: '', isActive: true, displayOrder: 0 }); }}
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
            + Add Contact
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

      {/* Contact List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spinner animation="border" style={{ color: '#ef5a24' }} />
          <div style={{ marginTop: 16, color: '#64748b', fontSize: '0.9rem' }}>Loading contact information...</div>
        </div>
      ) : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📞</div>
          <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>No contact information configured</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Add contact details for library users to reach out</p>
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setForm({ type: 'EMAIL', label: '', value: '', description: '', isActive: true, displayOrder: 0 }); }}
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
            Add First Contact
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {sortedContacts.map((contact) => (
            <div
              key={contact.id}
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
                opacity: contact.isActive ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}>
                  {getIconForType(contact.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                      {contact.label || contact.type}
                    </h3>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: contact.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                      color: contact.isActive ? '#059669' : '#64748b',
                    }}>
                      {contact.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 600, marginBottom: 4 }}>
                    {contact.value}
                  </div>
                  {contact.description && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{contact.description}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleToggleActive(contact)}
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
                  {contact.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleEdit(contact)}
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
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
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
              </div>
            </div>
          ))}
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
                {editingId ? 'Edit Contact Information' : 'Add Contact Information'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 30px' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {contactTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g., Main Email, Helpdesk, Facebook"
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
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Value</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="e.g., library@university.edu, +94 11 234 5678"
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
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Additional details about this contact..."
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: '100%' }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Visible to users</span>
                  </label>
                </div>
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

export default ContactInfoManagement;
