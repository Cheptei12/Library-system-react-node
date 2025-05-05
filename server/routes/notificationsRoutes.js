const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT and extract user info
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // Assuming user has reg_number or employee_number
    next();
  });
};

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.reg_number || req.user.employee_number; // Adjust based on your JWT payload
    const userType = req.user.role === "staff" ? "staff" : "student"; // Adjust based on your JWT

    const [rows] = await db.execute(
      `
      SELECT 
        id,
        'Overdue Book' AS title,
        CONCAT('Book with ISBN ', isbn, ' is overdue. Please return it.') AS message,
        'overdue' AS type,
        borrow_date AS created_at
      FROM borrowed_books
      WHERE (reg_number = ? AND user_type = 'student' AND status = 'overdue')
        OR (employee_number = ? AND user_type = 'staff' AND status = 'overdue')
      UNION
      SELECT 
        id,
        'Due Soon' AS title,
        CONCAT('Book with ISBN ', isbn, ' is due on ', DATE(due_date)) AS message,
        'info' AS type,
        borrow_date AS created_at
      FROM borrowed_books
      WHERE (reg_number = ? AND user_type = 'student' AND status = 'borrowed' AND due_date <= DATE_ADD(NOW(), INTERVAL 2 DAY))
        OR (employee_number = ? AND user_type = 'staff' AND status = 'borrowed' AND due_date <= DATE_ADD(NOW(), INTERVAL 2 DAY))
      `,
      [userId, userId, userId, userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

module.exports = router;