const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Register a New Student
router.post("/register", async (req, res) => {
    try {
        const { regNumber, name, phone, email, department } = req.body;

        // Validate required fields
        if (!regNumber || !name || !phone || !email || !department) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if student already exists
        const [existingStudent] = await db.query(
            "SELECT id FROM students WHERE reg_number = ? OR email = ?",
            [regNumber, email]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({ message: "Student with this Registration Number or Email already exists." });
        }

        // Insert into students table
        const [result] = await db.query(
            "INSERT INTO students (reg_number, name, phone, email, department) VALUES (?, ?, ?, ?, ?)",
            [regNumber, name, phone, email, department]
        );

        // Send successful response
        res.status(201).json({
            message: "Student registered successfully.",
            studentId: result.insertId,
        });
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Search for students
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;

        // Prevent empty queries from triggering a search
        if (!query || query.trim() === "") {
            return res.json([]); // Return an empty array if no query is provided
        }

        // Search students by name, registration number, or email
        const [students] = await db.query(
            "SELECT * FROM students WHERE reg_number LIKE ? OR name LIKE ? OR email LIKE ?",
            [`%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.json(students);
    } catch (error) {
        console.error("Error searching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
