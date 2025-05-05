// src/components/SearchPatron.js
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Button, Card, ListGroup, ToggleButton, ToggleButtonGroup } from "react-bootstrap";

const SearchPatron = () => {
  const [query, setQuery] = useState("");
  const [patrons, setPatrons] = useState(null); // Store both students and staff
  const [error, setError] = useState("");
  const [isStudentSearch, setIsStudentSearch] = useState(true); // Toggle between students and staff

  const handleSearch = async () => {
    setError(""); // Clear previous errors

    if (!query.trim()) {
      setPatrons(null); // Don't fetch if the input is empty
      return;
    }

    try {
      const endpoint = isStudentSearch
        ? `http://localhost:5000/api/students/search?query=${query}`
        : `http://localhost:5000/api/staff/search?query=${query}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPatrons(data); // Store array of results
      } else {
        setPatrons([]); // Empty array if no valid data
      }
    } catch (error) {
      setError("Error fetching patrons. Please try again.");
      setPatrons([]); // Prevent crash
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Header */}
          <h2 className="text-center mb-4 text-primary fw-bold">Search Patrons</h2>

          {/* Search Type Toggle */}
          <ToggleButtonGroup
            type="radio"
            name="searchType"
            value={isStudentSearch ? "students" : "staff"}
            onChange={(val) => setIsStudentSearch(val === "students")}
            className="mb-4 d-flex justify-content-center"
          >
            <ToggleButton
              id="tbg-radio-1"
              value="students"
              variant={isStudentSearch ? "primary" : "outline-primary"}
            >
              Students
            </ToggleButton>
            <ToggleButton
              id="tbg-radio-2"
              value="staff"
              variant={!isStudentSearch ? "primary" : "outline-primary"}
            >
              Staff
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Search Form */}
          <Form className="d-flex mb-4">
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search by name, ${isStudentSearch ? "reg number" : "employee number"}, or email`}
              className="me-2 shadow-sm"
            />
            <Button variant="primary" onClick={handleSearch} className="shadow-sm">
              Search
            </Button>
          </Form>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {/* Results Card */}
          <Card className="shadow-sm">
            <Card.Body>
              {patrons === null ? (
                <p className="text-muted text-center">Enter a query to search for patrons</p>
              ) : patrons.length > 0 ? (
                <ListGroup variant="flush">
                  {patrons.map((patron) => (
                    <ListGroup.Item key={patron.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{patron.name}</strong> - {patron.email}
                        <br />
                        <small className="text-muted">
                          {isStudentSearch
                            ? `Reg. No: ${patron.reg_number}`
                            : `Employee No: ${patron.employee_number}`}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted text-center">No patrons found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPatron;