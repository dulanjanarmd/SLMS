import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <h1 className="display-4 fw-bold mt-4">404</h1>
      <h3 className="text-muted mb-4">Page Not Found</h3>
      <p className="text-muted mb-4">
        The admin page you are looking for does not exist or has been moved.
      </p>
      <Button as={Link} to="/dashboard" variant="primary">
        Go to Dashboard
      </Button>
    </Container>
  );
};

export default NotFound;
