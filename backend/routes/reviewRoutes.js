const express =
require("express")

const router =
express.Router()

const {
  createReview,
  getBusinessReviews,
  getProviderReviews,
  getAdminReviews,
  getBusinessRating,
  deleteReview,
} = require(
  "../controllers/reviewController"
)

const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
)

// ========================================
// CREATE REVIEW
// ========================================

router.post(
  "/create",
  protect,
  createReview
)

// ========================================
// GET BUSINESS REVIEWS
// ========================================

router.get(
  "/business/:business_id",
  getBusinessReviews
)

// ========================================
// GET PROVIDER REVIEWS
// ========================================

router.get(
  "/provider",
  protect,
  getProviderReviews
)

// ========================================
// GET ADMIN REVIEWS
// ========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminReviews
)

// ========================================
// GET BUSINESS RATING
// ========================================

router.get(
  "/rating/:business_id",
  getBusinessRating
)

// ========================================
// DELETE REVIEW
// ========================================

router.delete(
  "/delete/:id",
  protect,
  adminOnly,
  deleteReview
)

module.exports = router