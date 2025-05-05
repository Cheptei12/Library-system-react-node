const express = require("express");
const db = require("../config/db"); // Ensure this path is correct to your database connection
const router = express.Router();

// Endpoint to fetch profile data based on userId
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    let userProfile = null;

    console.log(`Looking up profile for userId: ${userId}`);

    const [studentResult] = await db.query('SELECT * FROM students WHERE reg_number = ?', [userId]);

    if (studentResult.length > 0) {
      userProfile = studentResult[0];
      console.log("Student profile found:", userProfile);
    } else {
      const [staffResult] = await db.query('SELECT * FROM staff WHERE employee_number = ?', [userId]);

      if (staffResult.length > 0) {
        userProfile = staffResult[0];
        console.log("Staff profile found:", userProfile);
      }
    }

    if (userProfile) {
      res.status(200).json(userProfile);
    } else {
      console.log(`Profile not found for userId: ${userId}`);
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    console.error("Error occurred while fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Endpoint to update the profile (only email and phone)
router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { email, phone } = req.body;

  try {
    let updateQuery = '';
    let queryParams = [];

    const [studentResult] = await db.query('SELECT * FROM students WHERE reg_number = ?', [userId]);

    if (studentResult.length > 0) {
      updateQuery = 'UPDATE students SET email = ?, phone = ? WHERE reg_number = ?';
      queryParams = [email, phone, userId];
    } else {
      const [staffResult] = await db.query('SELECT * FROM staff WHERE employee_number = ?', [userId]);

      if (staffResult.length > 0) {
        updateQuery = 'UPDATE staff SET email = ?, phone = ? WHERE employee_number = ?';
        queryParams = [email, phone, userId];
      }
    }

    if (updateQuery) {
      await db.query(updateQuery, queryParams);
      res.status(200).json({ message: "Profile updated successfully!" });
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    console.error("Error occurred while updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});


module.exports = router;
