// src/App.js (Librarian Dashboard)
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LibrarianLogin from "./components/LibrarianLogin"; // Replace SuperAdminLogin
import CheckOut from "./components/checkOut";
import RegisterStudent from "./components/RegisterUser";
import SearchPatron from "./components/SearchPatron";
import Cataloging from "./components/cataloging";
import BookManagement from "./components/BookManagement";
import BookList from "./components/BookList";
import Circulation from "./components/circulation";
import CheckIn from "./components/CheckIn";
import FineManagement from "./components/FineManagement";
import Renew from "./components/Renew";
import CirculationReports from "./components/CirculationReports";
import Acquisition from "./components/Acquisition";
import ClassificationCategories from "./components/ClassificationCategories";
import OrderBooks from "./components/OrderBooks";
import ReceiveBooks from "./components/ReceiveBooks";
import VendorManagement from "./components/VendorManagement";
import OrderedBooksReport from "./components/OrderedBooksReport";
import ReceivedBooksReport from "./components/ReceivedBooksReport";
import VendorPerformanceReport from "./components/VendorPerformanceReport";

import { FaHome, FaBook, FaSearch, FaChartBar, FaBoxOpen, FaUserPlus, FaUser, FaEnvelope, FaPhone, FaBell } from "react-icons/fa";
import logo from "./logo.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Home Component with Communication Form and Notifications
const Home = () => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    booksCheckedOutToday: 0,
    overdueBooks: 0,
    registeredPatrons: 0,
    pendingFines: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibrarianDashboardData = async () => {
      try {
        const token = localStorage.getItem("librarianToken");
        const [dashboardResponse, notificationsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/librarian-dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/messages/receive?to=librarian", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashboardResponse.ok) throw new Error(`Dashboard HTTP error! Status: ${dashboardResponse.status}`);
        if (!notificationsResponse.ok) throw new Error(`Notifications HTTP error! Status: ${notificationsResponse.status}`);

        const dashboardData = await dashboardResponse.json();
        const notificationsData = await notificationsResponse.json();

        setDashboardData({
          booksCheckedOutToday: Number(dashboardData.booksCheckedOutToday) || 0,
          overdueBooks: Number(dashboardData.overdueBooks) || 0,
          registeredPatrons: Number(dashboardData.registeredPatrons) || 0,
          pendingFines: Number(dashboardData.pendingFines) || 0,
        });
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrarianDashboardData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const token = localStorage.getItem("librarianToken");
        const response = await fetch("http://localhost:5000/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            from: "librarian",
            to: "admin",
            text: message,
            timestamp: new Date().toISOString(),
          }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        setSubmitted(true);
        setMessage("");
        setTimeout(() => setSubmitted(false), 3000);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
      }
    }
  };

  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="mb-4">Welcome to UOE Librarian Dashboard</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Books Checked Out Today</h5>
              <p className="card-text">{dashboardData.booksCheckedOutToday.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Overdue Books</h5>
              <p className="card-text">{dashboardData.overdueBooks.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Registered Patrons</h5>
              <p className="card-text">{dashboardData.registeredPatrons.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pending Fines</h5>
              <p className="card-text">${Number(dashboardData.pendingFines).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h5>Quick Actions</h5>
        <button className="btn btn-primary custom-btn me-2" onClick={() => window.location.href = "/checkout"}>
          Check Out
        </button>
        <button className="btn btn-success custom-btn me-2" onClick={() => window.location.href = "/register-student"}>
          Register Users
        </button>
        <button className="btn btn-info custom-btn" onClick={() => window.location.href = "/search-patron"}>
          Search Patron
        </button>
      </div>
      <div className="mt-4">
        <h5>Communicate with Admin</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the admin here..."
            />
          </div>
          <button type="submit" className="btn btn-primary custom-btn">Send Message</button>
          {submitted && <div className="alert alert-success mt-2">Message sent successfully!</div>}
        </form>
      </div>
      <div className="mt-4">
        <h5>Notifications from Admin <FaBell /></h5>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul className="list-group">
            {notifications.map((notif) => (
              <li key={notif.id} className="list-group-item">
                {notif.text} <small>({new Date(notif.timestamp).toLocaleString()})</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Sidebar Component with Dropdown for Reports
const Sidebar = ({ navigate }) => {
  const [showReports, setShowReports] = useState(false);

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Library Transactions", icon: <FaBook />, path: "/circulation" },
    { name: "Cataloging", icon: <FaSearch />, path: "/cataloging" },
    { name: "Acquisitions", icon: <FaBoxOpen />, path: "/acquisitions" },
    {
      name: "Reports",
      icon: <FaChartBar />,
      hasSubmenu: true,
      submenu: [
        { name: "Overdue Books", path: "/reports/overdue-books" },
        { name: "Checked Out Books", path: "/reports/checked-out-books" },
        { name: "Returned Books", path: "/reports/returned-books" },
        { name: "Fine Collection", path: "/reports/fine-collection" },
      ],
    },
    { name: "Register Users", icon: <FaUserPlus />, path: "/register-student" },
    { name: "Search Patron", icon: <FaUser />, path: "/search-patron" },
  ];

  return (
    <div className="sidebar bg-dark text-white p-3 d-flex flex-column" style={{ height: "100vh", position: "fixed", width: "250px" }}>
      <h4 className="text-center mb-4">Librarian Menu</h4>
      <ul className="list-group list-group-flush w-100">
        {menuItems.map((item) => (
          <li key={item.name} className="list-group-item bg-dark text-white border-0 py-2 sidebar-item">
            <div onClick={() => (item.hasSubmenu ? setShowReports(!showReports) : navigate(item.path))} style={{ cursor: "pointer" }}>
              {item.icon} <span className="ms-2">{item.name}</span>
            </div>
            {item.hasSubmenu && showReports && (
              <ul className="list-group list-group-flush ms-4 mt-2">
                {item.submenu.map((subItem) => (
                  <li
                    key={subItem.name}
                    className="list-group-item bg-dark text-white border-0 py-1"
                    onClick={() => navigate(subItem.path)}
                    style={{ cursor: "pointer" }}
                  >
                    {subItem.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Header Component
const Header = ({ navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem("librarianToken"); // Updated to librarianToken
    navigate("/librarian-login");
  };

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white shadow-sm">
      <div className="d-flex align-items-center">
        <img src={logo} alt="Library Logo" className="logo me-2" style={{ width: "40px", height: "40px" }} />
        <h1 className="h4 mb-0">UOE Library</h1>
      </div>
      <div>
        <button className="btn btn-primary custom-btn me-2" onClick={() => navigate("/checkout")}>
          Check Out
        </button>
        <button className="btn btn-primary custom-btn me-2" onClick={() => navigate("/checkin")}>
          Check In
        </button>
        <button className="btn btn-primary custom-btn me-2" onClick={() => navigate("/renew")}>
          Renew
        </button>
        <button className="btn btn-warning custom-btn me-2" onClick={() => navigate("/search-patron")}>
          Search Patrons
        </button>
        <button className="btn btn-danger custom-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-dark text-white p-3 mt-auto">
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <h6>UOE Library System</h6>
          <p>© {new Date().getFullYear()} University of Excellence. All rights reserved.</p>
        </div>
       
        <div className="col-md-4">
          <h6>Quick Links</h6>
          <ul className="list-unstyled">
            <li>
              <a href="/circulation" className="text-white text-decoration-none">
                Library Transactions
              </a>
            </li>
            <li>
              <a href="/cataloging" className="text-white text-decoration-none">
                Cataloging
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

// Page Wrapper
const PageWrapper = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="wrapper d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar navigate={navigate} />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: "250px" }}>
        <Header navigate={navigate} />
        <main className="container-fluid mt-4 flex-grow-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/librarian-login" element={<LibrarianLogin />} /> {/* Updated route */}
        <Route path="/" element={<ProtectedRoute><PageWrapper><Home /></PageWrapper></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><PageWrapper><CheckOut /></PageWrapper></ProtectedRoute>} />
        <Route path="/register-student" element={<ProtectedRoute><PageWrapper><RegisterStudent /></PageWrapper></ProtectedRoute>} />
        <Route path="/search-patron" element={<ProtectedRoute><PageWrapper><SearchPatron /></PageWrapper></ProtectedRoute>} />
        <Route path="/cataloging" element={<ProtectedRoute><PageWrapper><Cataloging /></PageWrapper></ProtectedRoute>} />
        <Route path="/cataloging/book-management" element={<ProtectedRoute><PageWrapper><BookManagement /></PageWrapper></ProtectedRoute>} />
        <Route path="/cataloging/classification-categories" element={<ProtectedRoute><PageWrapper><ClassificationCategories /></PageWrapper></ProtectedRoute>} />
        <Route path="/book-list" element={<ProtectedRoute><PageWrapper><BookList /></PageWrapper></ProtectedRoute>} />
        <Route path="/circulation" element={<ProtectedRoute><PageWrapper><Circulation /></PageWrapper></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><PageWrapper><CheckIn /></PageWrapper></ProtectedRoute>} />
        <Route path="/fine-management" element={<ProtectedRoute><PageWrapper><FineManagement /></PageWrapper></ProtectedRoute>} />
        <Route path="/renew" element={<ProtectedRoute><PageWrapper><Renew /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/overdue-books" element={<ProtectedRoute><PageWrapper><CirculationReports reportType="overdue-books" /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/checked-out-books" element={<ProtectedRoute><PageWrapper><CirculationReports reportType="checked-out-books" /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/returned-books" element={<ProtectedRoute><PageWrapper><CirculationReports reportType="returned-books" /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/fine-collection" element={<ProtectedRoute><PageWrapper><CirculationReports reportType="fine-collection" /></PageWrapper></ProtectedRoute>} />
        <Route path="/acquisitions" element={<ProtectedRoute><PageWrapper><Acquisition /></PageWrapper></ProtectedRoute>} />
        <Route path="/order-books" element={<ProtectedRoute><PageWrapper><OrderBooks /></PageWrapper></ProtectedRoute>} />
        <Route path="/receive-books" element={<ProtectedRoute><PageWrapper><ReceiveBooks /></PageWrapper></ProtectedRoute>} />
        <Route path="/vendor-management" element={<ProtectedRoute><PageWrapper><VendorManagement /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/ordered-books" element={<ProtectedRoute><PageWrapper><OrderedBooksReport /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/received-books" element={<ProtectedRoute><PageWrapper><ReceivedBooksReport /></PageWrapper></ProtectedRoute>} />
        <Route path="/reports/vendor-performance" element={<ProtectedRoute><PageWrapper><VendorPerformanceReport /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;