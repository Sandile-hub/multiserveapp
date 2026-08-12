const express =
require("express");

const expressRaw =
require("express").raw;

const router =
express.Router();

const {

  createPayment,

  verifyStripePayment,

  stripeWebhook,

  getCustomerPayments,

  getProviderPayments,

  getAdminPayments,

  downloadReceipt,

} = require(
  "../controllers/paymentController"
);

const {

  protect,

  adminOnly,

} = require(
  "../middleware/authMiddleware"
);

// ========================================
// CREATE STRIPE PAYMENT SESSION
// ========================================

router.post(
  "/create",
  protect,
  createPayment
);

// ========================================
// VERIFY STRIPE PAYMENT
// ========================================

router.post(
  "/verify-stripe",
  protect,
  verifyStripePayment
);

// ========================================
// STRIPE WEBHOOK
// IMPORTANT:
// MUST USE express.raw()
// ========================================

router.post(
  "/webhook",

  expressRaw({
    type:
    "application/json",
  }),

  stripeWebhook
);

// ========================================
// DOWNLOAD RECEIPT
// ========================================

router.get(
  "/receipt/:payment_id",
  protect,
  downloadReceipt
);

// ========================================
// CUSTOMER PAYMENTS
// ========================================

router.get(
  "/customer",
  protect,
  getCustomerPayments
);

// ========================================
// PROVIDER PAYMENTS
// ========================================

router.get(
  "/provider",
  protect,
  getProviderPayments
);

// ========================================
// ADMIN PAYMENTS
// ========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminPayments
);

module.exports =
router;