const db = require("../config/db");

// Get Borrowed Books Function
const getBorrowedBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT 
                bb.id, 
                bb.isbn, 
                bb.reg_number, 
                bb.employee_number, 
                bb.user_type, 
                bb.due_date, 
                bb.status, 
                COALESCE(bb.fine_amount, 0) AS fine_amount,
                b.title,
                CASE 
                    WHEN bb.user_type = 'student' THEN s.name
                    WHEN bb.user_type = 'staff' THEN st.name
                    ELSE NULL 
                END AS borrower_name
            FROM borrowed_books bb
            JOIN books b ON bb.isbn = b.isbn
            LEFT JOIN students s ON bb.reg_number = s.reg_number AND bb.user_type = 'student'
            LEFT JOIN staff st ON bb.employee_number = st.employee_number AND bb.user_type = 'staff'
            WHERE bb.status IN ('borrowed', 'overdue')
        `);
        // Convert fine_amount to number
        const formattedBooks = books.map(book => ({
            ...book,
            fine_amount: Number(book.fine_amount) || 0,
        }));
        return res.status(200).json(formattedBooks);
    } catch (error) {
        console.error("🚨 Error fetching borrowed books:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Check-In Function
const checkInBook = async (req, res) => {
    const { isbn, reg_number, employee_number, user_type } = req.body;

    if (!isbn || !user_type || (!reg_number && !employee_number)) {
        return res.status(400).json({ message: "ISBN, User Type, and either Registration Number or Employee Number are required" });
    }

    if (!["student", "staff"].includes(user_type)) {
        return res.status(400).json({ message: "Invalid user type" });
    }

    try {
        // Check if the book is currently borrowed or overdue
        const queryParams = user_type === "student" ? [isbn, reg_number, "student"] : [isbn, employee_number, "staff"];
        const field = user_type === "student" ? "reg_number = ?" : "employee_number = ?";
        const [borrowed] = await db.query(
            `SELECT * FROM borrowed_books WHERE isbn = ? AND ${field} AND user_type = ? AND status IN ('borrowed', 'overdue') LIMIT 1`,
            queryParams
        );

        if (borrowed.length === 0) {
            return res.status(404).json({ message: "No matching borrowed book found" });
        }

        // Check if the book exists in the books table
        const [book] = await db.query("SELECT * FROM books WHERE isbn = ?", [isbn]);
        if (book.length === 0) {
            return res.status(404).json({ message: "Book not found in library" });
        }

        // Update fine_amount if overdue
        const dueDate = new Date(borrowed[0].due_date);
        const today = new Date();
        let fine_amount = Number(borrowed[0].fine_amount) || 0;
        if (today > dueDate && borrowed[0].status !== "overdue") {
            console.log(`⚠️ Overdue return by ${user_type} for book ${isbn}`);
            fine_amount += 10.00; // Adjust as needed
            await db.query(
                "UPDATE borrowed_books SET status = 'overdue', fine_amount = ? WHERE isbn = ? AND user_type = ?",
                [fine_amount, isbn, user_type]
            );
        }

        // Mark the book as returned
        await db.query(
            `UPDATE borrowed_books 
             SET status = 'returned', returned_at = NOW(), fine_amount = ? 
             WHERE isbn = ? AND ${field} AND user_type = ?`,
            [fine_amount, ...queryParams]
        );

        // Increase available copies
        await db.query(
            "UPDATE books SET available_copies = available_copies + 1 WHERE isbn = ?",
            [isbn]
        );

        return res.status(200).json({ message: "Book successfully checked in" });
    } catch (error) {
        console.error("🚨 Error checking in book:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getBorrowedBooks, checkInBook };