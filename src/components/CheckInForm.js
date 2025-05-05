import { useState } from "react";
import axios from "axios";
import "./CheckInForm.css";

const CheckInForm = ({ onCheckInSuccess }) => {
    const [isbn, setIsbn] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [userType, setUserType] = useState("student");
    const [message, setMessage] = useState(null);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!isbn || !userType || (userType === "student" && !regNumber) || (userType === "staff" && !employeeNumber)) {
            setMessage({ type: "error", text: "All required fields must be filled." });
            return;
        }

        try {
            const requestData = {
                isbn,
                reg_number: userType === "student" ? regNumber : null,
                employee_number: userType === "staff" ? employeeNumber : null,
                user_type: userType,
            };

            console.log("📤 Check-In Request:", requestData);

            const response = await axios.post(
                "http://localhost:5000/api/circulation/checkin",
                requestData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setMessage({ type: "success", text: response.data.message });
            setIsbn("");
            setRegNumber("");
            setEmployeeNumber("");
            setUserType("student");
            if (onCheckInSuccess) {
                await onCheckInSuccess();
            }
        } catch (error) {
            console.error("❌ Check-In Error:", error.response?.data);
            setMessage({
                type: "error",
                text: error.response?.data?.message || "An error occurred.",
            });
        }
    };

    return (
        <div className="checkin-form">
            <h3>Manual Check In</h3>
            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            <form onSubmit={handleCheckIn}>
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
                <label>ISBN:</label>
                <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Enter ISBN"
                    required
                />
                <button type="submit">Check In</button>
            </form>
        </div>
    );
};

export default CheckInForm;