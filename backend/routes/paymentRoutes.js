const express = require("express");
const expressRaw = require("express").raw;

const router = express.Router();

const {
  createPayment,
  confirmOnsitePayment,
  verifyStripePayment,
  stripeWebhook,
  getCustomerPayments,
  getProviderPayments,
  getAdminPayments,
  downloadReceipt,
} = require("../controllers/paymentController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ========================================
// CREATE PAYMENT
// ========================================
// Customer selects Pay on Site.
// Creates a pending payment.
//
// POST /api/payments/create
//
// Protected:
// Customer
// ========================================

router.post(
  "/create",
  protect,
  createPayment
);

// ========================================
// CONFIRM ONSITE PAYMENT
// ========================================
// Provider confirms that the customer
// physically paid at the business.
//
// POST /api/payments/confirm-onsite/:payment_id
//
// Protected:
// Provider
// ========================================

router.post(
  "/confirm-onsite/:payment_id",
  protect,
  confirmOnsitePayment
);

// ========================================
// VERIFY STRIPE PAYMENT
// ========================================
// Kept for future card payments.
//
// POST /api/payments/verify-stripe
//
// Protected:
// Authenticated users
// ========================================

router.post(
  "/verify-stripe",
  protect,
  verifyStripePayment
);

// ========================================
// STRIPE WEBHOOK
// ========================================
// IMPORTANT:
// Stripe requires the raw request body.
//
// POST /api/payments/webhook
//
// Do NOT put protect middleware here.
// ========================================

router.post(
  "/webhook",
  expressRaw({
    type: "application/json",
  }),
  stripeWebhook
);

// ========================================
// DOWNLOAD RECEIPT
// ========================================
//
// GET /api/payments/receipt/:payment_id
//
// Protected:
// Authenticated users
// ========================================

router.get(
  "/receipt/:payment_id",
  protect,
  downloadReceipt
);

// ========================================
// CUSTOMER PAYMENTS
// ========================================
//
// GET /api/payments/customer
//
// Protected:
// Authenticated users
// ========================================

router.get(
  "/customer",
  protect,
  getCustomerPayments
);

// ========================================
// PROVIDER PAYMENTS
// ========================================
//
// GET /api/payments/provider
//
// Protected:
// Provider
// ========================================

router.get(
  "/provider",
  protect,
  getProviderPayments
);

// ========================================
// ADMIN PAYMENTS
// ========================================
//
// GET /api/payments/admin
//
// Protected:
// Admin
// ========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminPayments
);

module.exports = router;