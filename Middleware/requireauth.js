const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../Utls/config");
const User = require("../Models/usermodel");

const Auth = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    // 2️⃣ Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    // 3️⃣ Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: err.name === "TokenExpiredError" 
          ? "Token expired. Please login again" 
          : "Invalid token" 
      });
    }

    // 4️⃣ Find user in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error in authentication" });
  }
};

// 🔒 Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.usertype !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied: Admin only" });
  }

  next();
};

module.exports = { Auth, adminMiddleware };
