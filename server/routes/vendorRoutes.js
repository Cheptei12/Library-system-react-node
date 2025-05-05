const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => { // Changed from "/vendors" to "/"
  console.log("GET /api/vendors route hit");
  try {
    const [vendors] = await db.execute("SELECT * FROM vendors");
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors" });
  }
});

router.post("/", async (req, res) => { // Changed from "/vendors"
  const { name, contact_person, email, phone, address, website, specialties } = req.body;
  if (!name || !contact_person || !email || !phone || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const [result] = await db.execute(
      "INSERT INTO vendors (name, contact_person, email, phone, address, website, specialties) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, contact_person, email, phone, address, website || null, JSON.stringify(specialties || [])]
    );
    res.status(201).json({ message: "Vendor added successfully", vendorId: result.insertId });
  } catch (error) {
    console.error("Error adding vendor:", error);
    res.status(500).json({ message: "Error adding vendor" });
  }
});

router.put("/:id", async (req, res) => { // Changed from "/vendors/:id"
  const { id } = req.params;
  const { name, contact_person, email, phone, address, website, specialties } = req.body;
  try {
    const [result] = await db.execute(
      "UPDATE vendors SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, website = ?, specialties = ? WHERE vendor_id = ?",
      [name, contact_person, email, phone, address, website || null, JSON.stringify(specialties || []), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ message: "Vendor updated successfully" });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Error updating vendor" });
  }
});

router.delete("/:id", async (req, res) => { // Changed from "/vendors/:id"
  const { id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM vendors WHERE vendor_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Error deleting vendor" });
  }
});

module.exports = router;