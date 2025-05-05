const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getBorrowedBooks, checkInBook } = require("../controllers/circulationController");

console.log("Imported from circulationController:", { getBorrowedBooks, checkInBook });

// Fetch Borrowed Books (no authentication)
router.get("/borrowed-books", getBorrowedBooks);

// Check Out a Book (no authentication)
router.post("/checkout", async (req, res) => {
    try {
        console.log("🔹 Received Checkout Request:", req.body);

        const { isbn, reg_number, employee_number, user_type, due_date } = req.body;

        if (!isbn || !user_type || !due_date || (user_type === "student" && !reg_number) || (user_type === "staff" && !employee_number)) {
            return res.status(400).json({ message: "All required fields are required." });
        }

        if (!["student", "staff"].includes(user_type)) {
            return res.status(400).json({ message: "Invalid user type." });
        }

        console.log("🔍 Checking book availability...");

        // Check if book exists and is available
        const [bookRows] = await db.query("SELECT available_copies FROM books WHERE isbn = ?", [isbn]);
        if (!bookRows || bookRows.length === 0 || bookRows[0].available_copies <= 0) {
            return res.status(400).json({ message: "Book is not available." });
        }

        console.log("✅ Book is available.");

        // Validate borrower
        if (user_type === "student") {
            const [studentRows] = await db.query("SELECT reg_number FROM students WHERE reg_number = ?", [reg_number]);
            if (!studentRows || studentRows.length === 0) {
                return res.status(404).json({ message: "Student not found." });
            }
        } else {
            const [staffRows] = await db.query(
                "SELECT employee_number FROM staff WHERE employee_number = ? AND status = 'Active'",
                [employee_number]
            );
            if (!staffRows || staffRows.length === 0) {
                return res.status(404).json({ message: "Staff member not found or inactive." });
            }
        }

        console.log(`✅ ${user_type.charAt(0).toUpperCase() + user_type.slice(1)} found. Proceeding with checkout...`);

        // Insert into borrowed_books (librarian_id and super_admin_id are nullable)
        await db.query(
            `INSERT INTO borrowed_books (isbn, reg_number, employee_number, user_type, due_date, status)
             VALUES (?, ?, ?, ?, ?, 'borrowed')`,
            [isbn, reg_number, employee_number, user_type, due_date]
        );

        // Decrease available copies
        await db.query("UPDATE books SET available_copies = available_copies - 1 WHERE isbn = ?", [isbn]);

        res.status(201).json({ message: "Book checked out successfully." });
    } catch (error) {
        console.error("🚨 Error in Checkout:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Check-In Route (no authentication)
router.post("/checkin", checkInBook);

module.exports = router;