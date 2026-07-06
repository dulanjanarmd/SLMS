import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { membershipAPI, configAPI } from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Rev.'];

const MembershipApplication = () => {
  const { user } = useAuth();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [memberTypes, setMemberTypes] = useState([]);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    nameWithInitials: '',
    address: '',
    contactNumber: '',
    whatsappNumber: '',
    memberEmail: user?.email || '',
    memberType: '',
    faculty: user?.faculty || '',
    programme: user?.programme || '',
    academicYear: '',
    reason: '',
  });

  useEffect(() => {
    Promise.all([
      membershipAPI.getMy().then(res => setExisting(res.data)).catch(() => setExisting(null)),
      configAPI.getFaculties().then(res => setFaculties(res.data)).catch(() => {}),
      configAPI.getMemberTypes().then(res => setMemberTypes(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await membershipAPI.apply(formData, photoFile);
      setExisting(res.data);
      setSuccess('Application submitted! The librarian will review it shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', EXPIRED: 'secondary' };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 className="fw-bold mb-4"><i className="bi bi-person-badge me-2"></i>Library Membership</h2>

      {existing ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Application Status</h5>
              <Badge bg={statusColor[existing.status] || 'secondary'} className="fs-6 px-3 py-2">
                {existing.status}
              </Badge>
            </div>

            {existing.photoPath && (
              <div className="text-center mb-3">
                <img
                  src={`${API_URL}/membership/photo/${existing.photoPath}`}
                  alt="Member"
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', border: '3px solid #dee2e6' }}
                />
              </div>
            )}

            {existing.status === 'APPROVED' && (
              <Alert variant="success">
                <i className="bi bi-check-circle me-2"></i>
                <strong>Member ID: {existing.membershipId}</strong>
                <br />
                <small>Expires: {existing.expiresAt ? new Date(existing.expiresAt).toLocaleDateString() : 'N/A'}</small>
              </Alert>
            )}
            {existing.status === 'REJECTED' && existing.adminComments && (
              <Alert variant="danger"><strong>Reason:</strong> {existing.adminComments}</Alert>
            )}
            {existing.status === 'PENDING' && (
              <Alert variant="info">Your application is under review. You will be notified once it is processed.</Alert>
            )}

            <div className="text-muted small">
              <Row>
                <Col sm={6}><div><strong>Name:</strong> {existing.title} {existing.nameWithInitials}</div></Col>
                <Col sm={6}><div><strong>Member Type:</strong> {existing.memberType}</div></Col>
                <Col sm={6}><div><strong>Email:</strong> {existing.memberEmail}</div></Col>
                <Col sm={6}><div><strong>Contact:</strong> {existing.contactNumber}</div></Col>
                {existing.whatsappNumber && <Col sm={6}><div><strong>WhatsApp:</strong> {existing.whatsappNumber}</div></Col>}
                <Col sm={12}><div><strong>Address:</strong> {existing.address}</div></Col>
                <Col sm={6}><div><strong>Faculty:</strong> {existing.faculty}</div></Col>
                <Col sm={6}><div><strong>Programme:</strong> {existing.programme}</div></Col>
                <Col sm={6}><div><strong>Academic Year:</strong> {existing.academicYear}</div></Col>
                <Col sm={6}><div><strong>Applied:</strong> {existing.appliedAt ? new Date(existing.appliedAt).toLocaleDateString() : 'N/A'}</div></Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <p className="text-muted mb-4">
              Fill in the form below to apply for library membership. Once approved, you will be able to
              reserve books, add to wishlist, and download eBooks.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Photo Upload */}
              <Form.Group className="mb-4 text-center">
                <div
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    width: 110, height: 110, borderRadius: '50%', margin: '0 auto',
                    border: '2px dashed #adb5bd', cursor: 'pointer', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f8f9fa',
                  }}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="text-muted text-center small"><i className="bi bi-camera fs-3 d-block"></i>Upload Photo</div>
                  }
                </div>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handlePhoto}
                />
                <Form.Text className="text-muted">Click to upload profile photo</Form.Text>
              </Form.Group>

              {/* Title + Name */}
              <Row className="mb-3">
                <Col sm={3}>
                  <Form.Group>
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Select name="title" value={formData.title} onChange={handleChange} required>
                      <option value="">Select</option>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={9}>
                  <Form.Group>
                    <Form.Label>Name with Initials <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="nameWithInitials"
                      placeholder="e.g. D.A.M. Perera"
                      value={formData.nameWithInitials}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Member Type */}
              <Form.Group className="mb-3">
                <Form.Label>Member Type <span className="text-danger">*</span></Form.Label>
                <Form.Select name="memberType" value={formData.memberType} onChange={handleChange} required>
                  <option value="">Select Member Type</option>
                  {memberTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </Form.Select>
              </Form.Group>

              {/* Address */}
              <Form.Group className="mb-3">
                <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Contact + WhatsApp */}
              <Row className="mb-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Contact Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      name="contactNumber"
                      placeholder="e.g. 0771234567"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>WhatsApp Number <span className="text-muted small">(optional)</span></Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-whatsapp text-success"></i></span>
                      <Form.Control
                        type="tel"
                        name="whatsappNumber"
                        placeholder="e.g. 0771234567"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="memberEmail"
                  placeholder="Enter your email"
                  value={formData.memberEmail}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Faculty + Programme */}
              <Row className="mb-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Faculty <span className="text-danger">*</span></Form.Label>
                    <Form.Select name="faculty" value={formData.faculty} onChange={handleChange} required>
                      <option value="">Select Faculty</option>
                      {faculties.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Programme <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="programme"
                      placeholder="e.g. BSc IT"
                      value={formData.programme}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Academic Year */}
              <Form.Group className="mb-3">
                <Form.Label>Academic Year <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="academicYear"
                  placeholder="e.g. 2024/2025"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Reason */}
              <Form.Group className="mb-4">
                <Form.Label>Reason for Membership <span className="text-muted small">(optional)</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="reason"
                  placeholder="Why do you need library membership?"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                {submitting ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-send me-2"></i>}
                Submit Application
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MembershipApplication;
