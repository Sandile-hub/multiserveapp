const db = require("../config/database");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ========================================
// PLATFORM COMMISSION
// ========================================
const PLATFORM_COMMISSION = 10;

// ========================================
// CREATE PAYMENT
// ========================================
exports.createPayment = async (req, res) => {
  try {
    // DEBUG: Log incoming request
    console.log("=== PAYMENT REQUEST DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("============================");

    const {
      booking_id,
      amount,
      payment_method,
    } = req.body;

    // ====================================
    // VALIDATION - IMPROVED ERROR MESSAGES
    // ====================================
    const missingFields = [];
    if (!booking_id) missingFields.push("booking_id");
    if (!amount) missingFields.push("amount");
    if (!payment_method) missingFields.push("payment_method");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missing_fields: missingFields
      });
    }

    // Validate payment method
    const validPaymentMethods = ["stripe", "onsite"];
    if (!validPaymentMethods.includes(payment_method.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}`,
        received: payment_method
      });
    }

    // Validate amount is positive number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Amount must be a positive number",
        received: amount
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
      JOIN services ON bookings.service_id = services.id
      JOIN users ON bookings.provider_id = users.id
      WHERE bookings.id = ?
      `,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        booking_id: booking_id
      });
    }

    const booking = bookings[0];

    // 🔥 FIX: Ensure total_amount exists
    let paymentAmount = Number(amount);
    
    if (!booking.total_amount || booking.total_amount <= 0) {
      console.log("⚠️ Booking total_amount is missing:", booking.total_amount);
      console.log("Using service price as fallback:", booking.price);
      
      if (booking.price && booking.price > 0) {
        paymentAmount = Number(booking.price);
        // Update the booking with correct amount
        await db.query(
          `UPDATE bookings SET total_amount = ? WHERE id = ?`,
          [paymentAmount, booking.id]
        );
        console.log("✅ Updated booking with total_amount:", paymentAmount);
      } else {
        return res.status(400).json({
          success: false,
          message: "Booking amount is invalid. Please contact support.",
          booking_total_amount: booking.total_amount,
          service_price: booking.price
        });
      }
    }

    // Verify booking belongs to the customer
    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This booking does not belong to you"
      });
    }

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
        payment_status: booking.payment_status
      });
    }

    // Check if booking status is accepted
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be paid. Current status: ${booking.status}`,
        required_status: 'accepted'
      });
    }

    // ====================================
    // PREVENT DUPLICATE PAYMENTS
    // ====================================
    const [existingPayments] = await db.query(
      `
      SELECT * FROM payments
      WHERE booking_id = ? AND status != 'failed'
      `,
      [booking_id]
    );

    if (existingPayments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A payment already exists for this booking",
        existing_payment: existingPayments[0]
      });
    }

    // ====================================
    // COMMISSION CALCULATION
    // ====================================
    const commissionPercentage = PLATFORM_COMMISSION;
    const commissionAmount = (paymentAmount * commissionPercentage) / 100;
    const providerEarnings = paymentAmount - commissionAmount;

    console.log("Payment Details:", {
      booking_id,
      paymentAmount,
      commissionAmount,
      providerEarnings,
      payment_method
    });

    // ====================================
    // STRIPE PAYMENT
    // ====================================
    if (payment_method.toLowerCase() === "stripe") {
      // Validate Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY is not configured");
        return res.status(500).json({
          success: false,
          message: "Payment system is not properly configured"
        });
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "zar",
                product_data: {
                  name: booking.service_name,
                  description: `Booking with ${booking.provider_name} on ${booking.booking_date} at ${booking.booking_time}`,
                },
                unit_amount: Math.round(paymentAmount * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            booking_id: booking_id.toString(),
            amount: paymentAmount.toString(),
            commission_amount: commissionAmount.toString(),
            provider_earnings: providerEarnings.toString(),
            customer_id: req.user.id.toString()
          },
          success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-cancel`,
        });

        console.log("✅ Stripe session created:", session.id);

        // CREATE PAYMENT RECORD
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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            booking_id,
            paymentAmount,
            commissionPercentage,
            commissionAmount,
            providerEarnings,
            payment_method,
            session.id,
            "pending",
          ]
        );

        // UPDATE BOOKING
        await db.query(
          `
          UPDATE bookings
          SET payment_status = 'pending'
          WHERE id = ?
          `,
          [booking_id]
        );

        return res.status(200).json({
          success: true,
          message: "Stripe checkout created",
          payment_url: session.url,
          session_id: session.id,
          payment: {
            id: result.insertId,
            booking_id: booking_id,
            amount: paymentAmount,
            payment_method: payment_method,
            transaction_id: session.id,
            status: "pending",
          },
        });

      } catch (stripeError) {
        console.error("Stripe Error:", stripeError);
        return res.status(400).json({
          success: false,
          message: "Stripe payment creation failed",
          error: stripeError.message
        });
      }
    }

    // ====================================
    // ONSITE PAYMENT
    // ====================================
    if (payment_method.toLowerCase() === "onsite") {
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          booking_id,
          paymentAmount,
          commissionPercentage,
          commissionAmount,
          providerEarnings,
          payment_method,
          null,
          "pending",
        ]
      );

      await db.query(
        `
        UPDATE bookings
        SET payment_status = 'pending'
        WHERE id = ?
        `,
        [booking_id]
      );

      return res.status(201).json({
        success: true,
        message: "Onsite payment selected. Please pay at the business location.",
        payment: {
          id: result.insertId,
          booking_id: booking_id,
          amount: paymentAmount,
          payment_method: payment_method,
          status: "pending",
        },
      });
    }

    // Should never reach here
    return res.status(400).json({
      success: false,
      message: "Invalid payment method"
    });

  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Keep all your other functions (verifyStripePayment, stripeWebhook, etc.) the same
