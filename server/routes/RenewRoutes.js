const express = require("express");
const router = express.Router();
const db = require("../config/db"); // MySQL database connection

// ✅ Get borrowed books by student registration number
router.get("/borrowed-books/:regNumber(*)", async (req, res) => {
    try {
        const { regNumber } = req.params;
        console.log(`📖 Fetching borrowed books for student: ${regNumber}`);

        const query = `
            SELECT 
                b.id, 
                b.isbn, 
                bk.title, 
                b.due_date 
            FROM borrowed_books b
            INNER JOIN books bk ON b.isbn = bk.isbn
            WHERE b.reg_number = ? AND b.status = 'borrowed'
        `;
        
        const [results] = await db.execute(query, [regNumber]);

        if (results.length === 0) {
            console.log(`⚠️ No borrowed books found for ${regNumber}`);
            return res.status(404).json({ message: "No borrowed books found for this student." });
        }

        res.json(results);
    } catch (error) {
        console.error("❌ Error fetching borrowed books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Renew a book (extend due date by 14 days)
router.post("/renew-book", async (req, res) => {
    try {
        const { bookId, librarianId, superAdminId } = req.body;

        console.log("🔍 Renewal Request Received:", req.body); // Debugging

        if (!bookId) {
            return res.status(400).json({ success: false, message: "Book ID is required" });
        }

        if (!librarianId && !superAdminId) {
            console.log("❌ Unauthorized request: No librarian or super admin ID provided.");
            return res.status(403).json({ success: false, message: "Unauthorized: Must be a librarian or super admin" });
        }

        console.log(`🔄 Renewing book ID: ${bookId} by user ${librarianId || superAdminId}`);

        const updateQuery = `UPDATE borrowed_books SET due_date = DATE_ADD(due_date, INTERVAL 14 DAY) WHERE id = ?`;
        const [result] = await db.execute(updateQuery, [bookId]);

        if (result.affectedRows > 0) {
            console.log(`✅ Book ID ${bookId} successfully renewed.`);
            return res.json({ success: true, message: "Book renewed successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Book not found or cannot be renewed" });
        }
    } catch (error) {
        console.error("❌ Error renewing book:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;
