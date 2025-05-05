import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LibrarianLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/auth/librarian-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Login failed: ${response.status} - ${text}`);
            }

            const data = await response.json();
            console.log("Login response data:", data);
            localStorage.setItem("isLoggedIn", "true"); // Set login flag
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("role", data.role);
            console.log("Stored in localStorage:", {
                isLoggedIn: localStorage.getItem("isLoggedIn"),
                user_id: localStorage.getItem("user_id"),
                role: localStorage.getItem("role"),
            });
            navigate("/"); // Redirect to dashboard
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-sm p-4" style={{ width: "400px" }}>
                <h2 className="text-center mb-4">Librarian Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LibrarianLogin;