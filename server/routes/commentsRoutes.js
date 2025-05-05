// routes/commentsRoutes.js
// Import required modules
const express = require('express');
const db = require('../config/db'); // Use centralized promise-based MySQL connection pool

// Initialize Express router
const router = express.Router();

// GET /api/comments - Fetch all comments
router.get('/', async (req, res) => {
    try {
        // Query to select all comments, ordered by timestamp descending
        const [comments] = await db.query('SELECT * FROM comments ORDER BY timestamp DESC');
        res.json(comments); // Send comments as JSON response
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ message: 'Failed to load comments', error: err.message });
    }
});

// POST /api/comments - Create a new comment
router.post('/', async (req, res) => {
    const { text, userId } = req.body;
    const timestamp = new Date(); // Server sets timestamp for consistency

    // Basic validation
    if (!text || !userId) {
        return res.status(400).json({ message: 'Text and userId are required' });
    }

    try {
        // Insert new comment into the database
        const [result] = await db.query(
            'INSERT INTO comments (text, userId, timestamp) VALUES (?, ?, ?)',
            [text, userId, timestamp]
        );

        // Fetch the newly created comment to return it
        const [newComment] = await db.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
        res.status(201).json(newComment[0]); // Return the created comment
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ message: 'Failed to post comment', error: err.message });
    }
});

// Export the router for use in server.js
module.exports = router;