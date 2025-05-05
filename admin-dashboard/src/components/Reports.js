// src/components/Reports.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Dropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilter, faChartLine } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../logo.jpeg';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState('overdueBooks');
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reportTypes = {
        overdueBooks: 'Overdue Books',
        checkedOutBooks: 'Checked-Out Books',
        returnedBooks: 'Returned Books',
        fineCollection: 'Fine Collection',
        orderedBooks: 'Ordered Books',
        receivedBooks: 'Received Books',
        vendorPerformance: 'Vendor Performance',
    };

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                const endpoints = {
                    overdueBooks: 'overdue-books',
                    checkedOutBooks: 'checked-out-books',
                    returnedBooks: 'returned-books',
                    fineCollection: 'fine-collection',
                    orderedBooks: 'ordered-books',
                    receivedBooks: 'received-books',
                    vendorPerformance: 'vendor-performance',
                };

                const responses = await Promise.all(
                    Object.entries(endpoints).map(([key, endpoint]) =>
                        axios.get(`http://localhost:5000/api/reports/${endpoint}`).then(res => {
                            console.log(`${key} Data:`, res.data); // Debug log
                            return { key, data: res.data };
                        })
                    )
                );

                const newReportData = responses.reduce((acc, { key, data }) => {
                    acc[key] = Array.isArray(data) ? data : [];
                    return acc;
                }, {});
                console.log("Report Data State:", newReportData); // Debug log
                setReportData(newReportData);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to load report data.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const toKebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

    const handleBlobDownload = async (reportType) => {
        const apiReportType = toKebabCase(reportType);
        try {
            const response = await axios.get(`http://localhost:5000/api/reports/${apiReportType}`, {
                responseType: 'blob',
                headers: { Accept: 'application/pdf' },
            });
            if (response.status !== 200) throw new Error('Failed to download report');
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${apiReportType}-report.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report. Ensure the backend server is running.');
        }
    };

    const handlePDFDownload = (reportType) => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo;

        img.onload = () => {
            doc.addImage(img, 'JPEG', 10, 10, 30, 30);
            doc.text(`UOE Library - ${reportTypes[reportType]} Report`, 50, 20);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 30);

            const data = reportData[reportType] || [];
            let tableData, head;

            switch (reportType) {
                case 'orderedBooks':
                    tableData = data.map(row => [
                        row.order_id,
                        row.book_title,
                        row.vendor_name,
                        row.quantity,
                        new Date(row.order_date).toLocaleDateString(),
                        row.status,
                    ]);
                    head = [['Order ID', 'Book Title', 'Vendor', 'Quantity', 'Order Date', 'Status']];
                    break;
                case 'receivedBooks':
                    tableData = data.map(row => [
                        row.receive_id,
                        row.book_title,
                        row.vendor_name,
                        row.quantity,
                        new Date(row.received_date).toLocaleDateString(),
                    ]);
                    head = [['Receive ID', 'Book Title', 'Vendor', 'Quantity', 'Received Date']];
                    break;
                case 'vendorPerformance':
                    tableData = data.map(row => [
                        row.vendor_name,
                        row.total_orders,
                        row.total_books_ordered,
                        row.total_books_received,
                        row.delivery_rate.toFixed(2) + '%',
                    ]);
                    head = [['Vendor Name', 'Total Orders', 'Total Books Ordered', 'Total Books Received', 'Delivery Rate (%)']];
                    break;
                default:
                    return;
            }

            autoTable(doc, { startY: 50, head, body: tableData });
            doc.save(`${toKebabCase(reportType)}_report.pdf`);
        };
    };

    const renderReportDetails = () => {
        const data = reportData[selectedReport] || [];
        if (loading) return <p>Loading...</p>;
        if (error) return <p style={{ color: 'red' }}>{error}</p>;
        if (!data.length) return <p>No data available for this report.</p>;

        switch (selectedReport) {
            case 'overdueBooks':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>ID</th><th>Title</th><th>ISBN</th><th>Due Date</th><th>Borrowed By</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.ID}>
                                    <td>{item.ID}</td>
                                    <td>{item.Title}</td>
                                    <td>{item.ISBN}</td>
                                    <td>{item["Due Date"]}</td>
                                    <td>{item["Borrowed By"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'checkedOutBooks':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>ID</th><th>Title</th><th>ISBN</th><th>Due Date</th><th>Borrowed By</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.ID}>
                                    <td>{item.ID}</td>
                                    <td>{item.Title}</td>
                                    <td>{item.ISBN}</td>
                                    <td>{item["Due Date"]}</td>
                                    <td>{item["Borrowed By"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'returnedBooks':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>ID</th><th>Title</th><th>ISBN</th><th>Return Date</th><th>Returned By</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.ID}>
                                    <td>{item.ID}</td>
                                    <td>{item.Title}</td>
                                    <td>{item.ISBN}</td>
                                    <td>{item["Return Date"]}</td>
                                    <td>{item["Returned By"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'fineCollection':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>ID</th><th>Student Name</th><th>Fine Amount</th><th>Paid Date</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.ID}>
                                    <td>{item.ID}</td>
                                    <td>{item["Student Name"]}</td>
                                    <td>{item["Fine Amount"]}</td>
                                    <td>{item["Paid Date"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'orderedBooks':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>Order ID</th><th>Book Title</th><th>Vendor</th><th>Quantity</th><th>Order Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.order_id}>
                                    <td>{item.order_id}</td>
                                    <td>{item.book_title}</td>
                                    <td>{item.vendor_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{new Date(item.order_date).toLocaleDateString()}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'receivedBooks':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>Receive ID</th><th>Book Title</th><th>Vendor</th><th>Quantity</th><th>Received Date</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.receive_id}>
                                    <td>{item.receive_id}</td>
                                    <td>{item.book_title}</td>
                                    <td>{item.vendor_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{new Date(item.received_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'vendorPerformance':
                return (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr><th>Vendor Name</th><th>Total Orders</th><th>Total Books Ordered</th><th>Total Books Received</th><th>Delivery Rate (%)</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.vendor_name}>
                                    <td>{item.vendor_name}</td>
                                    <td>{item.total_orders}</td>
                                    <td>{item.total_books_ordered}</td>
                                    <td>{item.total_books_received}</td>
                                    <td>{item.delivery_rate.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            default:
                return null;
        }
    };

    return (
        <Container fluid>
            <h2 className="mb-4 text-primary fw-bold">
                <FontAwesomeIcon icon={faChartLine} className="me-2" /> Reports
            </h2>

            <Row className="mb-4">
                {Object.entries(reportData).map(([key, value]) => (
                    <Col md={4} lg={3} className="mb-3" key={key}>
                        <Card
                            className="shadow-sm border-0"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => setSelectedReport(key)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Card.Body className="text-center">
                                <Card.Title className="text-muted">{reportTypes[key]}</Card.Title>
                                <Card.Text className="fw-bold fs-3 text-primary">
                                    {value.length || 0}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="mb-4 align-items-center">
                <Col md={6}>
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" id="report-select">
                            {reportTypes[selectedReport]}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {Object.entries(reportTypes).map(([key, title]) => (
                                <Dropdown.Item key={key} onClick={() => setSelectedReport(key)}>
                                    {title}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="outline-secondary" className="me-2">
                        <FontAwesomeIcon icon={faFilter} /> Filter
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (['overdueBooks', 'checkedOutBooks', 'returnedBooks', 'fineCollection'].includes(selectedReport)) {
                                handleBlobDownload(selectedReport);
                            } else if (['orderedBooks', 'receivedBooks', 'vendorPerformance'].includes(selectedReport)) {
                                handlePDFDownload(selectedReport);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faDownload} /> Download Report
                    </Button>
                </Col>
            </Row>

            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{reportTypes[selectedReport]} Details</h5>
                </Card.Header>
                <Card.Body>{renderReportDetails()}</Card.Body>
            </Card>
        </Container>
    );
};

export default Reports;