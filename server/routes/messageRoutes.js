// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper function to convert ISO 8601 to MySQL DATETIME format
const formatTimestampForMySQL = (isoString) => {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { from, to, text, timestamp, inReplyTo } = req.body;
    const mysqlTimestamp = formatTimestampForMySQL(timestamp); // Convert timestamp to MySQL format
    const query = `
      INSERT INTO messages (from_user, to_user, text, timestamp, unread, in_reply_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [from, to, text, mysqlTimestamp, 1, inReplyTo || null]);
    res.status(201).json({ message: 'Message sent successfully', id: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Receive messages for a specific user
router.get('/receive', async (req, res) => {
  try {
    const { to } = req.query;
    const query = `
      SELECT id, from_user AS \`from\`, to_user AS \`to\`, text, timestamp, unread, in_reply_to AS inReplyTo
      FROM messages
      WHERE to_user = ?
      ORDER BY timestamp DESC
    `;
    const [messages] = await db.query(query, [to]);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;