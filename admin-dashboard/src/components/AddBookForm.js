// src/components/AddBookForm.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = ["Science", "Education", "Business/Economics"];
const shelves = Array.from({ length: 30 }, (_, i) => i + 1);

const AddBookForm = ({ onBookAdded }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    isbn: '',
    edition: '',
    publisher: '',
    publicationYear: '',
    copies: '',
    location: '',
    shelfNumber: '',
    availability: 'Available',
    circulationType: 'Loanable',
    coverImage: null,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBookData({ ...bookData, coverImage: e.target.files[0] });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setBookData({ ...bookData, location: category });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Please select a category.');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        if (bookData[key]) formData.append(key, bookData[key]);
      });
      formData.append('category', selectedCategory);

      const response = await axios.post('http://localhost:5000/api/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setBookData({
        title: '',
        author: '',
        isbn: '',
        edition: '',
        publisher: '',
        publicationYear: '',
        copies: '',
        location: '',
        shelfNumber: '',
        availability: 'Available',
        circulationType: 'Loanable',
        coverImage: null,
      });
      setSelectedCategory('');
      setError(null);

      if (onBookAdded) onBookAdded(response.data); // Notify parent component
      alert('Book added successfully!');
      navigate('/book-list'); // Navigate to book list as in librarian version
    } catch (error) {
      console.error('Error adding book:', error.response ? error.response.data : error);
      setError('Failed to add book. Check console for details.');
    }
  };

  return (
    <div>
      <h5 className="mb-3">Add Single Book</h5>
      {error && <p className="text-danger">{error}</p>}
      <Form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-6">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={bookData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Author</Form.Label>
          <Form.Control
            type="text"
            name="author"
            value={bookData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>ISBN</Form.Label>
          <Form.Control
            type="text"
            name="isbn"
            value={bookData.isbn}
            onChange={handleChange}
            placeholder="Enter ISBN"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Edition</Form.Label>
          <Form.Control
            type="text"
            name="edition"
            value={bookData.edition}
            onChange={handleChange}
            placeholder="Enter edition"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Publisher</Form.Label>
          <Form.Control
            type="text"
            name="publisher"
            value={bookData.publisher}
            onChange={handleChange}
            placeholder="Enter publisher"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Publication Year</Form.Label>
          <Form.Control
            type="number"
            name="publicationYear"
            value={bookData.publicationYear}
            onChange={handleChange}
            placeholder="Enter publication year"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Copies</Form.Label>
          <Form.Control
            type="number"
            name="copies"
            value={bookData.copies}
            onChange={handleChange}
            placeholder="Enter number of copies"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label>Shelf Number</Form.Label>
          <Form.Select
            name="shelfNumber"
            value={bookData.shelfNumber}
            onChange={handleChange}
            required
          >
            <option value="">Select Shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf} value={shelf}>{shelf}</option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-6">
          <Form.Label>Book Cover</Form.Label>
          <Form.Control
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="col-12">
          <Button variant="primary" type="submit">Add Book</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddBookForm;