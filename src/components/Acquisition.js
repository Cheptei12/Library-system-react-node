import React from "react";
import "./Acquisition.css";
import { FaBoxOpen, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Acquisition = () => {
  const navigate = useNavigate();
  
  return (
    <div className="acquisition-container">
      <h2>Acquisitions</h2>

      {/* Acquisition Actions */}
      <div className="acquisition-actions">
        <button className="acquisition-btn" onClick={() => navigate("/order-books")}>
          <FaBoxOpen /> Order Books
        </button>
        <button className="acquisition-btn" onClick={() => navigate("/receive-books")}>
          <FaBoxOpen /> Receive Books
        </button>
        <button className="acquisition-btn" onClick={() => navigate("/vendor-management")}>
          <FaBoxOpen /> Vendor Management
        </button>
      </div>
      
      {/* Acquisition Reports */}
      <h3 className="report-header">Acquisition Reports</h3>
      <div className="acquisition-reports">
        <button className="report-btn" onClick={() => navigate("/reports/ordered-books")}>
          <FaFileAlt /> Ordered Books Report
        </button>
        <button className="report-btn" onClick={() => navigate("/reports/received-books")}>
          <FaFileAlt /> Received Books Report
        </button>
        <button className="report-btn" onClick={() => navigate("/reports/vendor-performance")}>
          <FaFileAlt /> Vendor Performance Report
        </button>
      </div>
    </div>
  );
};

export default Acquisition;
