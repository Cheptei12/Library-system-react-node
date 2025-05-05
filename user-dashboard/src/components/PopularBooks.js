import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert, Container } from "react-bootstrap";
import axios from "axios";

const PopularBooks = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/popular-books");
        setPopularBooks(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching popular books:", error);
        setError("Failed to load popular books.");
      } finally {
        setLoading(false);
      }
    };
    fetchPopularBooks();
  }, []);

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h2 className="mb-0">Popular Books</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading...</p>
            </div>
          ) : popularBooks.length === 0 ? (
            <Alert variant="info">No popular books found.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Times Borrowed</th>
                </tr>
              </thead>
              <tbody>
                {popularBooks.map((book) => (
                  <tr key={book.isbn}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.borrow_count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PopularBooks;