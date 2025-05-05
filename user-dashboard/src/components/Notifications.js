import React from "react";
import { Alert, Spinner } from "react-bootstrap";

const Notifications = ({ announcements, loading, error }) => {
  return (
    <div>
      <h2 className="mb-4 text-primary fw-bold">Notifications</h2>

      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <h5>Library Announcements</h5>
      {announcements.length === 0 ? (
        <p className="text-muted">No announcements at this time.</p>
      ) : (
        announcements.map((ann) => (
          <Alert key={ann.id} variant="info" className="shadow-sm">
            <p>{ann.text}</p>
            <small>Published on: {new Date(ann.date).toLocaleDateString()}</small>
          </Alert>
        ))
      )}
    </div>
  );
};

export default Notifications;