import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CirculationReports = ({ reportType }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/reports/${reportType}`);
        setReportData(response.data);
      } catch (error) {
        setError("Failed to load report: " + (error.response?.data?.message || error.message));
        console.error("Error fetching report:", error);
      }
      setLoading(false);
    };

    fetchReport();
  }, [reportType]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${reportType}`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });

      if (response.status !== 200) {
        throw new Error("Failed to download report");
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const renderTable = () => {
    if (!reportData || reportData.length === 0) {
      return <p>No data available for this report.</p>;
    }

    const headers = Object.keys(reportData[0]).map((key) => key.replace(/([A-Z])/g, " $1").toUpperCase());

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((value, i) => (
                <td key={i}>{value || "N/A"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="report-container">
      <div style={{ paddingTop: "80px", paddingLeft: "20px", paddingRight: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>
          Report: {reportType.replace("-", " ").toUpperCase()}
        </h2>

        {loading && <p>Loading report data...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && renderTable()}

        {!loading && !error && (
          <Button
            onClick={handleDownload}
            variant="primary"
            style={{ marginTop: "20px" }}
          >
            Download Report (PDF)
          </Button>
        )}
      </div>
    </div>
  );
};

export default CirculationReports;