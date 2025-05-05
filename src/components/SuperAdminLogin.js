import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SuperAdminLogin.css";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("🔹 Sending Login Request...");
      const response = await axios.post("http://localhost:5000/api/auth/super-admin-login", {
        email,
        password,
      });
    
      console.log("✅ Response Data:", response.data); // Debug API Response
    
      if (response.data.accessToken) {
        localStorage.setItem("superAdminToken", response.data.accessToken);
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("role", "super_admin");
    
        console.log("✅ Token Stored, Redirecting...");
        navigate("/");
      } else {
        console.log("🚨 No Token Received", response.data);
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("🚨 Login Failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed. Check your credentials.");
    }
    
  };

  return (
    <div className="login-container">
      <h2>Librarian Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default SuperAdminLogin;
