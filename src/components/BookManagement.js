import React, { useState, useEffect } from "react";
import axios from "axios";
import {

 useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const categories = ["Science", "Education", "Business/Economics"];
const shelves = Array.from({ length: 30 }, (_, i) => i + 1);

const BookManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookToEdit = location.state?.book || null;

  const [bookData, setBookData] = useState({
    title: bookToEdit?.title || "",
    author: bookToEdit?.author || "",
    isbn: bookToEdit?.isbn || "",
    edition: bookToEdit?.edition || "",
    publisher: bookToEdit?.publisher || "",
    publicationYear: bookToEdit?.publicationYear || "",
    copies: bookToEdit?.available_copies || "",
    location: bookToEdit?.location || "",
    shelfNumber: bookToEdit?.shelf_number || "",
    availability: bookToEdit?.availability || "Available",
    circulationType: bookToEdit?.circulation_type || "Loanable",
    category: bookToEdit?.category || "",
    coverImage: null,
  });
  const [bulkFile, setBulkFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(bookToEdit?.category || "");

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
    if (e.target.name === "category") {
      setSelectedCategory(e.target.value);
    }
  };

  const handleFileChange = (e) => {
    setBookData({ ...bookData, coverImage: e.target.files[0] });
  };

  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        if (bookData[key] && key !== "coverImage") formData.append(key, bookData[key]);
      });
      if (bookData.coverImage) formData.append("coverImage", bookData.coverImage);

      if (bookToEdit) {
        await axios.put(`http://localhost:5000/api/books/${bookToEdit.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Book updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Book added successfully!");
      }
      navigate("/book-list");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
      alert("Operation failed. Check console for details.");
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile || !selectedCategory) {
      alert("Please select a category and upload a file.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("bulkUploadFile", bulkFile);
      formData.append("category", selectedCategory);

      const response = await axios.post("http://localhost:5000/api/books/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      navigate("/book-list");
    } catch (error) {
      console.error("Bulk Upload Error:", error.response ? error.response.data : error);
      alert("Bulk upload failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="container p-4">
      <h2 className="mb-4">{bookToEdit ? "Edit Book" : "Add New Book"}</h2>
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/book-list")}>
        View Books
      </button>

      {/* Single Book Form */}
      <h5 className="mt-4">Add/Edit Single Book</h5>
      <form onSubmit={handleSubmit} className="row g-3 mb-5">
        <div className="col-md-6">
          <label className="form-label">Title:</label>
          <input type="text" name="title" className="form-control" value={bookData.title} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Author:</label>
          <input type="text" name="author" className="form-control" value={bookData.author} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Category:</label>
          <select name="category" className="form-select" value={bookData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">ISBN:</label>
          <input type="text" name="isbn" className="form-control" value={bookData.isbn} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Edition:</label>
          <input type="text" name="edition" className="form-control" value={bookData.edition} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Publisher:</label>
          <input type="text" name="publisher" className="form-control" value={bookData.publisher} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Publication Year:</label>
          <input type="number" name="publicationYear" className="form-control" value={bookData.publicationYear} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Copies:</label>
          <input type="number" name="copies" className="form-control" value={bookData.copies} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Shelf Number:</label>
          <select name="shelfNumber" className="form-select" value={bookData.shelfNumber} onChange={handleChange} required>
            <option value="">Select Shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf} value={shelf}>{shelf}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Book Cover:</label>
          <input type="file" name="coverImage" className="form-control" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">{bookToEdit ? "Update Book" : "Add Book"}</button>
        </div>
      </form>

      {/* Bulk Upload Form */}
      <h5 className="mt-4">Bulk Upload Books</h5>
      <form onSubmit={handleBulkUpload} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Category for Bulk Upload:</label>
          <select name="category" className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Upload CSV File:</label>
          <input
            type="file"
            name="bulkUploadFile"
            className="form-control"
            accept=".csv"
            onChange={handleBulkFileChange}
            required
          />
          <small className="form-text text-muted">
            File should contain columns: title, author, isbn, edition, publisher, publicationYear, copies, shelfNumber.
          </small>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success">Upload Bulk Books</button>
        </div>
      </form>
    </div>
  );
};

export default BookManagement;