const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fine rate per day (adjust as needed)
const FINE_PER_DAY = 50;

// Function to calculate fine for overdue books
const calculateFine = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    // Fetch all overdue books that are not yet recorded as fines
    const overdueQuery = `
      SELECT bb.id, bb.reg_number, bb.isbn, bb.due_date, s.name AS student_name, b.title AS book_title
      FROM borrowed_books bb
      JOIN students s ON bb.reg_number = s.reg_number
      JOIN books b ON bb.isbn = b.isbn
      WHERE bb.due_date < ? AND bb.status = 'borrowed'
      AND NOT EXISTS (SELECT 1 FROM fines f WHERE f.reg_number = bb.reg_number AND f.isbn = bb.isbn AND f.status = 'unpaid');
    `;

    const [overdueBooks] = await db.query(overdueQuery, [today]);

    for (let book of overdueBooks) {
      const dueDate = new Date(book.due_date);
      const todayDate = new Date(today);
      const overdueDays = Math.max(0, Math.ceil((todayDate - dueDate) / (1000 * 60 * 60 * 24))); // Calculate days overdue
      const fineAmount = overdueDays * FINE_PER_DAY;

      // Insert fine record into fines table
      const insertFineQuery = `
        INSERT INTO fines (reg_number, isbn, due_date, fine_amount, status)
        VALUES (?, ?, ?, ?, 'unpaid');
      `;
      await db.query(insertFineQuery, [book.reg_number, book.isbn, book.due_date, fineAmount]);
    }
  } catch (error) {
    console.error("Error calculating fines:", error);
  }
};

// Fetch all unpaid fines and ensure overdue books are added
router.get("/unpaid", async (req, res) => {
  try {
    await calculateFine(); // Check and insert overdue fines before fetching

    const query = `
      SELECT 
        f.id, 
        s.reg_number, 
        s.name AS student_name, 
        b.isbn, 
        b.title AS book_title, 
        f.due_date, 
        f.fine_amount,
        f.status
      FROM fines f
      JOIN students s ON f.reg_number = s.reg_number
      JOIN books b ON f.isbn = b.isbn
      WHERE f.status = 'unpaid'
      ORDER BY f.due_date ASC;
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching unpaid fines:", error);
    res.status(500).json({ message: "Failed to fetch unpaid fines. Please try again later." });
  }
});

// Mark fine as paid
router.put("/pay/:fineId", async (req, res) => {
  try {
    const { fineId } = req.params;

    const updateQuery = "UPDATE fines SET status = 'paid' WHERE id = ?";
    await db.query(updateQuery, [fineId]);

    res.json({ message: "Fine marked as paid successfully." });
  } catch (error) {
    console.error("Error marking fine as paid:", error);
    res.status(500).json({ message: "Failed to update fine status." });
  }
});

module.exports = router;
