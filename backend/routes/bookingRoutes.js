const express = require("express")

const router = express.Router()

const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getAdminBookings,
  acceptBooking,
  declineBooking,
  completeBooking,
  cancelBooking,
} = require(
  "../controllers/bookingController"
)

const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
)

// ========================================
// CREATE BOOKING
// ========================================

router.post(
  "/create",
  protect,
  createBooking
)

// ========================================
// CUSTOMER BOOKINGS
// ========================================

router.get(
  "/customer",
  protect,
  getCustomerBookings
)

// ========================================
// PROVIDER BOOKINGS
// ========================================

router.get(
  "/provider",
  protect,
  getProviderBookings
)

// ========================================
// ADMIN BOOKINGS
// ========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminBookings
)

// ========================================
// ACCEPT BOOKING
// ========================================

router.put(
  "/accept/:id",
  protect,
  acceptBooking
)

// ========================================
// DECLINE BOOKING
// ========================================

router.put(
  "/decline/:id",
  protect,
  declineBooking
)

// ========================================
// COMPLETE BOOKING
// ========================================

router.put(
  "/complete/:id",
  protect,
  completeBooking
)

// ========================================
// CANCEL BOOKING
// ========================================

router.put(
  "/cancel/:id",
  protect,
  cancelBooking
)

module.exports = router