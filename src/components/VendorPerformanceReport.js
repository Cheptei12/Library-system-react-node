import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert, Container, Button } from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly
import logo from "../logo.jpeg";

const VendorPerformanceReport = () => {
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendorPerformance = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/reports/vendor-performance");
        setVendorPerformance(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching vendor performance report:", error);
        setError("Failed to load vendor performance report.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorPerformance();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, "JPEG", 10, 10, 30, 30);
      doc.text("UOE Library - Vendor Performance Report", 50, 20);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 30);

      const tableData = vendorPerformance.map(row => [
        row.vendor_name,
        row.total_orders,
        row.total_books_ordered,
        row.total_books_received,
        row.delivery_rate.toFixed(2) + "%",
      ]);
      autoTable(doc, { // Use autoTable directly
        startY: 50,
        head: [["Vendor Name", "Total Orders", "Total Books Ordered", "Total Books Received", "Delivery Rate (%)"]],
        body: tableData,
      });
      doc.save("vendor_performance_report.pdf");
    };
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h2 className="mb-0">Vendor Performance Report</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading...</p>
            </div>
          ) : vendorPerformance.length === 0 ? (
            <Alert variant="info">No vendor performance data found.</Alert>
          ) : (
            <>
              <Button variant="success" className="mb-3" onClick={downloadPDF}>
                Download PDF
              </Button>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Total Orders</th>
                    <th>Total Books Ordered</th>
                    <th>Total Books Received</th>
                    <th>Delivery Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorPerformance.map((vendor) => (
                    <tr key={vendor.vendor_name}>
                      <td>{vendor.vendor_name}</td>
                      <td>{vendor.total_orders}</td>
                      <td>{vendor.total_books_ordered}</td>
                      <td>{vendor.total_books_received}</td>
                      <td>{vendor.delivery_rate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VendorPerformanceReport;