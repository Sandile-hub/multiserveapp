const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const {
  getCustomerProfile,
  updateCustomerProfile,
  changePassword,
  uploadProfileImage,
} = require("../controllers/customerController");

// GET PROFILE
router.get(
  "/profile",
  protect,
  getCustomerProfile
);

// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateCustomerProfile
);

// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  changePassword
);

// UPLOAD IMAGE
router.put(
  "/upload-profile-image",
  protect,
  upload.single("profile_image"),
  uploadProfileImage
);

module.exports = router;