const db = require("../config/database");
const Stripe = require("stripe");
const crypto = require("crypto");

const {
  createNotification,
} = require("./notificationController");

// ========================================
// STRIPE
// ========================================
// Stripe is kept for future card payments.
// Card payments are currently disabled.
const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ========================================
// PAYMENT SETTINGS
// ========================================

// Platform commission is currently disabled.
// Providers receive 100% of the booking amount.
const PLATFORM_COMMISSION = 0;

// Currently available payment method.
const AVAILABLE_PAYMENT_METHODS = ["onsite"];

// Future payment methods.
const COMING_SOON_PAYMENT_METHODS = [
  "stripe",
  "card",
  "wallet",
];

// ========================================
// CREATE PAYMENT
// ========================================
exports.createPayment = async (req, res) => {
  try {
    console.log("========================================");
    console.log("=== PAYMENT REQUEST DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("========================================");

    const {
      booking_id,
      amount,
      payment_method,
    } = req.body;

    // ====================================
    // VALIDATION
    // ====================================

    const missingFields = [];

    if (!booking_id) {
      missingFields.push("booking_id");
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      missingFields.push("amount");
    }

    if (!payment_method) {
      missingFields.push("payment_method");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(
          ", "
        )}`,
        missing_fields: missingFields,
      });
    }

    // ====================================
    // CHECK USER
    // ====================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ====================================
    // NORMALIZE PAYMENT METHOD
    // ====================================

    const selectedPaymentMethod = String(
      payment_method
    )
      .trim()
      .toLowerCase();

    // ====================================
    // CARD PAYMENT - COMING SOON
    // ====================================

    if (
      selectedPaymentMethod === "stripe" ||
      selectedPaymentMethod === "card"
    ) {
      return res.status(400).json({
        success: false,
        coming_soon: true,
        payment_method: selectedPaymentMethod,
        message: "Card payments are coming soon.",
      });
    }

    // ====================================
    // WALLET - COMING SOON
    // ====================================

    if (selectedPaymentMethod === "wallet") {
      return res.status(400).json({
        success: false,
        coming_soon: true,
        payment_method: "wallet",
        message: "Wallet payments are coming soon.",
      });
    }

    // ====================================
    // ONLY PAY ON SITE IS CURRENTLY AVAILABLE
    // ====================================

    if (
      !AVAILABLE_PAYMENT_METHODS.includes(
        selectedPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Currently only Pay on Site is available.",
        available_payment_methods:
          AVAILABLE_PAYMENT_METHODS,
        coming_soon_payment_methods:
          COMING_SOON_PAYMENT_METHODS,
      });
    }

    // ====================================
    // VALIDATE AMOUNT
    // ====================================

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid amount. Amount must be a positive number.",
        received: amount,
      });
    }

    // ====================================
    // CHECK BOOKING
    // ====================================

    const [bookings] = await db.query(
      `
      SELECT
        bookings.*,
        services.service_name,
        services.price,
        users.full_name AS provider_name,
        users.id AS provider_user_id
      FROM bookings
      JOIN services
        ON bookings.service_id = services.id
      JOIN users
        ON bookings.provider_id = users.id
      WHERE bookings.id = ?
      `,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
        booking_id,
      });
    }

    const booking = bookings[0];

    // ====================================
    // VERIFY BOOKING BELONGS TO CUSTOMER
    // ====================================

    if (
      Number(booking.customer_id) !==
      Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized: This booking does not belong to you.",
      });
    }

    // ====================================
    // DETERMINE OFFICIAL BOOKING AMOUNT
    // ====================================

    let paymentAmount;

    if (
      booking.total_amount !== null &&
      booking.total_amount !== undefined &&
      Number(booking.total_amount) > 0
    ) {
      paymentAmount = Number(
        booking.total_amount
      );
    } else if (
      booking.price !== null &&
      booking.price !== undefined &&
      Number(booking.price) > 0
    ) {
      paymentAmount = Number(booking.price);

      console.log(
        "Booking total_amount missing. Using service price:",
        paymentAmount
      );

      await db.query(
        `
        UPDATE bookings
        SET total_amount = ?
        WHERE id = ?
        `,
        [paymentAmount, booking.id]
      );

      console.log(
        "Booking total_amount updated:",
        paymentAmount
      );
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Booking amount is invalid. Please contact support.",
        booking_total_amount:
          booking.total_amount,
        service_price: booking.price,
      });
    }

    // ====================================
    // SECURITY:
    // DON'T TRUST FRONTEND AMOUNT
    // ====================================

    const frontendAmount = Number(amount);

    if (
      Math.abs(
        frontendAmount - paymentAmount
      ) > 0.01
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match the booking amount.",
        booking_amount: paymentAmount,
        received_amount: frontendAmount,
      });
    }

    // ====================================
    // CHECK IF ALREADY PAID
    // ====================================

    if (booking.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid.",
        payment_status:
          booking.payment_status,
      });
    }

    // ====================================
    // CHECK BOOKING STATUS
    // ====================================

    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be paid. Current status: ${booking.status}`,
        required_status: "accepted",
      });
    }

    // ====================================
    // CHECK EXISTING PAYMENT
    // ====================================

    const [existingPayments] =
      await db.query(
        `
        SELECT *
        FROM payments
        WHERE booking_id = ?
        AND status != 'failed'
        ORDER BY id DESC
        LIMIT 1
        `,
        [booking_id]
      );

    if (existingPayments.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "A payment already exists for this booking.",
        existing_payment:
          existingPayments[0],
      });
    }

    // ====================================
    // NO PLATFORM COMMISSION
    // ====================================

    const commissionPercentage =
      PLATFORM_COMMISSION;

    const commissionAmount = 0;

    // Provider receives 100%.
    const providerEarnings =
      paymentAmount;

    console.log(
      "========================================"
    );
    console.log(
      "=== PAYMENT DETAILS ==="
    );
    console.log({
      booking_id,
      paymentAmount,
      commissionPercentage,
      commissionAmount,
      providerEarnings,
      payment_method:
        selectedPaymentMethod,
    });
    console.log(
      "========================================"
    );

    // ====================================
    // PAY ON SITE
    // ====================================

    if (
      selectedPaymentMethod === "onsite"
    ) {
      const [result] = await db.query(
        `
        INSERT INTO payments
        (
          booking_id,
          amount,
          commission_percentage,
          commission_amount,
          provider_earnings,
          payment_method,
          transaction_id,
          status,
          paid_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          booking_id,
          paymentAmount,
          commissionPercentage,
          commissionAmount,
          providerEarnings,
          "onsite",
          null,
          "pending",
          null,
        ]
      );

      // ====================================
      // UPDATE BOOKING PAYMENT STATUS
      // ====================================

      await db.query(
        `
        UPDATE bookings
        SET payment_status = 'pending'
        WHERE id = ?
        `,
        [booking_id]
      );

      // ====================================
      // CUSTOMER NOTIFICATION
      // ====================================

      await createNotification(
        booking.customer_id,
        "Payment Pending",
        "Pay the provider at the business location. Your payment will be confirmed by the provider."
      );

      // ====================================
      // PROVIDER NOTIFICATION
      // ====================================

      await createNotification(
        booking.provider_id,
        "Onsite Payment Pending",
        `Customer has selected Pay on Site for ${booking.service_name}. Confirm the payment after receiving the money.`
      );

      // ====================================
      // SOCKET EVENT
      // ====================================

      if (global.io) {
        global.io
          .to(`provider_${booking.provider_id}`)
          .emit("payment_pending", {
            booking_id: Number(
              booking_id
            ),
            payment_id: result.insertId,
            payment_method: "onsite",
            amount: paymentAmount,
          });

        global.io
          .to(`user_${booking.customer_id}`)
          .emit("payment_pending", {
            booking_id: Number(
              booking_id
            ),
            payment_id: result.insertId,
            payment_method: "onsite",
            amount: paymentAmount,
          });
      }

      // ====================================
      // RESPONSE
      // ====================================

      return res.status(201).json({
        success: true,
        message:
          "Pay on Site selected. Please pay the provider at the business location.",

        payment: {
          id: result.insertId,
          booking_id: Number(
            booking_id
          ),
          amount: paymentAmount,

          payment_method: "onsite",

          commission_percentage: 0,
          commission_amount: 0,

          provider_earnings:
            paymentAmount,

          transaction_id: null,

          status: "pending",

          paid_at: null,
        },
      });
    }

    // ====================================
    // SAFETY FALLBACK
    // ====================================

    return res.status(400).json({
      success: false,
      message: "Invalid payment method.",
    });
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "CREATE PAYMENT ERROR:"
    );
    console.error(error);
    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ========================================
// CONFIRM ONSITE PAYMENT
// ========================================
//
// SECURITY RULES:
//
// 1. User must be authenticated.
// 2. User must be a provider.
// 3. Provider must own the booking.
// 4. Payment must exist.
// 5. Payment must belong to the booking.
// 6. Payment method must be onsite.
// 7. Payment must still be pending.
// 8. Booking must be accepted.
// 9. Booking must not already be paid.
//
// The provider is the ONLY user allowed
// to confirm that onsite money was received.
//
// ========================================

exports.confirmOnsitePayment = async (
  req,
  res
) => {
  let connection;

  try {
    const provider_id = req.user?.id;
    const provider_role = req.user?.role;

    const {
      payment_id,
    } = req.params;

    // ====================================
    // AUTHENTICATION
    // ====================================

    if (!provider_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ====================================
    // PROVIDER ONLY
    // ====================================

    if (provider_role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only the service provider can confirm an onsite payment.",
      });
    }

    // ====================================
    // VALIDATE PAYMENT ID
    // ====================================

    if (
      !payment_id ||
      !Number.isInteger(
        Number(payment_id)
      ) ||
      Number(payment_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID.",
      });
    }

    // ====================================
    // DATABASE CONNECTION
    // ====================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ====================================
    // LOCK PAYMENT ROW
    // ====================================
    //
    // FOR UPDATE prevents two requests from
    // confirming the same payment at the
    // same time.
    //
    // ====================================

    const [payments] =
      await connection.query(
        `
        SELECT
          p.*,
          b.customer_id,
          b.provider_id,
          b.business_id,
          b.service_id,
          b.booking_date,
          b.booking_time,
          b.status AS booking_status,
          b.payment_status AS booking_payment_status,
          s.service_name,
          customer.full_name AS customer_name,
          provider.full_name AS provider_name
        FROM payments p
        JOIN bookings b
          ON p.booking_id = b.id
        JOIN services s
          ON b.service_id = s.id
        JOIN users customer
          ON b.customer_id = customer.id
        JOIN users provider
          ON b.provider_id = provider.id
        WHERE p.id = ?
        FOR UPDATE
        `,
        [payment_id]
      );

    // ====================================
    // PAYMENT NOT FOUND
    // ====================================

    if (payments.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const payment = payments[0];

    // ====================================
    // VERIFY PROVIDER OWNS BOOKING
    // ====================================

    if (
      Number(payment.provider_id) !==
      Number(provider_id)
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          "Unauthorized. You are not the provider for this booking.",
      });
    }

    // ====================================
    // VERIFY PAYMENT METHOD
    // ====================================

    if (
      String(
        payment.payment_method
      ).toLowerCase() !== "onsite"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Only onsite payments can be confirmed using this endpoint.",
        payment_method:
          payment.payment_method,
      });
    }

    // ====================================
    // CHECK IF ALREADY SUCCESSFUL
    // ====================================

    if (
      payment.status ===
      "successful"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This payment has already been confirmed.",
        payment_id: Number(payment.id),
        payment_status:
          payment.status,
        booking_payment_status:
          payment.booking_payment_status,
      });
    }

    // ====================================
    // PAYMENT MUST BE PENDING
    // ====================================

    if (payment.status !== "pending") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Payment cannot be confirmed. Current payment status: ${payment.status}`,
        payment_status:
          payment.status,
        required_status: "pending",
      });
    }

    // ====================================
    // BOOKING MUST BE ACCEPTED
    // ====================================

    if (
      payment.booking_status !==
      "accepted"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Payment cannot be confirmed because the booking status is ${payment.booking_status}.`,
        booking_status:
          payment.booking_status,
        required_status: "accepted",
      });
    }

    // ====================================
    // BOOKING MUST NOT ALREADY BE PAID
    // ====================================

    if (
      payment.booking_payment_status ===
      "paid"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This booking is already marked as paid.",
        booking_payment_status:
          payment.booking_payment_status,
      });
    }

    // ====================================
    // GENERATE ONSITE TRANSACTION ID
    // ====================================

    const transaction_id =
      `ONSITE-${payment.booking_id}-${crypto.randomUUID()}`;

    // ====================================
    // UPDATE PAYMENT
    // ====================================

    await connection.query(
      `
      UPDATE payments
      SET
        status = 'successful',
        transaction_id = ?,
        paid_at = NOW()
      WHERE id = ?
      AND status = 'pending'
      `,
      [
        transaction_id,
        payment.id,
      ]
    );

    // ====================================
    // UPDATE BOOKING
    // ====================================
    //
    // IMPORTANT:
    // We only mark payment as paid.
    //
    // We DO NOT set booking status to
    // completed here.
    //
    // The provider must still use the
    // Complete Booking endpoint after
    // the service has actually been performed.
    //
    // ====================================

    await connection.query(
      `
      UPDATE bookings
      SET payment_status = 'paid'
      WHERE id = ?
      AND payment_status != 'paid'
      `,
      [payment.booking_id]
    );

    // ====================================
    // COMMIT TRANSACTION
    // ====================================

    await connection.commit();

    // ====================================
    // CUSTOMER NOTIFICATION
    // ====================================

    try {
      await createNotification(
        payment.customer_id,
        "Payment Confirmed",
        `Your payment of ${payment.amount} for ${payment.service_name} has been confirmed by the provider.`
      );
    } catch (notificationError) {
      console.error(
        "CUSTOMER PAYMENT NOTIFICATION ERROR:",
        notificationError
      );
    }

    // ====================================
    // PROVIDER NOTIFICATION
    // ====================================

    try {
      await createNotification(
        payment.provider_id,
        "Payment Confirmed",
        `Onsite payment of ${payment.amount} for ${payment.service_name} has been successfully recorded.`
      );
    } catch (notificationError) {
      console.error(
        "PROVIDER PAYMENT NOTIFICATION ERROR:",
        notificationError
      );
    }

    // ====================================
    // REALTIME SOCKET EVENTS
    // ====================================

    if (global.io) {
      // Customer
      global.io
        .to(
          `user_${payment.customer_id}`
        )
        .emit(
          "payment_successful",
          {
            booking_id: Number(
              payment.booking_id
            ),
            payment_id: Number(
              payment.id
            ),
            amount: Number(
              payment.amount
            ),
            payment_method: "onsite",
            transaction_id:
              transaction_id,
            status: "successful",
          }
        );

      // Provider
      global.io
        .to(
          `provider_${payment.provider_id}`
        )
        .emit(
          "payment_successful",
          {
            booking_id: Number(
              payment.booking_id
            ),
            payment_id: Number(
              payment.id
            ),
            amount: Number(
              payment.amount
            ),
            payment_method: "onsite",
            transaction_id:
              transaction_id,
            status: "successful",
          }
        );
    }

    // ====================================
    // RESPONSE
    // ====================================

    return res.status(200).json({
      success: true,
      message:
        "Onsite payment confirmed successfully.",

      payment: {
        id: Number(payment.id),

        booking_id: Number(
          payment.booking_id
        ),

        amount: Number(
          payment.amount
        ),

        payment_method: "onsite",

        commission_percentage: Number(
          payment.commission_percentage || 0
        ),

        commission_amount: Number(
          payment.commission_amount || 0
        ),

        provider_earnings: Number(
          payment.provider_earnings
        ),

        transaction_id:
          transaction_id,

        status: "successful",

        paid_at: new Date(),
      },

      booking: {
        id: Number(
          payment.booking_id
        ),

        status:
          payment.booking_status,

        payment_status: "paid",
      },
    });
  } catch (error) {
    // ====================================
    // ROLLBACK
    // ====================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "========================================"
    );

    console.error(
      "CONFIRM ONSITE PAYMENT ERROR:"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to confirm onsite payment.",
      error: error.message,
    });
  } finally {
    // ====================================
    // RELEASE CONNECTION
    // ====================================

    if (connection) {
      connection.release();
    }
  }
};

// ========================================
// VERIFY STRIPE PAYMENT
// ========================================
// Kept for future card payments.
// Card payments are currently disabled.
// ========================================

exports.verifyStripePayment = async (
  req,
  res
) => {
  try {
    const { session_id } =
      req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message:
          "Session ID is required.",
      });
    }

    // ====================================
    // STRIPE NOT CONFIGURED
    // ====================================

    if (!stripe) {
      return res.status(503).json({
        success: false,
        coming_soon: true,
        message:
          "Card payments are coming soon.",
      });
    }

    const session =
      await stripe.checkout.sessions.retrieve(
        session_id
      );

    if (
      session.payment_status !==
      "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment not completed.",
        payment_status:
          session.payment_status,
      });
    }

    const booking_id =
      session.metadata?.booking_id;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID was not found in the Stripe session.",
      });
    }

    // ====================================
    // UPDATE PAYMENT
    // ====================================

    await db.query(
      `
      UPDATE payments
      SET
        status = 'successful',
        paid_at = NOW()
      WHERE transaction_id = ?
      `,
      [session_id]
    );

    // ====================================
    // UPDATE BOOKING
    // ====================================

    await db.query(
      `
      UPDATE bookings
      SET payment_status = 'paid'
      WHERE id = ?
      `,
      [booking_id]
    );

    // ====================================
    // SOCKET EVENT
    // ====================================

    if (global.io) {
      global.io.emit(
        "payment_successful",
        {
          booking_id:
            parseInt(booking_id),
          transaction_id:
            session_id,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully.",
      booking_id:
        parseInt(booking_id),
      transaction_id:
        session_id,
      status: "paid",
    });
  } catch (error) {
    console.error(
      "VERIFY STRIPE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ========================================
// STRIPE WEBHOOK
// ========================================
// Kept for future card payments.
// ========================================

exports.stripeWebhook = async (
  req,
  res
) => {
  const sig =
    req.headers[
      "stripe-signature"
    ];

  if (!sig) {
    return res.status(400).json({
      success: false,
      message:
        "No Stripe signature found.",
    });
  }

  if (!stripe) {
    return res.status(503).json({
      success: false,
      message:
        "Stripe is not configured.",
    });
  }

  let event;

  try {
    event =
      stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env
          .STRIPE_WEBHOOK_SECRET
      );
  } catch (err) {
    console.error(
      "WEBHOOK ERROR:",
      err.message
    );

    return res
      .status(400)
      .send(
        `Webhook Error: ${err.message}`
      );
  }

  // ====================================
  // PAYMENT COMPLETED
  // ====================================

  if (
    event.type ===
    "checkout.session.completed"
  ) {
    const session =
      event.data.object;

    const booking_id =
      session.metadata?.booking_id;

    if (booking_id) {
      // ==================================
      // UPDATE PAYMENT
      // ==================================

      await db.query(
        `
        UPDATE payments
        SET
          status = 'successful',
          paid_at = NOW()
        WHERE transaction_id = ?
        `,
        [session.id]
      );

      // ==================================
      // UPDATE BOOKING
      // ==================================

      await db.query(
        `
        UPDATE bookings
        SET payment_status = 'paid'
        WHERE id = ?
        `,
        [booking_id]
      );

      // ==================================
      // SOCKET EVENT
      // ==================================

      if (global.io) {
        global.io.emit(
          "payment_successful",
          {
            booking_id:
              parseInt(
                booking_id
              ),
            transaction_id:
              session.id,
          }
        );
      }
    }
  }

  return res.status(200).json({
    received: true,
  });
};

// ========================================
// DOWNLOAD RECEIPT
// ========================================

exports.downloadReceipt = async (
  req,
  res
) => {
  try {
    const {
      payment_id,
    } = req.params;

    // ====================================
    // FETCH PAYMENT
    // ====================================

    const [payments] =
      await db.query(
        `
        SELECT
          p.*,
          b.*,
          s.service_name
        FROM payments p
        JOIN bookings b
          ON p.booking_id = b.id
        JOIN services s
          ON b.service_id = s.id
        WHERE p.id = ?
        `,
        [payment_id]
      );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Receipt data retrieved successfully.",
      receipt: payments[0],
    });
  } catch (error) {
    console.error(
      "RECEIPT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

// ========================================
// CUSTOMER PAYMENTS
// ========================================

exports.getCustomerPayments = async (
  req,
  res
) => {
  try {
    const customer_id =
      req.user.id;

    const [payments] =
      await db.query(
        `
        SELECT
          p.*,
          b.booking_date,
          b.booking_time,
          s.service_name,
          u.full_name AS provider_name
        FROM payments p
        JOIN bookings b
          ON p.booking_id = b.id
        JOIN services s
          ON b.service_id = s.id
        JOIN users u
          ON b.provider_id = u.id
        WHERE b.customer_id = ?
        ORDER BY p.created_at DESC
        `,
        [customer_id]
      );

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

// ========================================
// PROVIDER PAYMENTS
// ========================================

exports.getProviderPayments = async (
  req,
  res
) => {
  try {
    const provider_id =
      req.user.id;

    const [payments] =
      await db.query(
        `
        SELECT
          p.*,
          b.booking_date,
          b.booking_time,
          s.service_name,
          u.full_name AS customer_name
        FROM payments p
        JOIN bookings b
          ON p.booking_id = b.id
        JOIN services s
          ON b.service_id = s.id
        JOIN users u
          ON b.customer_id = u.id
        WHERE b.provider_id = ?
        ORDER BY p.created_at DESC
        `,
        [provider_id]
      );

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "GET PROVIDER PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

// ========================================
// ADMIN PAYMENTS
// ========================================

exports.getAdminPayments = async (
  req,
  res
) => {
  try {
    const [payments] =
      await db.query(
        `
        SELECT
          p.*,
          b.booking_date,
          b.booking_time,
          s.service_name,
          customer.full_name AS customer_name,
          provider.full_name AS provider_name
        FROM payments p
        JOIN bookings b
          ON p.booking_id = b.id
        JOIN services s
          ON b.service_id = s.id
        JOIN users customer
          ON b.customer_id = customer.id
        JOIN users provider
          ON b.provider_id = provider.id
        ORDER BY p.created_at DESC
        `
      );

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "GET ADMIN PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};