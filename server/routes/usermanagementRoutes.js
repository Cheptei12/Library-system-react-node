// routes/usermanagementRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // MySQL connection pool
const bcrypt = require('bcrypt');

// Get all librarians
router.get('/librarians', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, employee_number, status FROM librarians'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching librarians:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new librarian
router.post('/librarians', async (req, res) => {
  const { full_name, email, phone, employee_number, password, status } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO librarians (full_name, email, phone, employee_number, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone || null, employee_number || null, hashedPassword, status || 'Active']
    );
    const newLibrarian = {
      id: result.insertId,
      full_name,
      email,
      phone: phone || null,
      employee_number: employee_number || null,
      status: status || 'Active',
    };
    res.status(201).json(newLibrarian);
  } catch (err) {
    console.error('Error adding librarian:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or employee number already exists' });
    }
    res.status(500).json({ message: 'Failed to add librarian' });
  }
});

// Update librarian status
router.put('/librarians/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  try {
    const [result] = await db.query(
      'UPDATE librarians SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Librarian not found' });
    }
    const [updatedLibrarian] = await db.query(
      'SELECT id, full_name, email, phone, employee_number, status FROM librarians WHERE id = ?',
      [id]
    );
    res.json(updatedLibrarian[0]);
  } catch (err) {
    console.error('Error updating librarian:', err);
    res.status(500).json({ message: 'Failed to update librarian' });
  }
});

// Get all staff
router.get('/staff', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, employee_number, name, phone, email, department, role, hire_date, status FROM staff'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff status
router.put('/staff/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!['Active', 'Blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  try {
    const [result] = await db.query(
      'UPDATE staff SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    const [updatedStaff] = await db.query(
      'SELECT id, employee_number, name, phone, email, department, role, hire_date, status FROM staff WHERE id = ?',
      [id]
    );
    res.json(updatedStaff[0]);
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({ message: 'Failed to update staff' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, reg_number, name, phone, email, department, status FROM students'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student status
router.put('/students/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!['Active', 'Blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  try {
    const [result] = await db.query(
      'UPDATE students SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const [updatedStudent] = await db.query(
      'SELECT id, reg_number, name, phone, email, department, status FROM students WHERE id = ?',
      [id]
    );
    res.json(updatedStudent[0]);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

module.exports = router;