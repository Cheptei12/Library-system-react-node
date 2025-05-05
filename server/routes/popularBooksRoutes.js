const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        b.title,
        b.author,
        b.isbn,
        COUNT(bb.isbn) AS borrow_count
      FROM books b
      LEFT JOIN borrowed_books bb ON b.isbn = bb.isbn
      GROUP BY b.id, b.title, b.author, b.isbn
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching popular books:", error);
    res.status(500).json({ message: "Error fetching popular books" });
  }
});

module.exports = router;