const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection pool from config/db.js

// Route to fetch Admin Dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Current date (YYYY-MM-DD)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7); // Start of the week (7 days ago)
    const weekStartDate = weekStart.toISOString().split('T')[0];

    // Total Books
    const [totalBooks] = await db.query('SELECT COUNT(*) as count FROM books');

    // Active Users (staff + students with status 'Active')
    const [activeStaff] = await db.query('SELECT COUNT(*) as count FROM staff WHERE status = "Active"');
    const [activeStudents] = await db.query('SELECT COUNT(*) as count FROM students WHERE status = "Active"');
    const activeUsers = activeStaff[0].count + activeStudents[0].count;

    // Books Borrowed Today
    const [booksBorrowedToday] = await db.query(
      'SELECT COUNT(*) as count FROM borrowed_books WHERE DATE(borrow_date) = ? AND status = "borrowed"',
      [today]
    );

    // Overdue Books
    const [overdueBooks] = await db.query(
      'SELECT COUNT(*) as count FROM borrowed_books WHERE due_date < ? AND status = "overdue"',
      [today]
    );

    // New Patrons This Week (staff + students created in the last 7 days)
    const [newStaff] = await db.query(
      'SELECT COUNT(*) as count FROM staff WHERE DATE(created_at) >= ?',
      [weekStartDate]
    );
    const [newStudents] = await db.query(
      'SELECT COUNT(*) as count FROM students WHERE DATE(created_at) >= ?',
      [weekStartDate]
    );
    const newPatronsThisWeek = newStaff[0].count + newStudents[0].count;

    // Fines Collected Today
    const [finesCollectedToday] = await db.query(
      'SELECT SUM(fine_amount) as total FROM fines WHERE DATE(paid_date) = ? AND status = "paid"',
      [today]
    );

    // Books Ordered (pending or received this week)
    const [booksOrdered] = await db.query(
      'SELECT SUM(quantity) as total FROM book_orders WHERE DATE(order_date) >= ? AND status IN ("pending", "received")',
      [weekStartDate]
    );

    // Send the response with all fetched data
    res.json({
      totalBooks: totalBooks[0].count,
      activeUsers,
      booksBorrowedToday: booksBorrowedToday[0].count,
      overdueBooks: overdueBooks[0].count,
      newPatronsThisWeek,
      finesCollectedToday: finesCollectedToday[0].total || 0,
      booksOrdered: booksOrdered[0].total || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch Librarian Dashboard statistics
router.get('/librarian-dashboard-stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Current date (YYYY-MM-DD)

    // Books Checked Out Today
    const [booksCheckedOutToday] = await db.query(
      'SELECT COUNT(*) as count FROM borrowed_books WHERE DATE(borrow_date) = ? AND status = "borrowed"',
      [today]
    );

    // Overdue Books
    const [overdueBooks] = await db.query(
      'SELECT COUNT(*) as count FROM borrowed_books WHERE due_date < ? AND status = "overdue"',
      [today]
    );

    // Registered Patrons (total active staff + students)
    const [activeStaff] = await db.query('SELECT COUNT(*) as count FROM staff WHERE status = "Active"');
    const [activeStudents] = await db.query('SELECT COUNT(*) as count FROM students WHERE status = "Active"');
    const registeredPatrons = activeStaff[0].count + activeStudents[0].count;

    // Pending Fines (sum of unpaid fines)
    const [pendingFines] = await db.query(
      'SELECT SUM(fine_amount) as total FROM fines WHERE status = "unpaid"'
    );

    // Send the response with all fetched data
    res.json({
      booksCheckedOutToday: booksCheckedOutToday[0].count,
      overdueBooks: overdueBooks[0].count,
      registeredPatrons,
      pendingFines: Number(pendingFines[0].total) || 0, // Ensure it's a number
    });
  } catch (error) {
    console.error('Error fetching librarian dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;