// ... rest of your existing code ...

// ========================================
// VERIFY STRIPE PAYMENT
// ========================================
exports.verifyStripePayment = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        payment_status: session.payment_status
      });
    }

    const booking_id = session.metadata.booking_id;

    // UPDATE PAYMENT
    await db.query(
      `
      UPDATE payments
      SET status = 'successful'
      WHERE transaction_id = ?
      `,
      [session_id]
    );

    // UPDATE BOOKING
    await db.query(
      `
      UPDATE bookings
      SET payment_status = 'paid'
      WHERE id = ?
      `,
      [booking_id]
    );

    // SOCKET EVENT
    if (global.io) {
      global.io.emit("payment_successful", {
        booking_id: parseInt(booking_id),
        transaction_id: session_id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking_id: parseInt(booking_id),
      transaction_id: session_id,
      status: "paid",
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// ========================================
// STRIPE WEBHOOK
// ========================================
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    return res.status(400).json({
      success: false,
      message: "No stripe signature found"
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ====================================
  // PAYMENT COMPLETED
  // ====================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const booking_id = session.metadata.booking_id;

    await db.query(
      `
      UPDATE payments
      SET status = 'successful'
      WHERE transaction_id = ?
      `,
      [session.id]
    );

    await db.query(
      `
      UPDATE bookings
      SET payment_status = 'paid'
      WHERE id = ?
      `,
      [booking_id]
    );

    if (global.io) {
      global.io.emit("payment_successful", {
        booking_id: parseInt(booking_id),
        transaction_id: session.id,
      });
    }
  }

  res.status(200).json({ received: true });
};

// ========================================
// DOWNLOAD RECEIPT
// ========================================
exports.downloadReceipt = async (req, res) => {
  try {
    const { payment_id } = req.params;

    // Fetch payment details
    const [payments] = await db.query(
      `
      SELECT p.*, b.*, s.service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE p.id = ?
      `,
      [payment_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipt data retrieved",
      receipt: payments[0]
    });

  } catch (error) {
    console.error("RECEIPT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ========================================
// CUSTOMER PAYMENTS
// ========================================
exports.getCustomerPayments = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const [payments] = await db.query(
      `
      SELECT 
        p.*,
        b.booking_date,
        b.booking_time,
        s.service_name,
        u.full_name as provider_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.provider_id = u.id
      WHERE b.customer_id = ?
      ORDER BY p.created_at DESC
      `,
      [customer_id]
    );

    res.status(200).json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ========================================
// PROVIDER PAYMENTS
// ========================================
exports.getProviderPayments = async (req, res) => {
  try {
    const provider_id = req.user.id;

    const [payments] = await db.query(
      `
      SELECT 
        p.*,
        b.booking_date,
        b.booking_time,
        s.service_name,
        u.full_name as customer_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.provider_id = ?
      ORDER BY p.created_at DESC
      `,
      [provider_id]
    );

    res.status(200).json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ========================================
// ADMIN PAYMENTS
// ========================================
exports.getAdminPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `
      SELECT 
        p.*,
        b.booking_date,
        b.booking_time,
        s.service_name,
        customer.full_name as customer_name,
        provider.full_name as provider_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      JOIN users customer ON b.customer_id = customer.id
      JOIN users provider ON b.provider_id = provider.id
      ORDER BY p.created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};