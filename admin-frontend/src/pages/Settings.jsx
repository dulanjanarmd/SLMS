import React, { useState } from 'react';

const Settings = () => {
  const [studentLoanDays, setStudentLoanDays] = useState(14);
  const [facultyLoanDays, setFacultyLoanDays] = useState(30);
  const [studentMaxLoans, setStudentMaxLoans] = useState(3);
  const [facultyMaxLoans, setFacultyMaxLoans] = useState(10);
  const [fineRatePerDay, setFineRatePerDay] = useState(5.0);
  const [gracePeriodDays, setGracePeriodDays] = useState(2);
  const [reservationExpiryDays, setReservationExpiryDays] = useState(3);
  const [autoEmailReminders, setAutoEmailReminders] = useState(true);
  const [libraryEmail, setLibraryEmail] = useState('library@sliit.lk');
  const [libraryPhone, setLibraryPhone] = useState('+94 11 754 4801');
  const [operatingHours, setOperatingHours] = useState('Mon - Fri: 8:00 AM - 7:00 PM | Sat: 9:00 AM - 4:00 PM');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg('Library system settings updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0',
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
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8, color: 'white' }}>Library System Settings</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem', color: 'white' }}>Configure borrowing policies, fine calculation rules, and library metadata</p>
        </div>
      </div>

      {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{successMsg}</div>}

      <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 24 }}>
        {/* Section 1: Loan & Borrowing Rules */}
        <div style={{ background: 'white', borderRadius: 18, padding: 26, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Borrowing & Loan Duration Policies</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Student Loan Period (Days)</label>
              <input type="number" value={studentLoanDays} onChange={e => setStudentLoanDays(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Faculty Loan Period (Days)</label>
              <input type="number" value={facultyLoanDays} onChange={e => setFacultyLoanDays(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Student Active Loan Cap</label>
              <input type="number" value={studentMaxLoans} onChange={e => setStudentMaxLoans(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Faculty Active Loan Cap</label>
              <input type="number" value={facultyMaxLoans} onChange={e => setFacultyMaxLoans(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section 2: Fine & Financial Rules */}
        <div style={{ background: 'white', borderRadius: 18, padding: 26, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Fine & Penalty Calculations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Daily Overdue Rate (Rs. / day)</label>
              <input type="number" step="0.5" value={fineRatePerDay} onChange={e => setFineRatePerDay(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Grace Period (Days)</label>
              <input type="number" value={gracePeriodDays} onChange={e => setGracePeriodDays(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Reservation Expiry (Days)</label>
              <input type="number" value={reservationExpiryDays} onChange={e => setReservationExpiryDays(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section 3: General Information */}
        <div style={{ background: 'white', borderRadius: 18, padding: 26, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Contact & Operational Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Library Support Email</label>
              <input value={libraryEmail} onChange={e => setLibraryEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Library Hotline Phone</label>
              <input value={libraryPhone} onChange={e => setLibraryPhone(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Operating Hours Schedule</label>
              <input value={operatingHours} onChange={e => setOperatingHours(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '12px 28px', borderRadius: 10, background: '#ef5a24', color: 'white',
              border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
