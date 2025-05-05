import React, { useState, useEffect } from "react";
import axios from "axios";

const BookSearch = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setBooks([]); // Clear results if query is empty
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/books/search?query=${encodeURIComponent(query)}`);
      if (response.data.length === 0) {
        setError("No books found matching your search criteria.");
      } else {
        setBooks(response.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch books. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>Search Books</h2>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter book title, author, category, or keywords"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {books.length > 0 && (
        <div>
          <h3>Search Results</h3>
          <ul className="list-group">
            {books.map((book) => (
              <li key={book.id} className="list-group-item">
                <img
                  src={book.cover_image ? `http://localhost:5000/uploads/${book.cover_image}` : "/default-cover.jpg"}
                  alt={book.title}
                  style={{ width: "50px", marginRight: "10px" }}
                />
                <strong>{book.title}</strong> by {book.author} ({book.category})
                <p><strong>ISBN:</strong> {book.isbn} | <strong>Edition:</strong> {book.edition}</p>
                <p><strong>Publisher:</strong> {book.publisher} ({book.publication_year})</p>
                <p><strong>Availability:</strong> {book.availability} | <strong>Circulation:</strong> {book.circulation_type}</p>
                <p><strong>Location:</strong> {book.location} (Shelf {book.shelf_number})</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
