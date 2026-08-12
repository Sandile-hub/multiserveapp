const express =
require("express");

const router =
express.Router();

const {

  getProviderChats,

  getCustomerChats,

  getMessages,

  sendMessage,

} = require(
  "../controllers/chatController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

// ======================================
// CUSTOMER CONVERSATIONS
// ======================================

router.get(
  "/conversations",
  protect,
  getCustomerChats
);

// ======================================
// PROVIDER CONVERSATIONS
// ======================================

router.get(
  "/provider",
  protect,
  getProviderChats
);

// ======================================
// GET MESSAGES
// ======================================

router.get(
  "/:conversation_id",
  protect,
  getMessages
)

// ======================================
// SEND MESSAGE
// ======================================

router.post(
  "/send",
  protect,
  sendMessage
);

module.exports =
router;