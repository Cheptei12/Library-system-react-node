import React, { useState } from "react";
import axios from "axios";  // Import axios for API calls

const RegisterStudent = () => {
  const [student, setStudent] = useState({
    regNumber: "",
    name: "",
    phone: "",
    email: "",
    department: "",
  });
  const [message, setMessage] = useState("");  // Success/Error message

  // Updated departments to populate the dropdown
  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Engineering",
    "Economics",
  ];

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post("http://localhost:5000/api/students/register", student);
      
      setMessage(response.data.message);
      setStudent({ regNumber: "", name: "", phone: "", email: "", department: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error registering student.");
    }
  };

  return (
    <div className="form-container">
      <h2>Register Student</h2>
      {message && <p>{message}</p>}  {/* Display success/error message */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="regNumber"
          placeholder="Registration Number"
          value={student.regNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={student.name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={student.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={student.email}
          onChange={handleChange}
          required
        />
        <select
          name="department"
          value={student.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterStudent;
