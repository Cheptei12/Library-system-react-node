import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card, Form, Button, Table, Alert, Tabs, Tab, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Papa from "papaparse";

const categories = ["Science", "Education", "Business/Economics"];
const shelves = Array.from({ length: 30 }, (_, i) => i + 1);

const initialBooks = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", status: "Available" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0446310789", status: "Borrowed" },
  { id: 3, title: "1984", author: "George Orwell", isbn: "978-0451524935", status: "Available" },
];

const OrderBooks = ({ onOrderSubmit }) => {
  const [orderList, setOrderList] = useState([]);
  const [bookDetails, setBookDetails] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Science",
    edition: "",
    publisher: "",
    publicationYear: "",
    quantity: 1,
    vendor: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookDetails({ ...bookDetails, [name]: value });
  };

  const handleAddToOrder = () => {
    if (!bookDetails.title || !bookDetails.author || !bookDetails.isbn || !bookDetails.quantity) {
      setError("Title, Author, ISBN, and Quantity are required fields.");
      return;
    }
    setOrderList([...orderList, bookDetails]);
    setBookDetails({
      title: "",
      author: "",
      isbn: "",
      category: "Science",
      edition: "",
      publisher: "",
      publicationYear: "",
      quantity: 1,
      vendor: "",
    });
    setError("");
  };

  const handleSubmitOrder = async () => {
    if (orderList.length === 0) {
      setError("Please add books to the order before submitting.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/order-books", { orderList });
      setOrderList([]);
      setError("");
      alert("Order submitted successfully!");
      onOrderSubmit(response.data.orderId);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit order.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const books = result.data.map((row) => ({
          title: row[0],
          author: row[1],
          isbn: row[2],
          category: row[3] || "Science",
          edition: row[4] || "",
          publisher: row[5] || "",
          publicationYear: row[6] || "",
          quantity: row[7] || 1,
          vendor: row[8] || "",
        }));
        setOrderList(books);
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 font-weight-bold">Order Books</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Order Form</h5>
            <form>
              {error && <p className="text-danger">{error}</p>}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Book Title</label>
                <input type="text" className="form-control" id="title" name="title" value={bookDetails.title} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="author" className="form-label">Author</label>
                <input type="text" className="form-control" id="author" name="author" value={bookDetails.author} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="isbn" className="form-label">ISBN</label>
                <input type="text" className="form-control" id="isbn" name="isbn" value={bookDetails.isbn} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">Category</label>
                <select className="form-select" id="category" name="category" value={bookDetails.category} onChange={handleInputChange}>
                  <option value="Science">Science</option>
                  <option value="Education">Education</option>
                  <option value="Business/Economics">Business/Economics</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="edition" className="form-label">Edition</label>
                <input type="text" className="form-control" id="edition" name="edition" value={bookDetails.edition} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="publisher" className="form-label">Publisher</label>
                <input type="text" className="form-control" id="publisher" name="publisher" value={bookDetails.publisher} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="publicationYear" className="form-label">Publication Year</label>
                <input
                  type="number"
                  className="form-control"
                  id="publicationYear"
                  name="publicationYear"
                  value={bookDetails.publicationYear}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="quantity" className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  name="quantity"
                  value={bookDetails.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="vendor" className="form-label">Vendor</label>
                <input type="text" className="form-control" id="vendor" name="vendor" value={bookDetails.vendor} onChange={handleInputChange} />
              </div>
              <button type="button" className="btn btn-primary w-100" onClick={handleAddToOrder}>
                Add to Order
              </button>
            </form>
            <div className="mt-4">
              <label htmlFor="bulkUpload" className="form-label">Bulk Upload (CSV file)</label>
              <input type="file" id="bulkUpload" accept=".csv" className="form-control" onChange={handleFileUpload} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Order Summary</h5>
            {orderList.length === 0 ? (
              <p className="text-muted">No books added to order yet.</p>
            ) : (
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Quantity</th>
                    <th>Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList.map((book, index) => (
                    <tr key={index}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.quantity}</td>
                      <td>{book.vendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {orderList.length > 0 && (
        <div className="text-center mt-4">
          <button className="btn btn-success" onClick={handleSubmitOrder}>
            Submit Order
          </button>
        </div>
      )}
    </div>
  );
};

const BookManagement = () => {
  const [books, setBooks] = useState(initialBooks);
  const [acquisitions, setAcquisitions] = useState([]);
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    isbn: "",
    edition: "",
    publisher: "",
    publicationYear: "",
    copies: "",
    location: "",
    shelfNumber: "",
    availability: "Available",
    circulationType: "Loanable",
    category: "",
    coverImage: null,
  });
  const [bulkFile, setBulkFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookForm, setShowBookForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showAcquisitionForm, setShowAcquisitionForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);
  const [receiveData, setReceiveData] = useState({ receivedQuantity: 0, isDamaged: false, comments: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books.");
      }
    };

    const fetchAcquisitions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders");
        setAcquisitions(response.data.orders);
      } catch (error) {
        console.error("Error fetching acquisitions:", error);
        setError("Failed to load acquisitions.");
      }
    };

    fetchBooks();
    fetchAcquisitions();
  }, []);

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBookData({ ...bookData, coverImage: e.target.files[0] });
  };

  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields = ["title", "author", "isbn", "category", "edition", "publisher", "publicationYear", "copies", "shelfNumber"];
    if (requiredFields.some((field) => !bookData[field])) {
      setError("All required fields must be filled.");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        if (bookData[key] && key !== "coverImage") formData.append(key, bookData[key]);
      });
      if (bookData.coverImage) formData.append("coverImage", bookData.coverImage);

      if (bookData.id) {
        await axios.put(`http://localhost:5000/api/books/${bookData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBooks(books.map((book) => (book.id === bookData.id ? { ...bookData, status: bookData.availability } : book)));
        alert("Book updated successfully!");
      } else {
        const response = await axios.post("http://localhost:5000/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBooks([...books, { ...bookData, id: response.data.bookId, status: "bookData.availability" }]);
        alert("Book added successfully!");
      }
      setBookData({
        title: "",
        author: "",
        isbn: "",
        edition: "",
        publisher: "",
        publicationYear: "",
        copies: "",
        location: "",
        shelfNumber: "",
        availability: "Available",
        circulationType: "Loanable",
        category: "",
        coverImage: null,
      });
      setShowBookForm(false);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
      setError("Operation failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!bulkFile || !selectedCategory) {
      setError("Please select a category and upload a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("bulkUpload", bulkFile);
      const response = await axios.post("http://localhost:5000/api/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      const fetchResponse = await axios.get("http://localhost:5000/api/orders");
      setAcquisitions(fetchResponse.data.orders);
      setBulkFile(null);
      setSelectedCategory("");
      setShowBulkForm(false);
    } catch (error) {
      console.error("Bulk Upload Error:", error.response ? error.response.data : error);
      setError("Bulk upload failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      setError("Failed to delete book.");
    }
  };

  const handleEditBook = (book) => {
    setBookData({
      ...book,
      availability: book.status,
      copies: book.available_copies || book.copies,
      shelfNumber: book.shelf_number,
      circulationType: book.circulation_type,
    });
    setShowBookForm(true);
  };

  const handleOrderSubmit = async (orderId) => {
    setShowAcquisitionForm(false);
    const response = await axios.get("http://localhost:5000/api/orders");
    setAcquisitions(response.data.orders);
  };

  const handleReceiveClick = (acq) => {
    setSelectedAcquisition(acq);
    setReceiveData({ receivedQuantity: acq.quantity - (acq.received_quantity || 0), isDamaged: false, comments: "" });
    setShowReceiveModal(true);
  };

  const handleReceiveSubmit = async () => {
    try {
      const currentReceived = selectedAcquisition.received_quantity || 0;
      const newTotalReceived = currentReceived + receiveData.receivedQuantity;
      const receivedBooks = [
        {
          bookId: selectedAcquisition.id,
          receivedQuantity: newTotalReceived,
          isDamaged: receiveData.isDamaged ? 1 : 0,
        },
      ];
      await axios.post(`http://localhost:5000/api/orders/${selectedAcquisition.order_id}/receive`, {
        receivedBooks,
        comments: receiveData.comments,
      });
  
      // Add to books table if fully received
      if (newTotalReceived >= selectedAcquisition.quantity) {
        const validCategories = ["Science", "Education", "Business/Economics"];
        const category = validCategories.includes(selectedAcquisition.category)
          ? selectedAcquisition.category
          : "Science"; // Fallback to "Science" if invalid
  
        const bookData = {
          title: selectedAcquisition.title,
          author: selectedAcquisition.author,
          isbn: selectedAcquisition.isbn,
          category, // Use validated category
          edition: selectedAcquisition.edition || "",
          publisher: selectedAcquisition.publisher || "",
          publicationYear: selectedAcquisition.publication_year || "",
          copies: selectedAcquisition.quantity,
          shelfNumber: "1",
          availability: "Available",
          circulationType: "Loanable",
        };
        const formData = new FormData();
        Object.keys(bookData).forEach((key) => formData.append(key, bookData[key] || "")); // Handle null/undefined
        const response = await axios.post("http://localhost:5000/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBooks([...books, { ...bookData, id: response.data.bookId, status: "Available" }]);
      }
  
      const response = await axios.get("http://localhost:5000/api/orders");
      setAcquisitions(response.data.orders);
      setShowReceiveModal(false);
    } catch (error) {
      console.error("Receive Error Details:", error.response || error);
      setError("Failed to receive books: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  const handleDeleteAcquisition = async (id, orderId) => {
    try {
      // Assuming cancellation by updating status (backend doesn't have a delete endpoint)
      await axios.post(`http://localhost:5000/api/orders/${orderId}/receive`, {
        receivedBooks: [{ bookId: id, receivedQuantity: 0, isDamaged: 0 }],
        comments: "Cancelled",
      });
      setAcquisitions(acquisitions.filter((acq) => acq.id !== id));
    } catch (error) {
      setError("Failed to delete acquisition: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
  );

  const filteredAcquisitions = acquisitions.filter(
    (acq) =>
      acq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acq.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acq.isbn.includes(searchQuery)
  );

  return (
    <div>
      <h2 className="mb-4">Book Management</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Tabs defaultActiveKey="books" id="book-management-tabs" className="mb-4">
        <Tab eventKey="books" title="Current Books">
          <Row className="mb-4">
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowBookForm(!showBookForm)} className="me-2">
                {showBookForm ? "Cancel" : "Add New Book"}
              </Button>
              <Button variant="success" onClick={() => setShowBulkForm(!showBulkForm)}>
                {showBulkForm ? "Cancel" : "Bulk Upload"}
              </Button>
            </Col>
          </Row>

          {showBookForm && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{bookData.id ? "Edit Book" : "Add New Book"}</Card.Title>
                <Form onSubmit={handleBookSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={bookData.title}
                          onChange={handleChange}
                          placeholder="Enter book title"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Author</Form.Label>
                        <Form.Control
                          type="text"
                          name="author"
                          value={bookData.author}
                          onChange={handleChange}
                          placeholder="Enter author name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="category" value={bookData.category} onChange={handleChange} required>
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>ISBN</Form.Label>
                        <Form.Control
                          type="text"
                          name="isbn"
                          value={bookData.isbn}
                          onChange={handleChange}
                          placeholder="Enter ISBN"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Edition</Form.Label>
                        <Form.Control
                          type="text"
                          name="edition"
                          value={bookData.edition}
                          onChange={handleChange}
                          placeholder="Enter edition"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Publisher</Form.Label>
                        <Form.Control
                          type="text"
                          name="publisher"
                          value={bookData.publisher}
                          onChange={handleChange}
                          placeholder="Enter publisher"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Publication Year</Form.Label>
                        <Form.Control
                          type="number"
                          name="publicationYear"
                          value={bookData.publicationYear}
                          onChange={handleChange}
                          placeholder="Enter year"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Copies</Form.Label>
                        <Form.Control
                          type="number"
                          name="copies"
                          value={bookData.copies}
                          onChange={handleChange}
                          placeholder="Enter number of copies"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Shelf Number</Form.Label>
                        <Form.Select name="shelfNumber" value={bookData.shelfNumber} onChange={handleChange} required>
                          <option value="">Select Shelf</option>
                          {shelves.map((shelf) => (
                            <option key={shelf} value={shelf}>{shelf}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Book Cover</Form.Label>
                        <Form.Control type="file" name="coverImage" accept="image/*" onChange={handleFileChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit">
                    {bookData.id ? "Update Book" : "Add Book"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {showBulkForm && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Bulk Upload Books</Card.Title>
                <Form onSubmit={handleBulkUpload}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category for Bulk Upload</Form.Label>
                        <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Upload CSV File</Form.Label>
                        <Form.Control type="file" name="bulkUpload" accept=".csv" onChange={handleBulkFileChange} required />
                        <Form.Text muted>
                          File should contain columns: title, author, isbn, category, edition, publisher, publicationYear, quantity, vendor.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="success" type="submit">
                    Upload Bulk Books
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>
                      <span
                        className={`badge ${
                          book.status === "Available" ? "bg-success" : book.status === "Borrowed" ? "bg-warning" : "bg-secondary"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditBook(book)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBook(book.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="acquisitions" title="Acquisitions">
          <Row className="mb-4">
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowAcquisitionForm(!showAcquisitionForm)}>
                {showAcquisitionForm ? "Cancel" : "Request New Acquisition"}
              </Button>
            </Col>
          </Row>

          {showAcquisitionForm && <OrderBooks onOrderSubmit={handleOrderSubmit} />}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Vendor</th>
                <th>Quantity</th>
                <th>Received Quantity</th>
                <th>Status</th>
                <th>Order ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcquisitions.length > 0 ? (
                filteredAcquisitions.map((acq) => (
                  <tr key={acq.id}>
                    <td>{acq.id}</td>
                    <td>{acq.title}</td>
                    <td>{acq.author}</td>
                    <td>{acq.isbn}</td>
                    <td>{acq.vendor}</td>
                    <td>{acq.quantity}</td>
                    <td>{acq.received_quantity || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          acq.received_quantity >= acq.quantity ? "bg-success" : acq.received_quantity > 0 ? "bg-warning" : "bg-info"
                        }`}
                      >
                        {acq.received_quantity >= acq.quantity ? "Received" : acq.received_quantity > 0 ? "Partially Received" : "Pending"}
                      </span>
                    </td>
                    <td>{acq.order_id}</td>
                    <td>
                      {acq.received_quantity < acq.quantity && (
                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleReceiveClick(acq)}>
                          Receive
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAcquisition(acq.id, acq.order_id)}
                        disabled={acq.received_quantity > 0}
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No acquisitions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      <Modal show={showReceiveModal} onHide={() => setShowReceiveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Receive Book Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAcquisition && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" value={selectedAcquisition.title} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity Ordered</Form.Label>
                <Form.Control type="number" value={selectedAcquisition.quantity} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Received Quantity So Far</Form.Label>
                <Form.Control type="number" value={selectedAcquisition.received_quantity || 0} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity to Receive</Form.Label>
                <Form.Control
                  type="number"
                  value={receiveData.receivedQuantity}
                  onChange={(e) => setReceiveData({ ...receiveData, receivedQuantity: parseInt(e.target.value) || 0 })}
                  min="0"
                  max={selectedAcquisition.quantity - (selectedAcquisition.received_quantity || 0)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Is Damaged"
                  checked={receiveData.isDamaged}
                  onChange={(e) => setReceiveData({ ...receiveData, isDamaged: e.target.checked })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={receiveData.comments}
                  onChange={(e) => setReceiveData({ ...receiveData, comments: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceiveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReceiveSubmit}>
            Confirm Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookManagement;