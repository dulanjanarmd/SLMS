import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const categories = ['ALL', 'Workshop', 'Seminar', 'Author Talk', 'Study Camp', 'Training', 'Holiday', 'Closure', 'Meeting', 'Exhibition', 'Other'];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAllPublic();
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return { day: '??', month: '???' };
    try {
      const date = new Date(dateStr);
      return {
        day: String(date.getDate()).padStart(2, '0'),
        month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        full: date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      };
    } catch {
      return { day: '??', month: '???' };
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = ((hour + 11) % 12) + 1;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const isPastEvent = (dateStr) => {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter(e => !isPastEvent(e.eventDate));
  const pastEvents = filteredEvents.filter(e => isPastEvent(e.eventDate));

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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, marginBottom: 8 }}>Library Events</h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: '0.95rem', maxWidth: 600 }}>
            Stay updated with workshops, author talks, study sessions, and other library activities.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '20px 24px',
        border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
        marginBottom: 28,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto auto',
          gap: 16, alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: '1.5px solid #e5e7eb',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, sans-serif',
              outline: 'none',
              width: '100%',
            }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1.5px solid',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  background: selectedCategory === cat ? '#1a1a2e' : 'white',
                  borderColor: selectedCategory === cat ? '#1a1a2e' : '#e5e7eb',
                  color: selectedCategory === cat ? 'white' : '#374151',
                  transition: 'all 0.18s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1.5px solid',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                background: viewMode === 'list' ? '#ef5a24' : 'white',
                borderColor: viewMode === 'list' ? '#ef5a24' : '#e5e7eb',
                color: viewMode === 'list' ? 'white' : '#374151',
                transition: 'all 0.18s',
              }}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1.5px solid',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                background: viewMode === 'calendar' ? '#ef5a24' : 'white',
                borderColor: viewMode === 'calendar' ? '#ef5a24' : '#e5e7eb',
                color: viewMode === 'calendar' ? 'white' : '#374151',
                transition: 'all 0.18s',
              }}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spinner animation="border" style={{ color: '#ef5a24' }} />
          <div style={{ marginTop: 16, color: '#64748b', fontSize: '0.9rem' }}>Loading events...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
          <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>No events found</h2>
          <p style={{ color: '#64748b', marginBottom: 0 }}>
            {searchTerm || selectedCategory !== 'ALL' 
              ? 'Try adjusting your search or filters.' 
              : 'There are no events scheduled at this time.'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <>
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 20 }}>Upcoming Events</h2>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {upcomingEvents.map(event => {
                      const fd = formatDate(event.eventDate);
                      return (
                        <Link key={event.id} to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                          <div
                            style={{
                              background: 'white',
                              borderRadius: 20,
                              border: '1px solid #e8ecf0',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
                              overflow: 'hidden',
                              display: 'flex',
                              transition: 'all 0.22s',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = '';
                              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.05)';
                            }}
                          >
                          {/* Date Card */}
                          <div style={{
                            width: 100,
                            background: `linear-gradient(180deg, ${event.color || '#ef5a24'}, ${event.color || '#ef5a24'}cc)`,
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px 0',
                            flexShrink: 0,
                          }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{fd.day}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>{fd.month}</div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: '24px', flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>
                                  {event.title}
                                </h3>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: `linear-gradient(135deg, ${event.color || '#ef5a24'}12, ${event.color || '#ef5a24'}08)`,
                                    color: event.color || '#ef5a24',
                                    padding: '4px 12px',
                                    borderRadius: 999,
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: 0.3,
                                  }}>
                                    {event.category || 'General'}
                                  </span>
                                  {event.maxAttendees && (
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                                      Max: {event.maxAttendees} attendees
                                    </span>
                                  )}
                                </div>
                              </div>
                              {event.banner && (
                                <div style={{ fontSize: '2.5rem' }}>{event.banner}</div>
                              )}
                            </div>

                            {event.description && (
                              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                                {event.description}
                              </p>
                            )}

                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.85rem', color: '#374151' }}>
                              {event.startTime && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: '#ef5a24' }}>🕒</span>
                                  <span style={{ fontWeight: 600 }}>
                                    {formatTime(event.startTime)}
                                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                                  </span>
                                </div>
                              )}
                              {event.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: '#ef5a24' }}>📍</span>
                                  <span style={{ fontWeight: 600 }}>{event.location}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: '#64748b' }}>📅</span>
                                <span>{fd.full}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748b', marginBottom: 20 }}>Past Events</h2>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {pastEvents.map(event => {
                      const fd = formatDate(event.eventDate);
                      return (
                        <div
                          key={event.id}
                          style={{
                            background: 'white',
                            borderRadius: 20,
                            border: '1px solid #e8ecf0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                            overflow: 'hidden',
                            display: 'flex',
                            opacity: 0.7,
                          }}
                        >
                          {/* Date Card */}
                          <div style={{
                            width: 100,
                            background: '#94a3b8',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px 0',
                            flexShrink: 0,
                          }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{fd.day}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>{fd.month}</div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: '24px', flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b', margin: 0 }}>
                                {event.title}
                              </h3>
                              <span style={{
                                background: 'rgba(148,163,184,0.15)',
                                color: '#64748b',
                                padding: '2px 8px',
                                borderRadius: 999,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}>
                                PAST
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                              {event.location && <span>{event.location}</span>}
                              {event.startTime && <span> · {formatTime(event.startTime)}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Calendar View */
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e8ecf0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              padding: '32px',
            }}>
              <CalendarView events={filteredEvents} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CalendarView = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, events: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.eventDate === dateStr);
      days.push({ day: d, events: dayEvents });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: '1.5px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          ← Previous
        </button>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{monthName}</h3>
        <button
          onClick={() => navigateMonth(1)}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: '1.5px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Next →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', padding: '8px 0' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((day, idx) => (
          <div
            key={idx}
            style={{
              minHeight: 100,
              background: day.day ? 'white' : 'transparent',
              border: day.day ? '1px solid #e8ecf0' : 'none',
              borderRadius: 12,
              padding: day.day ? '8px' : 0,
              position: 'relative',
            }}
          >
            {day.day && (
              <>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {day.day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {day.events.slice(0, 3).map(event => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      style={{
                        display: 'block',
                        padding: '4px 6px',
                        borderRadius: 6,
                        background: `${event.color || '#ef5a24'}15`,
                        color: event.color || '#ef5a24',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${event.color || '#ef5a24'}25`}
                      onMouseLeave={e => e.currentTarget.style.background = `${event.color || '#ef5a24'}15`}
                    >
                      {event.title}
                    </Link>
                  ))}
                  {day.events.length > 3 && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
