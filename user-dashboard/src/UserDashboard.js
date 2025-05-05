// Import necessary dependencies from React, Lucide icons, Bootstrap, and Axios
import { useState, useEffect } from "react";
import { Home, Search, BookOpen, Bell, User, Info, MessageSquare } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

// Import custom components for different sections of the dashboard
import BookSearch from "./components/BookSearch";
import HomeSection from "./components/HomeSection";
import BorrowedBooks from "./components/BorrowedBooks";
import StudentProfileForm from "./components/StudentProfileForm";
import StaffProfileForm from "./components/StaffProfileForm";
import PopularBooks from "./components/PopularBooks";
import Notifications from "./components/Notifications";

// Main UserDashboard component
const UserDashboard = () => {
  // State to track the currently active section (e.g., home, search, comments)
  const [activeSection, setActiveSection] = useState("home");
  // State to toggle between student and staff profile forms
  const [isStaff, setIsStaff] = useState(false);
  // State to store announcements fetched from the API
  const [announcements, setAnnouncements] = useState([]);
  // State to manage loading status during API calls
  const [loading, setLoading] = useState(false);
  // State to store error messages from API calls
  const [error, setError] = useState("");
  // State to store comments fetched from the API
  const [comments, setComments] = useState([]);
  // State to store the new comment input by the user
  const [newComment, setNewComment] = useState("");
  // State to manage loading status for comments API calls
  const [commentsLoading, setCommentsLoading] = useState(false);
  // State to store error messages for comments API calls
  const [commentsError, setCommentsError] = useState("");

  // useEffect to fetch announcements and comments when the component mounts
  useEffect(() => {
    // Async function to fetch announcements from the backend
    const fetchAnnouncements = async () => {
      setLoading(true); // Set loading state to true
      try {
        // Make GET request to fetch announcements
        const response = await axios.get("http://localhost:5000/api/settings/announcements");
        setAnnouncements(response.data); // Store fetched announcements
      } catch (err) {
        // Handle errors and set error message
        setError("Failed to load announcements: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    // Async function to fetch comments from the backend
    const fetchComments = async () => {
      setCommentsLoading(true); // Set comments loading state to true
      try {
        // Make GET request to fetch comments
        const response = await axios.get("http://localhost:5000/api/comments");
        setComments(response.data); // Store fetched comments
      } catch (err) {
        // Handle errors and set comments error message
        setCommentsError("Failed to load comments: " + (err.response?.data?.message || err.message));
      } finally {
        setCommentsLoading(false); // Reset comments loading state
      }
    };

    fetchAnnouncements(); // Call the announcements fetch function
    fetchComments(); // Call the comments fetch function
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle section changes when a sidebar or footer button is clicked
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Function to handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!newComment.trim()) return; // Ignore empty comments

    setCommentsLoading(true); // Set loading state for comment submission
    try {
      // Make POST request to submit a new comment
      const response = await axios.post("http://localhost:5000/api/comments", {
        text: newComment,
        userId: "current-user-id", // Replace with actual user ID (e.g., from auth context)
        timestamp: new Date().toISOString(),
      });
      // Add the new comment to the state
      setComments([...comments, response.data]);
      setNewComment(""); // Clear the input field
    } catch (err) {
      // Handle errors and set comments error message
      setCommentsError("Failed to post comment: " + (err.response?.data?.message || err.message));
    } finally {
      setCommentsLoading(false); // Reset loading state
    }
  };

  // Function to render the appropriate section based on activeSection state
  const renderSection = () => {
    switch (activeSection) {
      case "search":
        return <BookSearch />; // Render book search component
      case "home":
        return <HomeSection onSectionChange={handleSectionChange} announcements={announcements} />; // Render home section
      case "borrowed":
        return <BorrowedBooks />; // Render borrowed books component
      case "popular":
        return <PopularBooks />; // Render popular books component
      case "notifications":
        return <Notifications announcements={announcements} loading={loading} error={error} />; // Render notifications
      case "comments":
        return (
          <div>
            <h2>Comments</h2>
            {/* Form for submitting new comments */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  className="form-control"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  rows="4"
                  disabled={commentsLoading}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={commentsLoading}>
                {commentsLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
            {/* Display error message if any */}
            {commentsError && <div className="alert alert-danger">{commentsError}</div>}
            {/* Display loading state or comments */}
            {commentsLoading ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              <ul className="list-group">
                {comments.map((comment, index) => (
                  <li key={index} className="list-group-item">
                    <p>{comment.text}</p>
                    <small className="text-muted">
                      Posted by {comment.userId} on {new Date(comment.timestamp).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        );
      case "profile":
        return (
          <div>
            {/* Buttons to toggle between student and staff profile forms */}
            <div className="mb-3">
              <button
                className={`btn me-2 ${!isStaff ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setIsStaff(false)}
              >
                Student Profile
              </button>
              <button
                className={`btn ${isStaff ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setIsStaff(true)}
              >
                Staff Profile
              </button>
            </div>
            {/* Conditionally render student or staff profile form */}
            {isStaff ? <StaffProfileForm /> : <StudentProfileForm />}
          </div>
        );
      case "about":
        return (
          <div>
            <h2>About UOE Library</h2>
            <p>
              The University of Excellence Library, established in 1965, is a cornerstone of academic excellence in East Africa. 
              With over 50,000 books, journals, and digital resources, we serve students, staff, and researchers across the region. 
              Our mission is to provide access to knowledge and foster a culture of learning and innovation.
            </p>
            <h4>Our Vision</h4>
            <p>To be the leading academic library in East Africa, empowering communities through knowledge.</p>
          </div>
        );
      case "library-hours":
        return (
          <div>
            <h2>Library Hours (EAT, UTC+3)</h2>
            {/* List of library operating hours */}
            <ul className="list-group">
              <li className="list-group-item">Monday: 8:00 AM - 8:00 PM</li>
              <li className="list-group-item">Tuesday: 8:00 AM - 8:00 PM</li>
              <li className="list-group-item">Wednesday: 8:00 AM - 8:00 PM</li>
              <li className="list-group-item">Thursday: 8:00 AM - 8:00 PM</li>
              <li className="list-group-item">Friday: 8:00 AM - 8:00 PM</li>
              <li className="list-group-item">Saturday: 9:00 AM - 4:00 PM</li>
              <li className="list-group-item">Sunday: 9:00 AM - 4:00 PM</li>
            </ul>
            <p className="mt-3 text-muted">Note: Hours may vary during public holidays. Check notifications for updates.</p>
          </div>
        );
      case "contact-us":
        return (
          <div>
            <h2>Contact Us</h2>
            <p>We’re here to assist you with any inquiries. Reach out through the following channels:</p>
            {/* Contact information */}
            <ul className="list-unstyled">
              <li><strong>Email:</strong> library@uoe.edu</li>
              <li><strong>Phone:</strong> +254 703 222 222</li>
              <li><strong>WhatsApp:</strong> +254 703 222 222 (Mon-Fri, 9 AM - 5 PM EAT)</li>
              <li><strong>Physical Address:</strong> UOE Library, P.O. Box 123, Eldoret, Kenya</li>
            </ul>
            <p className="mt-3">For urgent issues, visit the library front desk during operating hours.</p>
          </div>
        );
      case "faq":
        return (
          <div>
            <h2>Frequently Asked Questions (FAQ)</h2>
            {/* Accordion for FAQ items */}
            <div className="accordion" id="faqAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                    How do I borrow a book?
                  </button>
                </h2>
                <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    Use the "My Borrowed Books" section to request a book. You’ll need your student/staff ID.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                    What if I lose a book?
                  </button>
                </h2>
                <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    Report it to library@uoe.edu or visit the front desk. A replacement fee may apply.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                    Can I access e-books?
                  </button>
                </h2>
                <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    Yes, log in to our digital portal via the website with your library credentials.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                    How long can I keep a book?
                  </button>
                </h2>
                <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    The standard loan period is 14 days. Extensions can be requested via the dashboard.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <HomeSection onSectionChange={handleSectionChange} announcements={announcements} />; // Fallback to home section
    }
  };

  // JSX for the dashboard layout
  return (
    // Full-height container with flexbox
    <div className="d-flex flex-column min-vh-100">
      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Sidebar navigation */}
          <aside
            className="col-md-3 bg-dark text-white p-3"
            style={{ position: "fixed", height: "100vh", overflowY: "auto" }}
          >
            <h2 className="text-center mb-4">Library Dashboard</h2>
            <nav className="nav flex-column">
              {/* Sidebar buttons for navigation */}
              <button
                className={`btn mb-2 ${activeSection === "home" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("home")}
              >
                <Home className="me-2" /> Home
              </button>
              <button
                className={`btn mb-2 ${activeSection === "search" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("search")}
              >
                <Search className="me-2" /> Book Search
              </button>
              <button
                className={`btn mb-2 ${activeSection === "popular" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("popular")}
              >
                <BookOpen className="me-2" /> Popular Books
              </button>
              <button
                className={`btn mb-2 ${activeSection === "borrowed" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("borrowed")}
              >
                <BookOpen className="me-2" /> My Borrowed Books
              </button>
              <button
                className={`btn mb-2 ${activeSection === "notifications" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("notifications")}
              >
                <Bell className="me-2" /> Notifications
              </button>
              <button
                className={`btn mb-2 ${activeSection === "comments" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("comments")}
              >
                <MessageSquare className="me-2" /> Comments
              </button>
              <button
                className={`btn mb-2 ${activeSection === "profile" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("profile")}
              >
                <User className="me-2" /> Profile
              </button>
              <button
                className={`btn mb-2 ${activeSection === "about" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => setActiveSection("about")}
              >
                <Info className="me-2" /> About
              </button>
            </nav>
          </aside>

          {/* Main content area */}
          <main className="col-md-9 p-4" style={{ marginLeft: "25%" }}>
            {renderSection()} {/* Render the active section */}
          </main>
        </div>
      </div>

      {/* Footer with additional navigation and contact info */}
      <footer className="bg-dark text-white py-4 mt-auto" style={{ borderTop: "3px solid #007bff" }}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5 className="text-primary mb-3">UOE Library</h5>
              <p className="small">
                Empowering knowledge since 1965<br />
                Over 50,000 books and counting
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="text-primary mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li>
                  <button
                    className="btn text-white text-decoration-none hover-effect p-0"
                    onClick={() => setActiveSection("library-hours")}
                  >
                    Library Hours
                  </button>
                </li>
                <li>
                  <button
                    className="btn text-white text-decoration-none hover-effect p-0"
                    onClick={() => setActiveSection("contact-us")}
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    className="btn text-white text-decoration-none hover-effect p-0"
                    onClick={() => setActiveSection("faq")}
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    className="btn text-white text-decoration-none hover-effect p-0"
                    onClick={() => setActiveSection("comments")}
                  >
                    Comments
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="text-primary mb-3">Get in Touch</h5>
              <p className="small">
                Email: library@uoe.edu<br />
                Phone: +254 703 222 222<br />
                WhatsApp: +254 703 222 222<br />
                <span className="text-muted">Version 2.1.0</span>
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center pt-3 border-top border-secondary">
              <p className="mb-0 small">
                © {new Date().getFullYear()} University of Excellence Library System. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom styles for hover effects */}
      <style jsx>{`
        .hover-effect:hover {
          color: #007bff !important;
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

// Export the component for use in other parts of the application
export default UserDashboard;