// src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const UserManagement = () => {
  const [librarians, setLibrarians] = useState([]);
  const [patrons, setPatrons] = useState([]); // Combined staff and students
  const [newLibrarian, setNewLibrarian] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_number: '',
    password: '',
    status: 'Active',
  });
  const [showLibrarianForm, setShowLibrarianForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [librarianSearch, setLibrarianSearch] = useState('');
  const [patronSearch, setPatronSearch] = useState('');

  // Fetch librarians and patrons (staff + students) from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [librariansRes, staffRes, studentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/librarians'),
          axios.get('http://localhost:5000/api/users/staff'),
          axios.get('http://localhost:5000/api/users/students'),
        ]);
        setLibrarians(librariansRes.data);
        // Combine staff and students into patrons with a type field
        const staffPatrons = staffRes.data.map(s => ({ ...s, type: 'Staff', status: s.status || 'Active' }));
        const studentPatrons = studentsRes.data.map(s => ({ ...s, type: 'Student', status: s.status || 'Active' }));
        setPatrons([...staffPatrons, ...studentPatrons]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle adding a new librarian
  const handleAddLibrarian = async (e) => {
    e.preventDefault();
    setError('');

    const { full_name, email, password } = newLibrarian;
    if (!full_name || !email || !password) {
      setError('Full name, email, and password are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/librarians', newLibrarian);
      setLibrarians([...librarians, response.data]);
      setNewLibrarian({
        full_name: '',
        email: '',
        phone: '',
        employee_number: '',
        password: '',
        status: 'Active',
      });
      setShowLibrarianForm(false);
    } catch (err) {
      console.error('Error adding librarian:', err);
      setError(err.response?.data?.message || 'Failed to add librarian. Please try again.');
    }
  };

  // Handle toggling librarian status
  const handleToggleLibrarianStatus = async (id) => {
    try {
      const librarian = librarians.find(lib => lib.id === id);
      const newStatus = librarian.status === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`http://localhost:5000/api/users/librarians/${id}`, { status: newStatus });
      setLibrarians(librarians.map(lib =>
        lib.id === id ? { ...lib, status: newStatus } : lib
      ));
    } catch (err) {
      console.error('Error updating librarian status:', err);
      setError('Failed to update librarian status.');
    }
  };

  // Handle toggling patron status
  const handleTogglePatronStatus = async (id, type) => {
    try {
      const patron = patrons.find(p => p.id === id && p.type === type);
      const newStatus = patron.status === 'Active' ? 'Blocked' : 'Active';
      const endpoint = type === 'Staff' ? 'staff' : 'students';
      await axios.put(`http://localhost:5000/api/users/${endpoint}/${id}`, { status: newStatus });
      setPatrons(patrons.map(p =>
        p.id === id && p.type === type ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Error updating patron status:', err);
      setError('Failed to update patron status.');
    }
  };

  // Filter librarians and patrons based on search input
  const filteredLibrarians = librarians.filter(lib =>
    lib.full_name.toLowerCase().includes(librarianSearch.toLowerCase()) ||
    lib.email.toLowerCase().includes(librarianSearch.toLowerCase())
  );

  const filteredPatrons = patrons.filter(patron =>
    patron.name.toLowerCase().includes(patronSearch.toLowerCase()) ||
    patron.email.toLowerCase().includes(patronSearch.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">User Management</h2>

      {loading && <p>Loading users...</p>}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Librarians Section */}
      <h4>Librarians</h4>
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>Search</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name or email"
              value={librarianSearch}
              onChange={(e) => setLibrarianSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="success" onClick={() => setShowLibrarianForm(!showLibrarianForm)}>
            {showLibrarianForm ? 'Cancel' : 'Add New Librarian'}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover className="mb-4" responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Employee Number</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {!loading && filteredLibrarians.length > 0 ? (
            filteredLibrarians.map(lib => (
              <tr key={lib.id}>
                <td>{lib.id}</td>
                <td>{lib.full_name}</td>
                <td>{lib.email}</td>
                <td>{lib.phone || 'N/A'}</td>
                <td>{lib.employee_number || 'N/A'}</td>
                <td>
                  <span className={`badge ${lib.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                    {lib.status}
                  </span>
                </td>
                <td>
                  <Button
                    variant={lib.status === 'Active' ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => handleToggleLibrarianStatus(lib.id)}
                  >
                    {lib.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                {loading ? 'Loading...' : 'No librarians found'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add New Librarian Form */}
      {showLibrarianForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Add New Librarian</Card.Title>
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}
            <Form onSubmit={handleAddLibrarian}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newLibrarian.full_name}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, full_name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={newLibrarian.email}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, email: e.target.value })}
                      placeholder="Enter email"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={newLibrarian.phone}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, phone: e.target.value })}
                      placeholder="Enter phone (optional)"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Employee Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={newLibrarian.employee_number}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, employee_number: e.target.value })}
                      placeholder="Enter employee number (optional)"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={newLibrarian.password}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={newLibrarian.status}
                      onChange={(e) => setNewLibrarian({ ...newLibrarian, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                Add Librarian
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Patrons Section */}
      <h4>Patrons (Staff & Students)</h4>
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>Search</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name or email"
              value={patronSearch}
              onChange={(e) => setPatronSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {!loading && filteredPatrons.length > 0 ? (
            filteredPatrons.map(patron => (
              <tr key={`${patron.type}-${patron.id}`}>
                <td>{patron.id}</td>
                <td>{patron.name}</td>
                <td>{patron.email}</td>
                <td>{patron.phone}</td>
                <td>{patron.type}</td>
                <td>
                  <span className={`badge ${patron.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                    {patron.status}
                  </span>
                </td>
                <td>
                  <Button
                    variant={patron.status === 'Active' ? 'warning' : 'success'}
                    size="sm"
                    onClick={() => handleTogglePatronStatus(patron.id, patron.type)}
                  >
                    {patron.status === 'Active' ? 'Block' : 'Unblock'}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                {loading ? 'Loading...' : 'No patrons found'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;