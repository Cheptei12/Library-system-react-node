import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  
import "./BookManagement.css";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    navigate("/cataloging/book-management", { state: { book } }); // Ensure book object is passed
  };

  const handleAddNew = () => {
    navigate("/cataloging/book-management", { state: {} }); // Pass empty state instead of null
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${bookId}`);
        alert("Book deleted successfully!");
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book.");
      }
    }
  };
  

  return (
    <div className="book-management-container">
      <h2>Book List</h2>
      <button onClick={handleAddNew} className="add-btn">Add New Book</button>

      {loading ? (
        <p>Loading books...</p>
      ) : (
        <table className="book-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Copies</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.isbn}</td>
                <td>{book.available_copies}</td>
                <td>{book.availability}</td>
                <td>
                  <button onClick={() => handleEdit(book)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(book.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookList;
