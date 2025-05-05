const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Register a New Staff Member
router.post("/register", async (req, res) => {
    try {
        const { employeeNumber, name, phone, email, department, role, hireDate } = req.body;

        // Validate required fields
        if (!employeeNumber || !name || !phone || !email || !department || !role || !hireDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if staff member already exists
        const [existingStaff] = await db.query(
            "SELECT id FROM staff WHERE employee_number = ? OR email = ?",
            [employeeNumber, email]
        );

        if (existingStaff.length > 0) {
            return res.status(400).json({ message: "Staff member with this Employee Number or Email already exists." });
        }

        // Insert into staff table
        const [result] = await db.query(
            "INSERT INTO staff (employee_number, name, phone, email, department, role, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [employeeNumber, name, phone, email, department, role, hireDate]
        );

        // Send successful response
        res.status(201).json({
            message: "Staff registered successfully.",
            staffId: result.insertId,
        });
    } catch (error) {
        console.error("Error registering staff:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// Search for staff
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;

        // Prevent empty queries from triggering a search
        if (!query || query.trim() === "") {
            return res.json([]); // Return an empty array if no query is provided
        }

        // Search staff by employee number, name, or email
        const [staff] = await db.query(
            "SELECT * FROM staff WHERE employee_number LIKE ? OR name LIKE ? OR email LIKE ?",
            [`%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.json(staff);
    } catch (error) {
        console.error("Error searching staff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
