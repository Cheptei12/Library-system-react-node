import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert, Container, Button } from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly
import logo from "../logo.jpeg";

const ReceivedBooksReport = () => {
  const [receivedBooks, setReceivedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceivedBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/reports/received-books");
        setReceivedBooks(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching received books report:", error);
        setError("Failed to load received books report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReceivedBooks();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, "JPEG", 10, 10, 30, 30);
      doc.text("UOE Library - Received Books Report", 50, 20);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 30);

      const tableData = receivedBooks.map(row => [
        row.receive_id,
        row.book_title,
        row.vendor_name,
        row.quantity,
        new Date(row.received_date).toLocaleDateString(),
      ]);
      autoTable(doc, { // Use autoTable directly
        startY: 50,
        head: [["Receive ID", "Book Title", "Vendor", "Quantity", "Received Date"]],
        body: tableData,
      });
      doc.save("received_books_report.pdf");
    };
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h2 className="mb-0">Received Books Report</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading...</p>
            </div>
          ) : receivedBooks.length === 0 ? (
            <Alert variant="info">No received books found.</Alert>
          ) : (
            <>
              <Button variant="success" className="mb-3" onClick={downloadPDF}>
                Download PDF
              </Button>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Receive ID</th>
                    <th>Book Title</th>
                    <th>Vendor</th>
                    <th>Quantity</th>
                    <th>Received Date</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedBooks.map((receipt) => (
                    <tr key={receipt.receive_id}>
                      <td>{receipt.receive_id}</td>
                      <td>{receipt.book_title}</td>
                      <td>{receipt.vendor_name}</td>
                      <td>{receipt.quantity}</td>
                      <td>{new Date(receipt.received_date).toLocaleDateString()}</td>
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

export default ReceivedBooksReport;