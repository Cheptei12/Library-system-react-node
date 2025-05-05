// routes/SettingsRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your DB config

// GET: Fetch all announcements
router.get("/settings/announcements", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM announcements ORDER BY date DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
  }
});

// POST: Add a new announcement
router.post("/settings/announcements", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Announcement text is required" });
  }

  try {
    const [result] = await db.execute("INSERT INTO announcements (text, date) VALUES (?, NOW())", [text.trim()]);
    res.status(200).json({ id: result.insertId, text: text.trim(), date: new Date().toISOString() });
  } catch (err) {
    console.error("Error adding announcement:", err);
    res.status(500).json({ message: "Failed to add announcement", error: err.message });
  }
});

// GET: Fetch fine rate
router.get("/settings/fine-rate", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT value FROM system_settings WHERE setting_key = 'fine_rate' LIMIT 1");
    const fineRate = rows.length > 0 ? parseFloat(rows[0].value) : 0.5;
    res.status(200).json({ fineRate });
  } catch (err) {
    console.error("Error fetching fine rate:", err);
    res.status(500).json({ message: "Failed to fetch fine rate", error: err.message });
  }
});

// PUT: Update fine rate
router.put("/settings/fine-rate", async (req, res) => {
  const { fineRate } = req.body;
  if (fineRate < 0) {
    return res.status(400).json({ message: "Fine rate cannot be negative" });
  }

  try {
    await db.execute(
      "INSERT INTO system_settings (setting_key, value) VALUES ('fine_rate', ?) ON DUPLICATE KEY UPDATE value = ?",
      [fineRate, fineRate]
    );
    res.status(200).json({ message: "Fine rate updated successfully" });
  } catch (err) {
    console.error("Error updating fine rate:", err);
    res.status(500).json({ message: "Failed to update fine rate", error: err.message });
  }
});

// GET: Fetch security settings
router.get("/settings/security", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT value FROM system_settings WHERE setting_key = 'two_factor_enabled' LIMIT 1");
    const twoFactorEnabled = rows.length > 0 ? rows[0].value === "1" : false;
    res.status(200).json({ twoFactorEnabled });
  } catch (err) {
    console.error("Error fetching security settings:", err);
    res.status(500).json({ message: "Failed to fetch security settings", error: err.message });
  }
});

// PUT: Update security settings
router.put("/settings/security", async (req, res) => {
  const { twoFactorEnabled } = req.body;

  try {
    await db.execute(
      "INSERT INTO system_settings (setting_key, value) VALUES ('two_factor_enabled', ?) ON DUPLICATE KEY UPDATE value = ?",
      [twoFactorEnabled ? "1" : "0", twoFactorEnabled ? "1" : "0"]
    );
    res.status(200).json({ message: "Security settings updated successfully" });
  } catch (err) {
    console.error("Error updating security settings:", err);
    res.status(500).json({ message: "Failed to update security settings", error: err.message });
  }
});

module.exports = router;