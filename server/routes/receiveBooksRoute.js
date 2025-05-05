const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST: Receive books for a specific order
router.post('/orders/:orderId/receive', async (req, res) => {
  const { orderId } = req.params;
  const { receivedBooks, comments } = req.body;

  try {
    // Loop through each book to update its received quantity and damage status
    for (let book of receivedBooks) {
      const { bookId, receivedQuantity, isDamaged } = book;

      // Update the received quantity and damage status for each book
      const updateQuery = `
        UPDATE book_orders
        SET received_quantity = ?, is_damaged = ?, comments = ?
        WHERE id = ? AND order_id = ?
      `;
      const values = [receivedQuantity, isDamaged, comments, bookId, orderId];
      await db.execute(updateQuery, values);
    }

    // Check if all books in the order are received
    const checkReceivedQuery = `
      SELECT COUNT(*) AS totalBooks, SUM(received_quantity) AS totalReceived
      FROM book_orders
      WHERE order_id = ?
    `;
    const [checkResult] = await db.execute(checkReceivedQuery, [orderId]);

    // If all books are received, change order status to "received"
    if (checkResult[0].totalBooks === checkResult[0].totalReceived) {
      const updateStatusQuery = `
        UPDATE orders
        SET status = 'received'
        WHERE id = ?
      `;
      await db.execute(updateStatusQuery, [orderId]);
    }

    res.status(200).json({ message: 'Books received successfully.' });
  } catch (err) {
    console.error('Error receiving books:', err);
    res.status(500).json({ message: 'Error receiving books.', error: err.message });
  }
});

module.exports = router;
