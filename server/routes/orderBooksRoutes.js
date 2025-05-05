const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage }).single('bulkUpload');

// POST: Order one or more books
router.post('/order-books', async (req, res) => {
  const { orderList } = req.body;

  if (!orderList || orderList.length === 0) {
    return res.status(400).json({ message: 'No books to order.' });
  }

  try {
    // Create new order and get order_id
    const [orderInsert] = await db.execute(`INSERT INTO orders (status) VALUES ('pending')`);
    const orderId = orderInsert.insertId;

    const values = orderList.map(book => [
      orderId,
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.edition,
      book.publisher,
      book.publicationYear,
      book.quantity,
      book.vendor
    ]);
    const query = `
      INSERT INTO book_orders (order_id, title, author, isbn, category, edition, publisher, publication_year, quantity, vendor)
      VALUES ${values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
    `;
    const flatValues = values.flat();
    const [insertResult] = await db.execute(query, flatValues);

    res.status(200).json({ message: 'Order submitted successfully!', orderId, orderCount: insertResult.affectedRows });
  } catch (err) {
    console.error('Error inserting order:', err);
    res.status(500).json({ message: 'Failed to submit order.', error: err.message });
  }
});

// POST: Bulk upload from CSV
router.post('/bulk-upload', upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const data = fs.readFileSync(filePath, 'utf8');

    Papa.parse(data, {
      complete: async (results) => {
        // Skip header row and filter out invalid rows
        const parsed = results.data.filter((row, index) => {
          return (
            index !== 0 && // skip header
            row.length >= 9 && // must have all required columns
            row[0] && row[1] && row[2] // title, author, isbn should not be empty
          );
        });

        if (parsed.length === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ message: 'CSV file is empty or invalid.' });
        }

        // Create new order and get order_id
        const [orderInsert] = await db.execute(`INSERT INTO orders (status) VALUES ('pending')`);
        const orderId = orderInsert.insertId;

        const books = parsed.map((row, i) => {
          // Sanitize year and quantity
          const parsedYear = parseInt(row[6], 10);
          const publicationYear = isNaN(parsedYear) ? 1900 : parsedYear;

          const parsedQty = parseInt(row[7], 10);
          const quantity = isNaN(parsedQty) ? 1 : parsedQty;

          return [
            orderId,
            row[0].trim(), // title
            row[1].trim(), // author
            row[2].trim(), // isbn
            row[3]?.trim() || 'General', // category
            row[4]?.trim() || '',        // edition
            row[5]?.trim() || '',        // publisher
            publicationYear,
            quantity,
            row[8]?.trim() || ''         // vendor
          ];
        });

        const insertQuery = `
          INSERT INTO book_orders (
            order_id, title, author, isbn, category, edition, publisher, publication_year, quantity, vendor
          )
          VALUES ${books.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
        `;
        const [uploadResult] = await db.execute(insertQuery, books.flat());

        fs.unlinkSync(filePath); // Clean up
        res.status(200).json({
          message: 'Books uploaded and saved successfully!',
          orderId,
          orderCount: uploadResult.affectedRows
        });
      },
      skipEmptyLines: true
    });
  } catch (err) {
    console.error('Error processing file: ', err);
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Error processing the CSV file.', error: err.message });
  }
});

// GET: Fetch all book orders
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT id, title, author, isbn, category, edition, publisher, publication_year, quantity, vendor, received_quantity, is_damaged, comments, order_id
      FROM book_orders
      ORDER BY id DESC
    `);

    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching book orders:', err);
    res.status(500).json({ message: 'Error retrieving book orders.', error: err.message });
  }
});

// GET: Fetch books for a specific order
router.get('/orders/:orderId/books', async (req, res) => {
  const { orderId } = req.params;

  try {
    const [books] = await db.execute(`
      SELECT id, title, author, isbn, category, edition, publisher, publication_year, quantity, received_quantity, is_damaged, comments
      FROM book_orders
      WHERE order_id = ?
      ORDER BY id DESC
    `, [orderId]);

    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found for this order.' });
    }

    res.status(200).json(books);
  } catch (err) {
    console.error('Error fetching books for order:', err);
    res.status(500).json({ message: 'Error retrieving books for this order.', error: err.message });
  }
});

// POST: Receive books for a specific order
router.post('/orders/:orderId/receive', async (req, res) => {
  const { orderId } = req.params;
  const { receivedBooks, comments } = req.body;

  if (!receivedBooks || receivedBooks.length === 0) {
    return res.status(400).json({ message: 'No books to receive.' });
  }

  try {
    for (let book of receivedBooks) {
      const { bookId, receivedQuantity, isDamaged } = book;

      // Fetch current book order details
      const [current] = await db.execute(
        `SELECT quantity, received_quantity FROM book_orders WHERE id = ? AND order_id = ?`,
        [bookId, orderId]
      );
      if (!current.length) {
        return res.status(404).json({ message: `Book order with ID ${bookId} not found for order ${orderId}.` });
      }

      const { quantity, received_quantity: currentReceived = 0 } = current[0];
      if (receivedQuantity > quantity) {
        return res.status(400).json({ message: `Received quantity (${receivedQuantity}) exceeds ordered quantity (${quantity}).` });
      }

      const updateQuery = `
        UPDATE book_orders
        SET received_quantity = ?, is_damaged = ?, comments = ?
        WHERE id = ? AND order_id = ?
      `;
      const [updateResult] = await db.execute(updateQuery, [
        receivedQuantity, // Use the total sent from frontend
        isDamaged,
        comments || null,
        bookId,
        orderId,
      ]);

      if (updateResult.affectedRows === 0) {
        return res.status(400).json({ message: `Failed to update book order ${bookId}.` });
      }
    }

    // Check if order is fully received
    const [checkResult] = await db.execute(
      `SELECT COUNT(*) AS totalBooks, SUM(received_quantity) AS totalReceived
       FROM book_orders
       WHERE order_id = ?`,
      [orderId]
    );
    const { totalBooks, totalReceived } = checkResult[0];
    if (totalBooks === parseInt(totalReceived)) {
      await db.execute(`UPDATE orders SET status = 'received' WHERE id = ?`, [orderId]);
    }

    res.status(200).json({ message: 'Books received successfully.' });
  } catch (err) {
    console.error('Error receiving books:', err);
    res.status(500).json({ message: 'Error receiving books.', error: err.message });
  }
});

module.exports = router;