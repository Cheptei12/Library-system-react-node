import React, { useState } from "react";
import RegisterStudent from "./RegisterStudent"; // Student registration form
import RegisterStaff from "./RegisterStaff"; // Staff registration form

const RegisterUser = () => {
  const [isStudent, setIsStudent] = useState(true); // Toggle between student and staff registration

  const toggleForm = () => {
    setIsStudent(!isStudent); // Toggle between student and staff registration
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Register User</h2>

      {/* Toggle Button to Switch Between Forms */}
      <div className="text-center mb-4">
        <button 
          className="btn btn-primary" 
          onClick={toggleForm}
        >
          {isStudent ? "Switch to Staff Registration" : "Switch to Student Registration"}
        </button>
      </div>

      {/* Conditional Rendering of Forms */}
      <div className="card p-4 shadow-sm">
        {isStudent ? (
          <RegisterStudent />
        ) : (
          <RegisterStaff />
        )}
      </div>
    </div>
  );
};

export default RegisterUser;
