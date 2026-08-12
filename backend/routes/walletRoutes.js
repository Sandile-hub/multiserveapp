const express =
require("express");

const router =
express.Router();

const {
  getWallet,
  topUpWallet,
  payWithWallet,
} = require(
  "../controllers/walletController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

// ========================================
// GET WALLET
// ========================================

router.get(
  "/",
  protect,
  getWallet
);

// ========================================
// TOP UP WALLET
// ========================================

router.post(
  "/top-up",
  protect,
  topUpWallet
);

// ========================================
// PAY WITH WALLET
// ========================================

router.post(
  "/pay",
  protect,
  payWithWallet
);

module.exports =
router;