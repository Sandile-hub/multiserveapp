const express = require("express")

const router = express.Router()

const adminController =
require("../controllers/adminController")

const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
)

// =====================================
// DASHBOARD
// =====================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  adminController.getDashboardStats
)

// =====================================
// USERS
// =====================================

router.get(
  "/users",
  protect,
  adminOnly,
  adminController.getAllUsers
)

router.put(
  "/users/status/:id",
  protect,
  adminOnly,
  adminController.updateUserStatus
)

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  adminController.deleteUser
)

// =====================================
// BOOKINGS
// =====================================

router.get(
  "/bookings",
  protect,
  adminOnly,
  adminController.getAllBookings
)

// =====================================
// PAYMENTS
// =====================================

router.get(
  "/payments",
  protect,
  adminOnly,
  adminController.getAllPayments
)

// =====================================
// REVIEWS
// =====================================

router.get(
  "/reviews",
  protect,
  adminOnly,
  adminController.getAllReviews
)

// =====================================
// NOTIFICATIONS
// =====================================

router.get(
  "/notifications",
  protect,
  adminOnly,
  adminController.getAllNotifications
)

// =====================================
// BUSINESSES
// =====================================

router.get(
  "/businesses",
  protect,
  adminOnly,
  adminController.getAllBusinesses
)

router.put(
  "/businesses/approve/:id",
  protect,
  adminOnly,
  adminController.approveBusiness
)

router.put(
  "/businesses/reject/:id",
  protect,
  adminOnly,
  adminController.rejectBusiness
)

// =====================================
// SETTINGS
// =====================================

router.get(
  "/settings",
  protect,
  adminOnly,
  adminController.getPlatformSettings
)

router.put(
  "/settings",
  protect,
  adminOnly,
  adminController.updatePlatformSettings
)

module.exports = router