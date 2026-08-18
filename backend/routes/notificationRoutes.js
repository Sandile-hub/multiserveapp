const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ========================================
// USER NOTIFICATIONS
// ========================================

router.get(
  "/",
  protect,
  getNotifications
);

// ========================================
// ADMIN ALL NOTIFICATIONS
// ========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllNotifications
);

// ========================================
// MARK SINGLE AS READ
// ========================================

router.put(
  "/read/:id",
  protect,
  markAsRead
);

// ========================================
// MARK ALL AS READ
// ========================================

router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// ========================================
// DELETE NOTIFICATION
// ========================================

router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;