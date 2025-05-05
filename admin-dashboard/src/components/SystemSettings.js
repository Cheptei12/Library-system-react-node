import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

const SystemSettings = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [announcementError, setAnnouncementError] = useState("");
  const [fineRate, setFineRate] = useState(0.5);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch initial settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const [announcementsRes, fineRes, securityRes] = await Promise.all([
          axios.get("http://localhost:5000/api/settings/announcements"),
          axios.get("http://localhost:5000/api/settings/fine-rate"),
          axios.get("http://localhost:5000/api/settings/security"),
        ]);
        setAnnouncements(announcementsRes.data);
        setFineRate(fineRes.data.fineRate || 0.5);
        setTwoFactorEnabled(securityRes.data.twoFactorEnabled || false);
      } catch (err) {
        setError("Failed to load settings: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle adding a new announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementError("");
    setError("");
    setSuccess("");

    if (!newAnnouncement.trim()) {
      setAnnouncementError("Announcement text cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/settings/announcements", {
        text: newAnnouncement,
      });
      setAnnouncements([...announcements, response.data]);
      setNewAnnouncement("");
      setSuccess("Announcement published successfully!");
    } catch (err) {
      setError("Failed to publish announcement: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle saving fine policy
  const handleSaveFinePolicy = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (fineRate < 0) {
      setError("Fine rate cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      await axios.put("http://localhost:5000/api/settings/fine-rate", { fineRate });
      setSuccess(`Fine rate saved: $${fineRate.toFixed(2)} per day`);
    } catch (err) {
      setError("Failed to save fine policy: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle updating security settings
  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    try {
      await axios.put("http://localhost:5000/api/settings/security", { twoFactorEnabled });
      setSuccess(`Two-Factor Authentication ${twoFactorEnabled ? "enabled" : "disabled"}`);
    } catch (err) {
      setError("Failed to update security settings: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-primary fw-bold">System Settings</h2>

      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      {/* Announcements & Policies */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Announcements & Policies</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddAnnouncement} className="mb-4">
            <Form.Group controlId="announcementText">
              <Form.Label>Add New Announcement or Policy</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Enter announcement or policy text here..."
                className="border-primary"
                disabled={loading}
              />
            </Form.Group>
            {announcementError && (
              <Alert variant="danger" onClose={() => setAnnouncementError("")} dismissible>
                {announcementError}
              </Alert>
            )}
            <Button variant="primary" type="submit" className="mt-2" disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </Form>

          <h5>Published Announcements</h5>
          {announcements.length === 0 ? (
            <p className="text-muted">No announcements yet.</p>
          ) : (
            announcements.map((ann) => (
              <Alert key={ann.id} variant="info" className="shadow-sm">
                <p>{ann.text}</p>
                <small>Published on: {new Date(ann.date).toLocaleDateString()}</small>
              </Alert>
            ))
          )}
        </Card.Body>
      </Card>

      {/* Fine Policy */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Fine Policy</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSaveFinePolicy}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fine Rate (per day)</Form.Label>
                  <Form.Control
                    type="number"
                    value={fineRate}
                    onChange={(e) => setFineRate(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="border-primary"
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Policy"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Security Settings</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleUpdateSecurity}>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="two-factor-switch"
                label="Enable Two-Factor Authentication"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                disabled={loading}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Security"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemSettings;