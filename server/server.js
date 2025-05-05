const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET); // Log the secret

const db = require("./config/db");
const circulationRoutes = require("./routes/circulationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes"); // Import auth routes
const finesRoutes = require("./routes/fines"); // Import fines routes
const renewRoutes = require("./routes/RenewRoutes");
const circulationReports = require("./routes/CirculationReports");
const staffRoutes = require("./routes/staffRoutes"); // Import staff routes
const borrowedBooksRoutes = require("./routes/borrowedBooksRoutes");
const profileRoutes = require("./routes/profileRoutes"); // Adjust path to the profile routes file
const orderBooksRoutes = require("./routes/orderBooksRoutes"); // Import orderBooksRoutes
const vendorRoutes = require("./routes/vendorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const popularBooksRoutes = require("./routes/popularBooksRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const userManagementRoutes = require("./routes/usermanagementRoutes");
const settingsRoutes = require("./routes/SettingsRoutes");
const fetchRealDataRoutes = require('./routes/fetchrealdataRoutes');
const messageRoutes = require('./routes/messageRoutes');
const commentsRoutes = require('./routes/commentsRoutes');


const path = require("path");  // Required for serving static files

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*", // Allows all devices (for now, update later for security)
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization"
}));

// Serve static files (images) from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Library Management System Backend Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/circulation", circulationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/fines", finesRoutes); // ✅ Added Fines API Route
app.use("/api/renew", renewRoutes);
app.use("/api", circulationReports);
app.use("/api/staff", staffRoutes); // ✅ Added Staff API Route
app.use("/api", borrowedBooksRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", orderBooksRoutes);  // Add the orderBooksRoutes here
app.use("/api/vendors", vendorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/popular-books", popularBooksRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", userManagementRoutes);
app.use("/api", settingsRoutes);
app.use('/api', fetchRealDataRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/comments', commentsRoutes);


// ✅ Token Verification Route
app.post("/api/auth/verify-token", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ valid: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ valid: false, message: "Invalid or expired token" });
        }
        res.json({ valid: true, user: decoded });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
