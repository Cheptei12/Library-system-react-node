import React, { useState } from "react";
import axios from "axios";  // Import axios for API calls

const RegisterStaff = () => {
  const [staff, setStaff] = useState({
    employeeNumber: "",
    name: "",
    phone: "",
    email: "",
    department: "",
    role: "",
    hireDate: "",
  });
  const [message, setMessage] = useState("");  // Success/Error message

  const handleChange = (e) => {
    setStaff({ ...staff, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/staff/register", staff);
      setMessage(response.data.message);
      setStaff({
        employeeNumber: "",
        name: "",
        phone: "",
        email: "",
        department: "",
        role: "",
        hireDate: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error registering staff.");
    }
  };

  return (
    <div className="form-container">
      <h2>Register Staff</h2>
      {message && <p>{message}</p>} {/* Display success/error message */}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="employeeNumber" className="form-label">Employee Number</label>
          <input
            type="text"
            id="employeeNumber"
            name="employeeNumber"
            className="form-control"
            placeholder="Employee Number"
            value={staff.employeeNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            placeholder="Full Name"
            value={staff.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-control"
            placeholder="Phone Number"
            value={staff.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={staff.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Department Dropdown */}
        <div className="mb-3">
          <label htmlFor="department" className="form-label">Department</label>
          <select
            id="department"
            name="department"
            className="form-select"
            value={staff.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Engineering">Engineering</option>
            <option value="Economics">Economics</option>
            {/* Add more departments as needed */}
          </select>
        </div>

        {/* Role Dropdown */}
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select
            id="role"
            name="role"
            className="form-select"
            value={staff.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Administrator">Administrator</option>
            <option value="Technician">Technician</option>
            <option value="Library Assistant">Library Assistant</option>
            <option value="Head of Department">Head of Department</option>
            {/* Add more roles as needed */}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="hireDate" className="form-label">Hire Date</label>
          <input
            type="date"
            id="hireDate"
            name="hireDate"
            className="form-control"
            value={staff.hireDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
};

export default RegisterStaff;
