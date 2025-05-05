import React, { useState } from "react";
import axios from "axios";

const BorrowedBooks = () => {
  const [userId, setUserId] = useState(""); // To store the regNumber or employeeNumber
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle user input (regNumber or employeeNumber)
  const handleInputChange = (e) => {
    setUserId(e.target.value);
  };

  // Fetch borrowed books when the user submits their ID (regNumber/employeeNumber)
  const handleSearch = async (e) => {
    e.preventDefault();
    setError(""); // Reset error
    setLoading(true); // Start loading indicator

    if (!userId.trim()) {
      setError("Please enter your registration number or employee number.");
      setLoading(false);
      return;
    }

    try {
      // Fetch borrowed books from the backend based on regNumber or employeeNumber
      const response = await axios.get(
        `http://localhost:5000/api/borrowedBooks/${encodeURIComponent(userId)}`
      );
      
      setBorrowedBooks(response.data);
    } catch (error) {
      setError("Error fetching borrowed books. Please try again.");
      setBorrowedBooks([]);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="container">
      <h2 className="mt-4 mb-3">My Borrowed Books</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Registration Number or Employee Number"
            value={userId}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : borrowedBooks.length === 0 ? (
        <div className="alert alert-info">
          No borrowed books found for this ID.
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{new Date(book.borrow_date).toLocaleDateString()}</td>
                <td>{new Date(book.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BorrowedBooks;
