const express = require("express");

const router = express.Router();

const {
  register,
  login,
  verifyOTP,
  resendOTP,
} = require("../controllers/authController");

// ========================================
// REGISTER
// ========================================

router.post("/register", register);

// ========================================
// LOGIN
// ========================================

router.post("/login", login);

// ========================================
// VERIFY EMAIL OTP
// ========================================

router.post("/verify-otp", verifyOTP);

// ========================================
// RESEND OTP
// ========================================

router.post("/resend-otp", resendOTP);

module.exports = router;
