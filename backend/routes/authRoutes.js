const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  verifyOTP,
  resendOTP,
  sendOTP,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

router.post("/register", registerUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.get("/users", protect, admin, getUser);

module.exports = router;