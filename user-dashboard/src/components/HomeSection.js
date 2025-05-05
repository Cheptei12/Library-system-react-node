import React from "react";
import { Card, Button, Alert } from "react-bootstrap";

const HomeSection = ({ onSectionChange, announcements = [], recentBooks = [] }) => {
  return (
    <div className="container">
      <h2 className="text-primary mb-4 fw-bold">Welcome to Your Library Dashboard</h2>

      {/* Navigation Cards */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div className="card border-primary h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Search Books</h5>
              <Button variant="primary" className="mt-3" onClick={() => onSectionChange("search")}>
                Go
              </Button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-success h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">My Borrowed Books</h5>
              <Button variant="success" className="mt-3" onClick={() => onSectionChange("borrowed")}>
                View
              </Button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-info h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Profile</h5>
              <Button variant="info" className="mt-3" onClick={() => onSectionChange("profile")}>
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Borrowed Books */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h4 className="mb-0">Recently Borrowed Books</h4>
        </Card.Header>
        <Card.Body>
          {recentBooks.length === 0 ? (
            <p className="text-muted">No recent borrowed books.</p>
          ) : (
            <ul className="list-group">
              {recentBooks.map((book, index) => (
                <li key={index} className="list-group-item">
                  <strong>{book.title}</strong> by {book.author}
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      {/* Announcements */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Library Announcements</h4>
        </Card.Header>
        <Card.Body>
          {announcements.length === 0 ? (
            <p className="text-muted">No announcements at the moment.</p>
          ) : (
            announcements.slice(0, 3).map((ann) => ( // Show latest 3
              <Alert key={ann.id} variant="info" className="shadow-sm mb-3">
                <p>{ann.text}</p>
                <small>Published on: {new Date(ann.date).toLocaleDateString()}</small>
              </Alert>
            ))
          )}
          {announcements.length > 3 && (
            <Button variant="link" onClick={() => onSectionChange("notifications")}>
              View All Announcements
            </Button>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default HomeSection;