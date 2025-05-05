// cataloging.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaTags } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./cataloging.css"; // Optional custom CSS

const catalogingModules = [
  { name: "Book Management", icon: <FaBook />, path: "/cataloging/book-management" },
  { name: "Classification & Categories", icon: <FaTags />, path: "/cataloging/classification-categories" },
];

const Cataloging = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Cataloging</h2>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {catalogingModules.map((module) => (
          <div key={module.name} className="col">
            <div
              className="card cataloging-card h-100 text-center shadow-sm"
              onClick={() => navigate(module.path)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <span className="display-4 mb-3">{module.icon}</span>
                <h5 className="card-title">{module.name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cataloging;