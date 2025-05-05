import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./checkOut.css";

const CheckOut = () => {
    const [isbn, setIsbn] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [userType, setUserType] = useState("student");
    const [dueDate, setDueDate] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleCheckOut = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!isbn || !dueDate || (userType === "student" && !regNumber) || (userType === "staff" && !employeeNumber)) {
            setError("All required fields are required.");
            return;
        }

        const requestData = {
            isbn,
            reg_number: userType === "student" ? regNumber : null,
            employee_number: userType === "staff" ? employeeNumber : null,
            user_type: userType,
            due_date: dueDate,
        };

        console.log("📤 Sending Request:", requestData);

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5000/api/circulation/checkout", requestData, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("✅ Server Response:", response.data);
            setMessage(response.data.message);
            setIsbn("");
            setRegNumber("");
            setEmployeeNumber("");
            setUserType("student");
            setDueDate("");
        } catch (err) {
            console.error("❌ Server Error:", err.response?.data);
            setError(err.response?.data?.message || "An error occurred while checking out the book.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <h2>Check Out Book</h2>
            <form onSubmit={handleCheckOut}>
                <label>User Type:</label>
                <select
                    value={userType}
                    onChange={(e) => {
                        setUserType(e.target.value);
                        setRegNumber("");
                        setEmployeeNumber("");
                    }}
                    required
                >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                </select>
                {userType === "student" ? (
                    <>
                        <label>Registration Number:</label>
                        <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="Enter Reg Number"
                            required
                        />
                    </>
                ) : (
                    <>
                        <label>Employee Number:</label>
                        <input
                            type="text"
                            value={employeeNumber}
                            onChange={(e) => setEmployeeNumber(e.target.value)}
                            placeholder="Enter Employee Number"
                            required
                        />
                    </>
                )}
                <label>Book ISBN:</label>
                <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                <label>Due Date:</label>
                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Check Out"}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <button className="back-btn" onClick={() => navigate("/")}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default CheckOut;