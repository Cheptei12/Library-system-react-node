import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CheckInForm from "./CheckInForm";
import "./checkin.css";

const CheckIn = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBorrowedBooks = useCallback(async () => {
        try {
            console.log("🔍 Fetching borrowed books...");
            const response = await axios.get("http://localhost:5000/api/circulation/borrowed-books");
            console.log("📚 Fetched Books:", response.data);
            setBorrowedBooks(response.data);
            setFilteredBooks(response.data);
        } catch (error) {
            console.error("❌ Error fetching borrowed books:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to fetch borrowed books.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBorrowedBooks();
    }, [fetchBorrowedBooks]);

    useEffect(() => {
        const filtered = borrowedBooks.filter(
            (book) =>
                book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (book.reg_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (book.employee_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (book.borrower_name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBooks(filtered);
    }, [searchQuery, borrowedBooks]);

    const handleCheckIn = async (isbn, reg_number, employee_number, user_type) => {
        if (window.confirm("Are you sure you want to check in this book?")) {
            try {
                console.log("🔹 Sending Check-In Request:", { isbn, reg_number, employee_number, user_type });
                await axios.post(
                    "http://localhost:5000/api/circulation/checkin",
                    { isbn, reg_number, employee_number, user_type },
                    { headers: { "Content-Type": "application/json" } }
                );
                alert("✅ Book checked in successfully!");
                await fetchBorrowedBooks();
            } catch (error) {
                console.error("❌ Error checking in book:", error.response?.data || error.message);
                alert(error.response?.data?.message || "⚠️ Failed to check in the book.");
            }
        }
    };

    return (
        <div className="container my-5 checkin-container">
            <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white d-flex align-items-center">
                    <i className="bi bi-book-half me-2"></i>
                    <h2 className="mb-0">Check In Books</h2>
                </div>
                <div className="card-body p-4">
                    {/* Search Bar */}
                    <div className="input-group mb-4">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search by ISBN, Title, Borrower ID, or Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading borrowed books...</p>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="bi bi-info-circle me-2"></i>
                            No borrowed books found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">
                                            <i className="bi bi-upc-scan me-1"></i> ISBN
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-book me-1"></i> Title
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-person me-1"></i> Borrower
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-card-list me-1"></i> Borrower ID
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-person-badge me-1"></i> User Type
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-calendar-date me-1"></i> Due Date
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-wallet2 me-1"></i> Fine
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-flag me-1"></i> Status
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-gear me-1"></i> Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBooks.map((book) => (
                                        <tr key={book.id} className={`fade-in ${book.status === "overdue" ? "overdue-row" : ""}`}>
                                            <td>{book.isbn}</td>
                                            <td>{book.title || "N/A"}</td>
                                            <td>{book.borrower_name || "Unknown"}</td>
                                            <td>{book.user_type === "student" ? book.reg_number : book.employee_number}</td>
                                            <td>{book.user_type}</td>
                                            <td>{new Date(book.due_date).toLocaleDateString("en-GB")}</td>
                                            <td>
                                                {typeof book.fine_amount === "number" && book.fine_amount > 0
                                                    ? `₦${book.fine_amount.toFixed(2)}`
                                                    : "₦0.00"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        book.status === "overdue" ? "bg-danger" : "bg-warning"
                                                    }`}
                                                >
                                                    {book.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() =>
                                                        handleCheckIn(
                                                            book.isbn,
                                                            book.reg_number,
                                                            book.employee_number,
                                                            book.user_type
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-check-circle me-1"></i> Check In
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Check-In Form */}
                    <div className="mt-4">
                        <CheckInForm onCheckInSuccess={fetchBorrowedBooks} />
                    </div>

                    {/* Back Button */}
                    <div className="mt-4">
                        <button className="btn btn-outline-primary" onClick={() => navigate("/circulation")}>
                            <i className="bi bi-arrow-left me-1"></i> Back to Circulation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;