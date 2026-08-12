const db =
require("../config/database");

// ========================================
// GET WALLET
// ========================================

exports.getWallet =
async (req, res) => {

  try {

    const [users] =
      await db.query(
        `
        SELECT
          wallet_balance
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      );

    const [transactions] =
      await db.query(
        `
        SELECT *
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

    res.json({
      success: true,

      balance:
        users[0]
        .wallet_balance,

      transactions,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to fetch wallet",
    });
  }
};

// ========================================
// ADD FUNDS
// ========================================

exports.topUpWallet =
async (req, res) => {

  try {

    const { amount } =
      req.body;

    if (
      !amount ||
      amount <= 0
    ) {
      return res.status(400)
      .json({
        message:
          "Invalid amount",
      });
    }

    // UPDATE BALANCE
    await db.query(
      `
      UPDATE users
      SET wallet_balance =
      wallet_balance + ?
      WHERE id = ?
      `,
      [
        amount,
        req.user.id,
      ]
    );

    // SAVE TRANSACTION
    await db.query(
      `
      INSERT INTO
      wallet_transactions
      (
        user_id,
        type,
        amount,
        description
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        req.user.id,
        "deposit",
        amount,
        "Wallet top up",
      ]
    );

    res.json({
      success: true,

      message:
        "Wallet funded successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to top up wallet",
    });
  }
};

// ========================================
// PAY WITH WALLET
// ========================================

exports.payWithWallet =
async (req, res) => {

  try {

    const {
      bookingId,
      amount,
    } = req.body;

    // GET USER
    const [users] =
      await db.query(
        `
        SELECT wallet_balance
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      );

    const user =
      users[0];

    // INSUFFICIENT FUNDS
    if (
      user.wallet_balance <
      amount
    ) {
      return res.status(400)
      .json({
        message:
          "Insufficient wallet balance",
      });
    }

    // DEDUCT MONEY
    await db.query(
      `
      UPDATE users
      SET wallet_balance =
      wallet_balance - ?
      WHERE id = ?
      `,
      [
        amount,
        req.user.id,
      ]
    );

    // SAVE TRANSACTION
    await db.query(
      `
      INSERT INTO
      wallet_transactions
      (
        user_id,
        type,
        amount,
        reference_id,
        description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        "payment",
        amount,
        bookingId,
        "Booking payment",
      ]
    );

    res.json({
      success: true,

      message:
        "Payment successful",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Wallet payment failed",
    });
  }
};