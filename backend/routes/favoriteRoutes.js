const express =
require("express")

const router =
express.Router()

const {

  addFavorite,

  getFavorites,

  removeFavorite,

  checkFavorite,

  getFavoritesCount,

} = require(
  "../controllers/favoriteController"
)

const {

  protect,

} = require(
  "../middleware/authMiddleware"
)

// ========================================
// ADD FAVORITE
// ========================================

router.post(
  "/add",
  protect,
  addFavorite
)

// ========================================
// GET FAVORITES
// ========================================

router.get(
  "/",
  protect,
  getFavorites
)

// ========================================
// REMOVE FAVORITE
// ========================================

router.delete(
  "/:id",
  protect,
  removeFavorite
)

// ========================================
// CHECK FAVORITE
// ========================================

router.get(
  "/check/:service_id",
  protect,
  checkFavorite
)

// ========================================
// FAVORITES COUNT
// ========================================

router.get(
  "/count/all",
  protect,
  getFavoritesCount
)

module.exports = router