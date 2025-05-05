// bookReportsRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("Book Reports Routes Loaded");

// Ordered Books Report
router.get("/ordered-books", async (req, res) => {
    console.log("Route /ordered-books hit");
    try {
        const [rows] = await db.execute(`
            SELECT 
                bo.id AS order_id,
                bo.title AS book_title,
                v.name AS vendor_name,
                bo.quantity,
                bo.order_date,
                bo.status
            FROM book_orders bo
            LEFT JOIN vendors v ON bo.vendor = v.name
        `);
        console.log("Ordered Books Data:", rows); // Debug log
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching ordered books report:", error);
        res.status(500).json({ message: "Error fetching ordered books report" });
    }
});

// Received Books Report
router.get("/received-books", async (req, res) => {
  console.log("Route /received-books hit");
  try {
      const [rows] = await db.execute(`
          SELECT 
              bo.id AS receive_id,
              bo.title AS book_title,
              v.name AS vendor_name,
              bo.received_quantity AS quantity,
              bo.order_date AS received_date
          FROM book_orders bo
          LEFT JOIN vendors v ON bo.vendor = v.name
          WHERE bo.received_quantity > 0  -- Remove status condition if not needed
      `);
      console.log("Received Books Data:", rows);
      res.status(200).json(rows);
  } catch (error) {
      console.error("Error fetching received books report:", error);
      res.status(500).json({ message: "Error fetching received books report" });
  }
});

// Vendor Performance Report
router.get("/vendor-performance", async (req, res) => {
    console.log("Route /vendor-performance hit");
    try {
        const [rows] = await db.execute(`
            SELECT 
                v.name AS vendor_name,
                COUNT(bo.id) AS total_orders,
                SUM(bo.quantity) AS total_books_ordered,
                SUM(bo.received_quantity) AS total_books_received,
                (SUM(bo.received_quantity) / SUM(bo.quantity) * 100) AS delivery_rate
            FROM vendors v
            LEFT JOIN book_orders bo ON v.name = bo.vendor
            GROUP BY v.name
        `);
        console.log("Vendor Performance Data:", rows); // Debug log
        const formattedRows = rows.map(row => ({
            ...row,
            total_books_received: row.total_books_received || 0,
            delivery_rate: row.delivery_rate || 0
        }));
        res.status(200).json(formattedRows);
    } catch (error) {
        console.error("Error fetching vendor performance report:", error);
        res.status(500).json({ message: "Error fetching vendor performance report" });
    }
});

module.exports = router;