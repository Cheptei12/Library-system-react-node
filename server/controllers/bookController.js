const db = require("../config/db");
const csv = require("csv-parser");
const fs = require("fs");

const validCategories = ["Science", "Education", "Business/Economics"];

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, category, isbn, edition, publisher, publicationYear, keywords, location, availability, circulationType, copies, shelfNumber } = req.body;

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const [existingBooks] = await db.query("SELECT id FROM books WHERE isbn = ?", [isbn]);
    if (existingBooks.length > 0) {
      return res.status(400).json({ error: "A book with this ISBN already exists" });
    }

    let coverImagePath = null;
    if (req.file) {
      coverImagePath = req.file.path;
    }

    const sql = `INSERT INTO books (title, author, category, isbn, edition, publisher, publication_year, keywords, location, availability, circulation_type, cover_image, available_copies, shelf_number) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [title, author, category, isbn, edition, publisher, publicationYear, keywords, location, availability || "Available", circulationType || "Loanable", coverImagePath, copies || 1, shelfNumber];

    const [result] = await db.query(sql, values);
    return res.status(201).json({ message: "Book added successfully", bookId: result.insertId });
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM books");
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const [results] = await db.query("SELECT * FROM books WHERE id = ?", [bookId]);
    if (results.length === 0) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json(results[0]);
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Update book details
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, category, isbn, edition, publisher, publicationYear, keywords, location, availability, circulationType, copies, shelfNumber } = req.body;

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    let coverImagePath = req.body.coverImage || null;
    if (req.file) {
      coverImagePath = req.file.path;
    }

    const sql = `UPDATE books SET title=?, author=?, category=?, isbn=?, edition=?, publisher=?, publication_year=?, keywords=?, location=?, availability=?, circulation_type=?, cover_image=?, available_copies=?, shelf_number=? WHERE id=?`;
    const values = [title, author, category, isbn, edition, publisher, publicationYear, keywords, location, availability, circulationType, coverImagePath, copies, shelfNumber, bookId];

    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ message: "Book updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const [result] = await db.query("DELETE FROM books WHERE id = ?", [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Bulk Upload Books from CSV
exports.bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (!req.body.category || !validCategories.includes(req.body.category)) {
    return res.status(400).json({ error: "Valid category is required" });
  }

  const filePath = req.file.path;
  const category = req.body.category;
  const books = [];

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());
    for await (const row of stream) {
      books.push([
        row.title || "",
        row.author || "",
        category,
        row.isbn || "",
        row.edition || "",
        row.publisher || "",
        row.publicationYear || "",
        row.keywords || null,
        row.location || category,
        "Available",
        "Loanable",
        null, // cover_image
        row.copies || 1,
        row.shelfNumber || null,
      ]);
    }

    if (books.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "No valid data found in CSV" });
    }

    const isbnList = books.map((book) => book[3]);
    const [existingBooks] = await db.query("SELECT isbn FROM books WHERE isbn IN (?)", [isbnList]);
    const existingIsbns = existingBooks.map((book) => book.isbn);
    const duplicates = isbnList.filter((isbn) => existingIsbns.includes(isbn));
    if (duplicates.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Duplicate ISBNs found", duplicates });
    }

    const sql = `INSERT INTO books (title, author, category, isbn, edition, publisher, publication_year, keywords, location, availability, circulation_type, cover_image, available_copies, shelf_number) 
                 VALUES ?`;
    const [result] = await db.query(sql, [books]);

    fs.unlinkSync(filePath);
    return res.status(201).json({ message: `${result.affectedRows} books added successfully` });
  } catch (err) {
    console.error("Bulk Upload Error:", err);
    fs.unlinkSync(filePath);
    return res.status(500).json({ error: "Error during bulk upload", details: err.message });
  }
};