const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get borrowed books by reg_number or employee_number
router.get("/borrowedBooks/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Check both reg_number and employee_number
        const query = `
            SELECT 
                b.id,
                b.isbn,
                bk.title,
                bk.author,
                b.borrow_date,
                b.due_date
            FROM borrowed_books b
            INNER JOIN books bk ON b.isbn = bk.isbn
            WHERE 
                (b.reg_number = ? OR b.employee_number = ?)
                AND b.status = 'borrowed'
        `;

        const [results] = await db.execute(query, [userId, userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No borrowed books found for this user." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching borrowed books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
