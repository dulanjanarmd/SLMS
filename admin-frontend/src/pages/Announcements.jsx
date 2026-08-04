import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Announcements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [urgency, setUrgency] = useState('INFO');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAnnouncements = () => {
    notificationAPI.getPublicAnnouncements().then(res => {
      setHistory((res.data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        role: 'ALL',
        sentAt: n.sentAt ? new Date(n.sentAt).toLocaleString() : 'Recent',
      })));
    }).catch(err => console.error('Failed to load history', err));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both title and message body.');
      return;
    }
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await notificationAPI.sendBroadcast(title, message, targetRole || null);
      const recipientCount = res.data?.recipientCount || 0;
      setSuccessMsg(`Broadcast sent successfully to ${recipientCount} user(s).`);
      setTitle(''); setMessage(''); setTargetRole('');
      fetchAnnouncements();
    } catch (err) {
      setErrorMsg('Failed to send broadcast announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all announcements?')) return;
    try {
      await notificationAPI.clearAnnouncements();
      setHistory([]);
      setSuccessMsg('All announcements cleared.');
    } catch {
      setErrorMsg('Failed to clear announcements.');
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await notificationAPI.deleteAnnouncement(id);
      setSuccessMsg('Announcement deleted successfully.');
      fetchAnnouncements();
    } catch {
      setErrorMsg('Failed to delete announcement.');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditMessage(item.message);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editMessage.trim()) return;
    setUpdating(true);
    try {
      await notificationAPI.updateAnnouncement(editingItem.id, editTitle, editMessage);
      setSuccessMsg('Announcement updated successfully.');
      setEditingItem(null);
      fetchAnnouncements();
    } catch {
      setErrorMsg('Failed to update announcement.');
    } finally {
      setUpdating(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0',
    fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#f8fafc',
  };

  return (
    <div style={{ padding: '100px 20px 24px 20px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Broadcast & System Announcements</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Dispatch, edit, or delete global notifications for library members, students, and faculty</p>
        </div>
      </div>

      {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{successMsg}</div>}
      {errorMsg && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{errorMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        {/* Compose Form */}
        <div style={{ background: 'white', borderRadius: 18, padding: 26, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Compose Broadcast Message</h3>
          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Announcement Title *</label>
              <input placeholder="e.g. System Maintenance Scheduled" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Recipient Group</label>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">All Users (Students & Staff)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Members Only</option>
                  <option value="LIBRARIAN">Librarians Only</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Priority Level</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="INFO">Informational</option>
                  <option value="WARNING">Important Reminder</option>
                  <option value="URGENT">Urgent Announcement</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Message Content *</label>
              <textarea rows={4} placeholder="Type announcement details..." value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px', borderRadius: 10, background: '#ef5a24', color: 'white',
                border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif', marginTop: 6, transition: 'all 0.15s'
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Send Broadcast Announcement'}
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div style={{ background: 'white', borderRadius: 18, padding: 26, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Broadcast History</h3>
            {history.length > 0 && (
              <button onClick={handleClearAll} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                Clear All
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '30px 0' }}>No announcements dispatched yet.</div>
            ) : (
              history.map(item => (
                <div key={item.id} style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a1a2e' }}>{item.title}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.role}
                      </span>
                      <button onClick={() => openEditModal(item)} style={{ border: 'none', background: '#e0f2fe', color: '#0284c7', borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteOne(item.id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, marginBottom: 8, lineHeight: 1.4 }}>{item.message}</p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sent: {item.sentAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, maxWidth: 500, width: '100%', padding: 28, fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1a1a2e' }}>Edit Announcement</h3>
              <button onClick={() => setEditingItem(null)} style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Title *</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Message *</label>
                <textarea rows={4} value={editMessage} onChange={e => setEditMessage(e.target.value)} required style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={updating} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#ef5a24', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: updating ? 'not-allowed' : 'pointer' }}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
