const express =
require("express")

const router =
express.Router()

const {

  getAnalytics,

  getCustomerAnalytics,

} = require(
  "../controllers/analyticsController"
)

const {

  protect,

} = require(
  "../middleware/authMiddleware"
)

// ========================================
// ADMIN ANALYTICS
// ========================================

router.get(
  "/",
  protect,
  getAnalytics
)

// ========================================
// CUSTOMER DASHBOARD ANALYTICS
// ========================================

router.get(
  "/customer",
  protect,
  getCustomerAnalytics
)

module.exports =
router