const express = require("express");
const router = express.Router();

const {
  signup,
  signin,
  updateuser,
  getuserById,
  getallusers,
  deleteUser,
  forgotpassword,
  verifyOtp,
  resetpassword,
  authverify,
} = require("../Controllers/usercontroller.js");

const { Auth, adminMiddleware } = require("../Middleware/requireauth.js");

// Public Routes
router.post("/signup", signup);
router.post("/login", signin);

// Protected User Routes
router.put("/updateuser/:id", Auth, updateuser);
router.get("/getuser/:id", Auth, getuserById);

// Admin Protected Route
router.get("/getalluser", Auth, adminMiddleware, getallusers);

// Forgot Password Flow
router.post("/forgot-password", forgotpassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetpassword);

// Protected Route to check auth token
router.get("/verify-auth", Auth, authverify);



// Admin or Same User can delete account
router.delete("/deleteuser/:id", Auth, deleteUser);

module.exports = router;
