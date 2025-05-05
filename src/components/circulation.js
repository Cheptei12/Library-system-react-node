import { useNavigate } from "react-router-dom";
import { 
  FaExchangeAlt, 
  FaUndo, 
  FaSync, 
  FaUsers, 
  FaMoneyBill, 
  FaCalendarCheck, 
  FaChartBar 
} from "react-icons/fa";
import "./circulation.css";

const circulationModules = [
  { name: "Check Out", icon: <FaExchangeAlt />, path: "/checkout" },
  { name: "Check In", icon: <FaUndo />, path: "/checkin" },
  { name: "Renew", icon: <FaSync />, path: "/renew" },
  { name: "Search Patrons", icon: <FaUsers />, path: "/search-patron" },
  { name: "Fine Management", icon: <FaMoneyBill />, path: "/fine-management" },
  
];

const circulationReports = [
  { name: "Overdue Books", icon: <FaChartBar />, path: "/reports/overdue-books" },
  { name: "Checked Out Books", icon: <FaChartBar />, path: "/reports/checked-out-books" },
  { name: "Returned Books", icon: <FaChartBar />, path: "/reports/returned-books" },
  { name: "Fine Collection Report", icon: <FaChartBar />, path: "/reports/fine-collection" },
];

const Circulation = () => {
  const navigate = useNavigate();

  return (
    <div className="circulation-container">
      <h2 className="circulation-title">Library Transactions</h2>
      
      {/* Circulation Modules Section */}
      <div className="circulation-grid">
        {circulationModules.map((module) => (
          <div
            key={module.name}
            className="circulation-item"
            onClick={() => navigate(module.path)}
          >
            <span className="circulation-icon">{module.icon}</span>
            <span>{module.name}</span>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <h3 className="circulation-subtitle">Library Transactions Reports</h3>
      <div className="circulation-grid">
        {circulationReports.map((report) => (
          <div
            key={report.name}
            className="circulation-item report-item"
            onClick={() => navigate(report.path)}
          >
            <span className="circulation-icon">{report.icon}</span>
            <span>{report.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Circulation;
