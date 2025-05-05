const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("🛑 Received Authorization Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔹 Extracted Token:", token);

    if (!token) {
      return res.status(401).json({ message: "Access denied. Malformed token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ JWT Verification Error:", err);
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid token." });
      }

      console.log("✅ Decoded Token:", decoded);
      req.user = decoded; // Attach user data (id, role, etc.) for backend use
      next(); // Allow all authenticated users
    });
  } catch (err) {
    console.error("⚠️ Unexpected Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { authenticateUser };