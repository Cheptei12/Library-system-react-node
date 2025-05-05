import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Navbar, Nav, Button, Card, Dropdown, Table, Badge, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faChartBar, faUsers, faCog, faBell, faUser, faEnvelope, faSearch, faHome, faTruck } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import BookManagement from './components/BookManagement';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import SystemSettings from './components/SystemSettings';
import VendorManagement from './components/VendorManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [dashboardResponse, notificationsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/messages/receive?to=admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!dashboardResponse.ok) throw new Error(`Dashboard HTTP error! Status: ${dashboardResponse.status}`);
      if (!notificationsResponse.ok) throw new Error(`Notifications HTTP error! Status: ${notificationsResponse.status}`);

      const dashboardData = await dashboardResponse.json();
      const notificationsData = await notificationsResponse.json();

      setDashboardData({
        totalBooks: dashboardData.totalBooks || 0,
        activeUsers: dashboardData.activeUsers || 0,
        booksBorrowedToday: dashboardData.booksBorrowedToday || 0,
        overdueBooks: dashboardData.overdueBooks || 0,
        newPatronsThisWeek: dashboardData.newPatronsThisWeek || 0,
        finesCollectedToday: dashboardData.finesCollectedToday || 0,
        booksOrdered: dashboardData.booksOrdered || 0,
      });
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/super-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Login failed: ${response.status} - ${text}`);
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      setIsAuthenticated(true);
      setLoginError(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setActiveModule('Dashboard');
      setDashboardData(null);
      setNotifications([]);
    }
  };

  const handleNavClick = (module) => {
    setActiveModule(module);
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const handleReply = (id) => {
    setSelectedNotifId(id);
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (replyMessage.trim()) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5000/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            from: 'admin',
            to: 'librarian',
            text: replyMessage,
            timestamp: new Date().toISOString(),
            inReplyTo: selectedNotifId,
          }),
        });
        if (!response.ok) throw new Error('Failed to send reply');
        setReplyMessage('');
        setShowReplyModal(false);
      } catch (error) {
        console.error('Error sending reply:', error);
        setError('Failed to send reply');
      }
    }
  };

  const renderLogin = () => (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm p-4" style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Super Admin Login</h2>
          {loginError && <div className="alert alert-danger">{loginError}</div>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );

  const renderContent = () => {
    if (loading) return <div>Loading dashboard data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!dashboardData) return <div>No data available</div>;

    switch (activeModule) {
      case 'Dashboard':
        return (
          <div>
            <h2 className="mb-4 text-primary fw-bold">
              <FontAwesomeIcon icon={faHome} className="me-2" /> Admin Dashboard
            </h2>
            <Row className="mb-4">
              <Col md={3}>
                <Card className="shadow-sm border-primary hover-card">
                  <Card.Body className="text-center">
                    <Card.Title>Total Books</Card.Title>
                    <Card.Text className="fw-bold fs-3 text-primary animate-number">
                      {dashboardData.totalBooks.toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="shadow-sm border-success hover-card">
                  <Card.Body className="text-center">
                    <Card.Title>Active Users</Card.Title>
                    <Card.Text className="fw-bold fs-3 text-success animate-number">
                      {dashboardData.activeUsers.toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="shadow-sm border-info hover-card">
                  <Card.Body className="text-center">
                    <Card.Title>Books Borrowed Today</Card.Title>
                    <Card.Text className="fw-bold fs-3 text-info animate-number">
                      {dashboardData.booksBorrowedToday.toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="shadow-sm border-warning hover-card">
                  <Card.Body className="text-center">
                    <Card.Title>Overdue Books</Card.Title>
                    <Card.Text className="fw-bold fs-3 text-warning animate-number">
                      {dashboardData.overdueBooks.toLocaleString()}
                    </Card.Text>
                    <Button variant="link" size="sm" onClick={() => setActiveModule('Reports')}>
                      View Report
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Header className="bg-primary text-white">Quick Stats</Card.Header>
                  <Card.Body>
                    <Table striped hover size="sm">
                      <tbody>
                        <tr>
                          <td>New Patrons This Week</td>
                          <td><Badge bg="success">{dashboardData.newPatronsThisWeek}</Badge></td>
                        </tr>
                        <tr>
                          <td>Fines Collected Today</td>
                          <td><Badge bg="info">${dashboardData.finesCollectedToday.toFixed(2)}</Badge></td>
                        </tr>
                        <tr>
                          <td>Books Ordered</td>
                          <td><Badge bg="primary">{dashboardData.booksOrdered}</Badge></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Welcome, Admin!</Card.Title>
                    <Card.Text>
                      Manage your library efficiently with real-time insights and controls.
                    </Card.Text>
                    <Button variant="outline-primary" onClick={() => setActiveModule('System Settings')}>
                      Configure Settings
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <div className="mt-4">
              <Button variant="primary" className="me-2" onClick={() => setActiveModule('Book Management')}>
                Manage Books
              </Button>
              <Button variant="success" onClick={() => setActiveModule('User Management')}>
                Manage Users
              </Button>
              <Button variant="info" className="ms-2" onClick={() => setActiveModule('Vendor Management')}>
                Manage Vendors
              </Button>
            </div>
          </div>
        );
      case 'Book Management':
        return <BookManagement />;
      case 'Reports':
        return <Reports />;
      case 'User Management':
        return <UserManagement />;
      case 'System Settings':
        return <SystemSettings />;
      case 'Vendor Management':
        return <VendorManagement />;
      default:
        return <h2 className="text-muted">Welcome to the Admin Dashboard</h2>;
    }
  };

  if (!isAuthenticated) {
    return renderLogin();
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3 shadow-sm">
        <Container fluid>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <img
              src="https://via.placeholder.com/30?text=L"
              alt="Library Logo"
              className="me-2"
              style={{ borderRadius: '50%' }}
            />
            <strong>UOE Library Admin</strong>
          </Navbar.Brand>
          <Form className="d-flex mx-auto" style={{ maxWidth: '400px' }}>
            <Form.Control type="search" placeholder="Search library..." className="me-2" />
            <Button variant="outline-light"><FontAwesomeIcon icon={faSearch} /></Button>
          </Form>
          <Nav className="ms-auto align-items-center">
            <Dropdown>
              <Dropdown.Toggle variant="dark" id="dropdown-notifications">
                <FontAwesomeIcon icon={faBell} />{' '}
                <Badge bg="danger">{notifications.filter(n => n.unread).length}</Badge>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                {notifications.length === 0 ? (
                  <Dropdown.Item>No new messages</Dropdown.Item>
                ) : (
                  notifications.map(notif => (
                    <Dropdown.Item key={notif.id} as="div">
                      <div onClick={() => markNotificationRead(notif.id)}>
                        {notif.text} {notif.unread && <Badge bg="primary">New</Badge>}
                        <small className="d-block text-muted">{new Date(notif.timestamp).toLocaleString()}</small>
                      </div>
                      <Button variant="link" size="sm" onClick={() => handleReply(notif.id)}>Reply</Button>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="ms-3">
              <Dropdown.Toggle variant="dark" id="dropdown-profile">
                <FontAwesomeIcon icon={faUser} /> Admin
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item href="#profile">Profile</Dropdown.Item>
                <Dropdown.Item href="#settings">Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Button} onClick={handleLogout} variant="outline-light" size="sm" className="w-100">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        <Nav className="col-md-2 d-md-block bg-dark sidebar text-white p-3" style={{ height: '100vh', position: 'fixed', overflowY: 'auto' }}>
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('Dashboard')}
              className={`text-white ${activeModule === 'Dashboard' ? 'bg-primary' : ''}`}
              title="Dashboard"
            >
              <strong>Dashboard</strong>
            </Nav.Link>
          </Nav.Item>
          <hr className="bg-light" />
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('Book Management')}
              className={`text-white ${activeModule === 'Book Management' ? 'bg-primary' : ''}`}
              title="Manage Books"
            >
              <FontAwesomeIcon icon={faBook} className="me-2" /> Book Management
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('Reports')}
              className={`text-white ${activeModule === 'Reports' ? 'bg-primary' : ''}`}
              title="View Reports"
            >
              <FontAwesomeIcon icon={faChartBar} className="me-2" /> Reports
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('User Management')}
              className={`text-white ${activeModule === 'User Management' ? 'bg-primary' : ''}`}
              title="Manage Users"
            >
              <FontAwesomeIcon icon={faUsers} className="me-2" /> User Management
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('System Settings')}
              className={`text-white ${activeModule === 'System Settings' ? 'bg-primary' : ''}`}
              title="System Settings"
            >
              <FontAwesomeIcon icon={faCog} className="me-2" /> System Settings
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={() => handleNavClick('Vendor Management')}
              className={`text-white ${activeModule === 'Vendor Management' ? 'bg-primary' : ''}`}
              title="Vendor Management"
            >
              <FontAwesomeIcon icon={faTruck} className="me-2" /> Vendor Management
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <main className="col-md-10 ms-sm-auto px-md-4 py-4 bg-light" style={{ marginLeft: '16.67%' }}>
          <Container fluid>
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb bg-white p-2 rounded shadow-sm">
                <li className="breadcrumb-item">
                  <a href="#" onClick={() => setActiveModule('Dashboard')} className="text-primary">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{activeModule}</li>
              </ol>
            </nav>
            {renderContent()}
          </Container>
        </main>
      </div>

      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Librarian</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="replyMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSendReply}>Send Reply</Button>
        </Modal.Footer>
      </Modal>

      <footer className="bg-dark text-white text-center py-4 mt-auto shadow-top">
        <Container>
          <Row>
            <Col>
              <p className="mb-1">© {new Date().getFullYear()} UOE Library System. All rights reserved.</p>
              <p className="mb-2">
                <small>Version 1.0.0 | Contact: <FontAwesomeIcon icon={faEnvelope} /> support@uoelibrary.org</small>
              </p>
              <div>
                <Button variant="link" href="https://twitter.com" target="_blank" className="text-white">
                  <FontAwesomeIcon icon={faTwitter} />
                </Button>
                <Button variant="link" href="https://github.com" target="_blank" className="text-white">
                  <FontAwesomeIcon icon={faGithub} />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;