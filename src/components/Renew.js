import { useState } from "react";
import axios from "axios";
import { FaSync } from "react-icons/fa";
import "./renew.css";

const RenewBook = ({ userRole, userId }) => {
  const [regNumber, setRegNumber] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBorrowedBooks = async () => {
    if (!regNumber.trim()) {
      alert("Please enter a valid Registration Number.");
      return;
    }
  
    const url = `http://localhost:5000/api/renew/borrowed-books/${encodeURIComponent(regNumber)}`; 
  
    console.log("Fetching from:", url); // 🔍 Debugging the API URL
  
    try {
      const response = await axios.get(url);
      console.log("API Response:", response.data);
      setBorrowedBooks(response.data);
    } catch (error) {
      console.error("Error fetching borrowed books:", error.response ? error.response.data : error.message);
    }
  };
  
  

  const handleRenewClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const confirmRenewal = async () => {
    if (!selectedBook) {
        alert("No book selected for renewal.");
        return;
    }

    // Retrieve user role and ID correctly
    const userRole = localStorage.getItem("role"); // Use 'role' instead of 'userRole'
    const userId = localStorage.getItem("user_id"); // Use 'user_id' instead of 'userId'

    // Debugging logs
    console.log("User Role from Storage:", userRole);
    console.log("User ID from Storage:", userId);

    if (!userId) {
        alert("Error: No user ID found. Please log in again.");
        return;
    }

    const requestData = {
        bookId: selectedBook.id,
        librarianId: userRole === "librarian" ? userId : null,
        superAdminId: userRole === "super_admin" ? userId : null, // Corrected key usage
    };

    console.log("Sending Renewal Request:", requestData); // Debugging

    try {
        const response = await axios.post(`http://localhost:5000/api/renew/renew-book`, requestData);
        console.log("Renewal Success:", response.data);
        setShowModal(false);
        fetchBorrowedBooks(); // Refresh books after renewal
    } catch (error) {
        console.error("Error renewing book:", error.response ? error.response.data : error.message);
        alert(error.response?.data?.message || "Error renewing book");
    }
};




  return (
    <div className="renew-container">
      <h2>Renew Borrowed Books</h2>
      <div className="search-section">
        <input
          type="text"
          placeholder="Enter Student Reg No"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
        />
        <button onClick={() => {
  if (!regNumber.trim()) {
    alert("Please enter a valid Registration Number.");
    return;
  }
  fetchBorrowedBooks();
}}>Search</button>
      </div>
      <table className="book-table">
        <thead>
          <tr>
            <th>ISBN</th>
            <th>Book Title</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {borrowedBooks.map((book) => (
            <tr key={book.id}>
              <td>{book.isbn}</td>
              <td>{book.title}</td>
              <td>{book.due_date}</td>
              <td>
                <button className="renew-btn" onClick={() => handleRenewClick(book)}>
                  <FaSync /> Renew
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Renewal</h3>
            <p>
              Are you sure you want to renew "{selectedBook.title}" until a new
              due date?
            </p>
            <button onClick={confirmRenewal}>Confirm</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewBook;
