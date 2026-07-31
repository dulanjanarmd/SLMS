import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getById(id);
      setEvent(res.data);
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isPastEvent = (dateStr) => {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'Poppins, sans-serif' }}>
        <Spinner animation="border" style={{ color: '#ef5a24' }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>📭</div>
        <h2 style={{ color: '#1a1a2e', marginBottom: 10 }}>Event Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events" style={{ color: '#ef5a24', textDecoration: 'none', fontWeight: 600 }}>
          View All Events →
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const day = String(eventDate.getDate()).padStart(2, '0');
  const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const past = isPastEvent(event.eventDate);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      {/* Back Button */}
      <Link to="/events" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        color: '#64748b', textDecoration: 'none',
        fontWeight: 600, fontSize: '0.9rem',
        marginBottom: 24,
        transition: 'color 0.18s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ef5a24'}
      onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        ← Back to Events
      </Link>

      {/* Event Header */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        border: '1px solid #e8ecf0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {/* Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${event.color || '#ef5a24'}, ${event.color || '#ef5a24'}cc)`,
          padding: '40px 34px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
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
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              {past && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginBottom: 12,
                  display: 'inline-block',
                }}>
                  PAST EVENT
                </span>
              )}
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
                {event.title}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', opacity: 0.9 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {event.category || 'General'}
                </span>
                {event.maxAttendees && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    Max: {event.maxAttendees} attendees
                  </span>
                )}
              </div>
            </div>
            {event.banner && (
              <div style={{ fontSize: '4rem', flexShrink: 0 }}>{event.banner}</div>
            )}
          </div>
        </div>

        {/* Date & Time Card */}
        <div style={{ padding: '32px 34px' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            {/* Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px 24px',
              background: 'rgba(239,90,36,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(239,90,36,0.1)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: `linear-gradient(180deg, ${event.color || '#ef5a24'}, ${event.color || '#ef5a24'}cc)`,
                color: 'white',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${(event.color || '#ef5a24')}40`,
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{day}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>{month}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Date</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>{formatDate(event.eventDate)}</div>
              </div>
            </div>

            {/* Time */}
            {event.startTime && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
                background: 'rgba(99,102,241,0.05)',
                borderRadius: 16,
                border: '1px solid rgba(99,102,241,0.1)',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}>🕒</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Time</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
                background: 'rgba(16,185,129,0.05)',
                borderRadius: 16,
                border: '1px solid rgba(16,185,129,0.1)',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                }}>📍</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>{event.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>About This Event</h3>
              <div style={{
                fontSize: '0.95rem',
                color: '#475569',
                lineHeight: 1.7,
                background: '#f8fafc',
                padding: '20px 24px',
                borderRadius: 16,
                border: '1px solid #e8ecf0',
              }}>
                {event.description}
              </div>
            </div>
          )}

          {/* Librarian Actions */}
          {isLibrarian && (
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.03))',
              borderRadius: 16,
              border: '1px solid rgba(99,102,241,0.1)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Librarian Actions</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/librarian/events`)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 4px 12px rgba(26,26,46,0.2)',
                  }}
                >
                  Manage All Events
                </button>
                <button
                  onClick={() => navigate(`/librarian/events`)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: 'white',
                    color: '#1a1a2e',
                    border: '1.5px solid #e5e7eb',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Edit This Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        border: '1px solid #e8ecf0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        padding: '32px 34px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Event Calendar</h2>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              background: showCalendar ? '#ef5a24' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: showCalendar ? '0 4px 12px rgba(239,90,36,0.3)' : '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>

        {showCalendar && (
          <div style={{
            background: '#f8fafc',
            borderRadius: 16,
            padding: '24px',
            border: '1px solid #e8ecf0',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
                {eventDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Event highlighted in {event.color || 'orange'}
              </div>
            </div>
            
            {/* Simple Calendar Grid */}
            <div style={{ maxWidth: 400, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', padding: '8px 0' }}>
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {(() => {
                  const firstDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
                  const lastDay = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0);
                  const startPadding = firstDay.getDay();
                  const days = [];
                  
                  for (let i = 0; i < startPadding; i++) {
                    days.push(<div key={`pad-${i}`} style={{ padding: '12px 0' }}></div>);
                  }
                  
                  for (let d = 1; d <= lastDay.getDate(); d++) {
                    const isEventDay = d === eventDate.getDate();
                    days.push(
                      <div
                        key={d}
                        style={{
                          padding: '12px 0',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontWeight: isEventDay ? 700 : 500,
                          borderRadius: 8,
                          background: isEventDay ? event.color || '#ef5a24' : 'transparent',
                          color: isEventDay ? 'white' : '#374151',
                          cursor: isEventDay ? 'pointer' : 'default',
                        }}
                      >
                        {d}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
