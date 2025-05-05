import React, { useState } from 'react';
import Papa from 'papaparse';  // Import PapaParse for CSV parsing

const OrderBooks = () => {
  const [orderList, setOrderList] = useState([]);
  const [bookDetails, setBookDetails] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Science',
    edition: '',
    publisher: '',
    publicationYear: '',
    quantity: 1,
    vendor: ''
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookDetails({
      ...bookDetails,
      [name]: value
    });
  };

  const handleAddToOrder = () => {
    // Validation for required fields
    if (!bookDetails.title || !bookDetails.author || !bookDetails.isbn || !bookDetails.quantity) {
      setError("Title, Author, ISBN, and Quantity are required fields.");
      return;
    }

    // Adding the book to the order list
    setOrderList([...orderList, bookDetails]);

    // Reset the form for next input
    setBookDetails({
      title: '',
      author: '',
      isbn: '',
      category: 'Science',
      edition: '',
      publisher: '',
      publicationYear: '',
      quantity: 1,
      vendor: ''
    });
    setError("");  // Reset error
  };

  const handleSubmitOrder = async () => {
    if (orderList.length === 0) {
      setError("Please add books to the order before submitting.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/order-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderList }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order.");
      }

      // Clear the order list and book details after successful submission
      setOrderList([]);
      setError("");  // Reset error
      alert('Order submitted successfully!');
    } catch (error) {
      setError(error.message);  // Show error message if submission fails
    }
  };

  // Handle CSV File Upload and Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      complete: (result) => {
        const books = result.data.map((row) => ({
          title: row[0],
          author: row[1],
          isbn: row[2],
          category: row[3] || 'Science',
          edition: row[4] || '',
          publisher: row[5] || '',
          publicationYear: row[6] || '',
          quantity: row[7] || 1,
          vendor: row[8] || ''
        }));
        setOrderList(books);  // Set parsed books into order list
      },
      header: false, // Since we don't have headers in the CSV file
      skipEmptyLines: true
    });
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 font-weight-bold">Order Books</h2>

      {/* Order Form */}
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Order Form</h5>
            <form>
              {error && <p className="text-danger">{error}</p>}

              <div className="mb-3">
                <label htmlFor="title" className="form-label">Book Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={bookDetails.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="author" className="form-label">Author</label>
                <input
                  type="text"
                  className="form-control"
                  id="author"
                  name="author"
                  value={bookDetails.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="isbn" className="form-label">ISBN</label>
                <input
                  type="text"
                  className="form-control"
                  id="isbn"
                  name="isbn"
                  value={bookDetails.isbn}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="category"
                  name="category"
                  value={bookDetails.category}
                  onChange={handleInputChange}
                >
                  <option value="Science">Science</option>
                  <option value="Education">Education</option>
                  <option value="Business/Economics">Business/Economics</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="edition" className="form-label">Edition</label>
                <input
                  type="text"
                  className="form-control"
                  id="edition"
                  name="edition"
                  value={bookDetails.edition}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="publisher" className="form-label">Publisher</label>
                <input
                  type="text"
                  className="form-control"
                  id="publisher"
                  name="publisher"
                  value={bookDetails.publisher}
                  onChange={handleInputChange}
                  required
                />
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
                  required
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
                <input
                  type="text"
                  className="form-control"
                  id="vendor"
                  name="vendor"
                  value={bookDetails.vendor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddToOrder}
              >
                Add to Order
              </button>
            </form>

            {/* Bulk Upload Section */}
            <div className="mt-4">
              <label htmlFor="bulkUpload" className="form-label">Bulk Upload (CSV file)</label>
              <input
                type="file"
                id="bulkUpload"
                accept=".csv"
                className="form-control"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
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

      {/* Submit Order Button */}
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

export default OrderBooks;
