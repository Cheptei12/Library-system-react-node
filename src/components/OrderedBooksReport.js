import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert, Container, Button } from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly
import logo from "../logo.jpeg";

const OrderedBooksReport = () => {
  const [orderedBooks, setOrderedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderedBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/reports/ordered-books");
        setOrderedBooks(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching ordered books report:", error);
        setError("Failed to load ordered books report.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderedBooks();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, "JPEG", 10, 10, 30, 30);
      doc.text("UOE Library - Ordered Books Report", 50, 20);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 30);

      const tableData = orderedBooks.map(row => [
        row.order_id,
        row.book_title,
        row.vendor_name,
        row.quantity,
        new Date(row.order_date).toLocaleDateString(),
        row.status,
      ]);
      autoTable(doc, { // Use autoTable directly
        startY: 50,
        head: [["Order ID", "Book Title", "Vendor", "Quantity", "Order Date", "Status"]],
        body: tableData,
      });
      doc.save("ordered_books_report.pdf");
    };
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h2 className="mb-0">Ordered Books Report</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading...</p>
            </div>
          ) : orderedBooks.length === 0 ? (
            <Alert variant="info">No ordered books found.</Alert>
          ) : (
            <>
              <Button variant="success" className="mb-3" onClick={downloadPDF}>
                Download PDF
              </Button>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Book Title</th>
                    <th>Vendor</th>
                    <th>Quantity</th>
                    <th>Order Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedBooks.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.book_title}</td>
                      <td>{order.vendor_name}</td>
                      <td>{order.quantity}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>{order.status}</td>
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

export default OrderedBooksReport;