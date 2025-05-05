const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const db = require("../config/db");
const path = require("path");

// Function to draw a header with logo
const drawHeader = (doc, title) => {
    const logoPath = path.join(__dirname, "../public/logo.jpeg");
    try {
        doc.image(logoPath, 50, 30, { width: 80, height: 80 });
    } catch (error) {
        console.log("Error loading logo:", error);
    }
    doc.fontSize(18).font("Helvetica-Bold").text("UNIVERSITY OF ELDORET", { align: "center" });
    doc.fontSize(12).font("Helvetica").text("P.O. Box 1125-30100, Eldoret, Kenya", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveTo(50, 130).lineTo(550, 130).stroke();
};

// Function to draw a table in PDF
const drawTable = (doc, data, startX, startY, columnWidths, rowHeight) => {
    let y = startY;
    doc.font("Helvetica-Bold").fontSize(12);
    let x = startX;
    const headers = Object.keys(data[0]);

    headers.forEach((header, i) => {
        doc.text(header.toUpperCase(), x + 5, y + 5, { width: columnWidths[i], align: "left" });
        x += columnWidths[i];
    });

    doc.moveTo(startX, y).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y).stroke();
    y += rowHeight;

    doc.font("Helvetica").fontSize(10);
    data.forEach(row => {
        x = startX;
        Object.values(row).forEach((text, i) => {
            doc.text(String(text || "N/A"), x + 5, y + 5, { width: columnWidths[i], align: "left" });
            x += columnWidths[i];
        });
        doc.moveTo(startX, y).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y).stroke();
        y += rowHeight;
    });

    let currentX = startX;
    for (let i = 0; i <= headers.length; i++) {
        doc.moveTo(currentX, startY).lineTo(currentX, y).stroke();
        currentX += columnWidths[i] || 0;
    }
    doc.moveTo(startX, y).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y).stroke();
};

// Function to fetch report data
const fetchReportData = async (query) => {
    const [data] = await db.execute(query);
    return data;
};

// Function to generate PDF report
const generatePdfReport = (res, filename, title, data) => {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    drawHeader(doc, title);
    const columnWidths = [40, 120, 100, 100, 120];
    const startX = 50, startY = 150, rowHeight = 30;
    drawTable(doc, data, startX, startY, columnWidths, rowHeight);

    doc.end();
};

// Generic report handler
const handleReportRequest = async (req, res, reportType, query, title, filename) => {
    try {
        const data = await fetchReportData(query);
        if (data.length === 0) {
            return res.status(404).json({ message: "No data found for this report." });
        }

        if (req.headers.accept === "application/pdf") {
            generatePdfReport(res, filename, title, data);
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        console.error(`Error generating ${reportType} report:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Overdue Books Report
router.get("/reports/overdue-books", async (req, res) => {
    const query = `
        SELECT b.id AS ID, bk.title AS Title, bk.isbn AS ISBN, 
               DATE_FORMAT(b.due_date, '%Y-%m-%d') AS "Due Date", 
               s.name AS "Borrowed By"
        FROM borrowed_books b
        INNER JOIN books bk ON b.isbn = bk.isbn
        INNER JOIN students s ON b.reg_number = s.reg_number
        WHERE b.due_date < CURDATE() AND b.status = 'borrowed'
    `;
    handleReportRequest(req, res, "overdue-books", query, "Overdue Books Report", "overdue_books.pdf");
});

// Checked-Out Books Report
router.get("/reports/checked-out-books", async (req, res) => {
    const query = `
        SELECT b.id AS ID, bk.title AS Title, bk.isbn AS ISBN, 
               DATE_FORMAT(b.due_date, '%Y-%m-%d') AS "Due Date", 
               s.name AS "Borrowed By"
        FROM borrowed_books b
        INNER JOIN books bk ON b.isbn = bk.isbn
        INNER JOIN students s ON b.reg_number = s.reg_number
        WHERE b.status = 'borrowed'
    `;
    handleReportRequest(req, res, "checked-out-books", query, "Checked-Out Books Report", "checked_out_books.pdf");
});

// Returned Books Report
router.get("/reports/returned-books", async (req, res) => {
    const query = `
        SELECT b.id AS ID, bk.title AS Title, bk.isbn AS ISBN, 
               DATE_FORMAT(b.returned_at, '%Y-%m-%d') AS "Return Date", 
               s.name AS "Returned By"
        FROM borrowed_books b
        INNER JOIN books bk ON b.isbn = bk.isbn
        INNER JOIN students s ON b.reg_number = s.reg_number
        WHERE b.status = 'returned'
    `;
    handleReportRequest(req, res, "returned-books", query, "Returned Books Report", "returned_books.pdf");
});

// Fine Collection Report
router.get("/reports/fine-collection", async (req, res) => {
    const query = `
        SELECT f.id AS ID, s.name AS "Student Name", 
               f.fine_amount AS "Fine Amount", 
               DATE_FORMAT(f.paid_date, '%Y-%m-%d') AS "Paid Date"
        FROM fines f
        INNER JOIN students s ON f.reg_number = s.reg_number
    `;
    handleReportRequest(req, res, "fine-collection", query, "Fine Collection Report", "fine_collection.pdf");
});

module.exports = router;