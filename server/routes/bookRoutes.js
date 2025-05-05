const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const { 
  addBook, 
  getBooks, 
  getBookById, 
  updateBook, 
  deleteBook, 
  bulkUpload 
} = require("../controllers/bookController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    cb(null, `${Date.now()}${fileExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed for cover image"), false);
  }
  if (file.fieldname === "bulkUploadFile" && !["text/csv"].includes(file.mimetype)) {
    return cb(new Error("Only CSV files are allowed for bulk upload"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.post("/", upload.single("coverImage"), addBook);
router.get("/", getBooks);
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const [books] = await db.execute(
      `SELECT id, title, author, category, isbn, edition, publisher, 
              publication_year, keywords, location, shelf_number, 
              availability, circulation_type, cover_image, available_copies 
       FROM books 
       WHERE title LIKE ? 
          OR author LIKE ? 
          OR category LIKE ? 
          OR keywords LIKE ? 
          OR isbn LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json(books);
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", getBookById);
router.put("/:id", upload.single("coverImage"), updateBook);
router.delete("/:id", deleteBook);
router.post("/bulk-upload", upload.single("bulkUploadFile"), bulkUpload);

module.exports = router;