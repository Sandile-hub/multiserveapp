const db = require("../config/database");

const {
  createNotification,
} = require("./notificationController");

// ========================================
// CREATE BOOKING
// ========================================

exports.createBooking = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const {
      provider_id,
      business_id,
      service_id,
      booking_date,
      booking_time,
      notes,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !provider_id ||
      !business_id ||
      !service_id ||
      !booking_date ||
      !booking_time
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // ========================================
    // PAYMENT METHOD
    // PAY ONSITE ONLY
    // ========================================

    const payment_method = "onsite";

    // ========================================
    // CHECK SERVICE
    // ========================================

    const [services] = await db.query(
      `
      SELECT *
      FROM services
      WHERE id = ?
      `,
      [service_id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    // ========================================
    // VALIDATE SERVICE PRICE
    // ========================================

    const servicePrice = Number(service.price);

    if (!servicePrice || servicePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "This service does not have a valid price.",
      });
    }

    // ========================================
    // CHECK PROVIDER
    // ========================================

    const [providers] = await db.query(
      `
      SELECT id, full_name, role, is_active
      FROM users
      WHERE id = ?
      `,
      [provider_id]
    );

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const provider = providers[0];

    if (provider.role !== "provider") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a service provider",
      });
    }

    if (!provider.is_active) {
      return res.status(400).json({
        success: false,
        message: "This provider is currently unavailable",
      });
    }

    // ========================================
    // CHECK BUSINESS
    // ========================================

    const [businesses] = await db.query(
      `
      SELECT *
      FROM businesses
      WHERE id = ?
      `,
      [business_id]
    );

    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // ========================================
    // CHECK BOOKING CONFLICT
    // ========================================

    const [conflicts] = await db.query(
      `
      SELECT id
      FROM bookings
      WHERE provider_id = ?
      AND booking_date = ?
      AND booking_time = ?
      AND status IN ('pending', 'accepted')
      `,
      [provider_id, booking_date, booking_time]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is unavailable",
      });
    }

    // ========================================
    // PAYMENT STATUS
    // ========================================

    // Onsite payment has not been collected yet.
    const payment_status = "pending";

    // ========================================
    // CREATE BOOKING
    // ========================================

    const [result] = await db.query(
      `
      INSERT INTO bookings
      (
        customer_id,
        provider_id,
        business_id,
        service_id,
        booking_date,
        booking_time,
        payment_method,
        payment_status,
        notes,
        total_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customer_id,
        provider_id,
        business_id,
        service_id,
        booking_date,
        booking_time,
        payment_method,
        payment_status,
        notes || null,
        servicePrice,
      ]
    );

    const booking_id = result.insertId;

    // ========================================
    // AUTO CREATE CHAT CONVERSATION
    // ========================================

    const [existingConversation] = await db.query(
      `
      SELECT id
      FROM conversations
      WHERE customer_id = ?
      AND provider_id = ?
      `,
      [customer_id, provider_id]
    );

    let conversation_id;

    if (existingConversation.length === 0) {
      const [conversationResult] = await db.query(
        `
        INSERT INTO conversations
        (
          customer_id,
          provider_id
        )
        VALUES (?, ?)
        `,
        [customer_id, provider_id]
      );

      conversation_id = conversationResult.insertId;

      // First chat message
      await db.query(
        `
        INSERT INTO messages
        (
          conversation_id,
          sender_id,
          receiver_id,
          message
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          conversation_id,
          provider_id,
          customer_id,
          "Booking request received. You can now chat here.",
        ]
      );
    } else {
      conversation_id = existingConversation[0].id;
    }

    // ========================================
    // DATABASE NOTIFICATION
    // ========================================

    await createNotification(
      provider_id,
      "New Booking Request",
      `New booking request for ${service.service_name} on ${booking_date} at ${booking_time}`
    );

    // ========================================
    // REALTIME NOTIFICATION
    // ========================================

    if (global.io) {
      global.io
        .to(`provider_${provider_id}`)
        .emit("receive_notification", {
          type: "booking",
          title: "New Booking Request",
          message: `New booking request for ${service.service_name}`,
          booking_id: booking_id,
        });
    }

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,
      message: "Booking submitted successfully",
      booking_id: booking_id,
      conversation_id: conversation_id,

      booking: {
        id: booking_id,
        service_id: service_id,
        service_name: service.service_name,
        booking_date: booking_date,
        booking_time: booking_time,
        total_amount: servicePrice,
        payment_method: "onsite",
        payment_status: "pending",
        status: "pending",
      },
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ========================================
// CUSTOMER BOOKINGS
// ========================================

exports.getCustomerBookings = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const [bookings] = await db.query(
      `
      SELECT
        bookings.*,
        services.service_name,
        services.price,
        businesses.business_name,
        users.full_name AS provider_name
      FROM bookings
      JOIN services
        ON bookings.service_id = services.id
      JOIN businesses
        ON bookings.business_id = businesses.id
      JOIN users
        ON bookings.provider_id = users.id
      WHERE bookings.customer_id = ?
      ORDER BY bookings.created_at DESC
      `,
      [customer_id]
    );

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET CUSTOMER BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// PROVIDER BOOKINGS
// ========================================

exports.getProviderBookings = async (req, res) => {
  try {
    const provider_id = req.user.id;

    const [bookings] = await db.query(
      `
      SELECT
        bookings.*,
        services.service_name,
        users.full_name AS customer_name,
        users.email AS customer_email,
        users.phone AS customer_phone,
        businesses.business_name
      FROM bookings
      JOIN services
        ON bookings.service_id = services.id
      JOIN users
        ON bookings.customer_id = users.id
      JOIN businesses
        ON bookings.business_id = businesses.id
      WHERE bookings.provider_id = ?
      ORDER BY bookings.created_at DESC
      `,
      [provider_id]
    );

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET PROVIDER BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// ADMIN BOOKINGS
// ========================================

exports.getAdminBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT
        bookings.*,
        users.full_name AS customer_name,
        services.service_name,
        businesses.business_name
      FROM bookings
      JOIN users
        ON bookings.customer_id = users.id
      JOIN services
        ON bookings.service_id = services.id
      JOIN businesses
        ON bookings.business_id = businesses.id
      ORDER BY bookings.created_at DESC
    `);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET ADMIN BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// GET SINGLE BOOKING
// ========================================

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const [bookings] = await db.query(
      `
      SELECT
        bookings.*,
        services.service_name,
        services.price,
        services.duration,
        businesses.business_name,
        businesses.address,
        customer.full_name AS customer_name,
        customer.email AS customer_email,
        customer.phone AS customer_phone,
        provider.full_name AS provider_name,
        provider.email AS provider_email
      FROM bookings
      JOIN services
        ON bookings.service_id = services.id
      JOIN businesses
        ON bookings.business_id = businesses.id
      JOIN users AS customer
        ON bookings.customer_id = customer.id
      JOIN users AS provider
        ON bookings.provider_id = provider.id
      WHERE bookings.id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (
      user_role !== "admin" &&
      booking.customer_id !== user_id &&
      booking.provider_id !== user_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this booking",
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// ACCEPT BOOKING
// ========================================

exports.acceptBooking = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { id } = req.params;

    const [bookings] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await db.query(
      `
      UPDATE bookings
      SET status = 'accepted'
      WHERE id = ?
      `,
      [id]
    );

    await createNotification(
      booking.customer_id,
      "Booking Accepted",
      `Your booking for ${booking.booking_date} at ${booking.booking_time} has been accepted. Please pay onsite at the business location.`
    );

    if (global.io) {
      global.io
        .to(`user_${booking.customer_id}`)
        .emit("receive_notification", {
          type: "booking",
          title: "Booking Accepted",
          message:
            "Your booking has been accepted. Payment will be made onsite.",
          booking_id: parseInt(id),
        });
    }

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
    });
  } catch (error) {
    console.error("ACCEPT BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// DECLINE BOOKING
// ========================================

exports.declineBooking = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { id } = req.params;
    const { decline_reason } = req.body;

    if (!decline_reason) {
      return res.status(400).json({
        success: false,
        message: "Decline reason required",
      });
    }

    const [bookings] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await db.query(
      `
      UPDATE bookings
      SET status = 'declined',
          decline_reason = ?
      WHERE id = ?
      `,
      [decline_reason, id]
    );

    await createNotification(
      booking.customer_id,
      "Booking Declined",
      `Your booking has been declined. Reason: ${decline_reason}`
    );

    if (global.io) {
      global.io
        .to(`user_${booking.customer_id}`)
        .emit("receive_notification", {
          type: "booking",
          title: "Booking Declined",
          message: decline_reason,
          booking_id: parseInt(id),
        });
    }

    return res.status(200).json({
      success: true,
      message: "Booking declined successfully",
    });
  } catch (error) {
    console.error("DECLINE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// COMPLETE BOOKING
// ========================================

exports.completeBooking = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { id } = req.params;

    const [bookings] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ========================================
    // ONSITE PAYMENT REMINDER
    // ========================================

    if (booking.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Payment must be confirmed before completing this booking.",
        payment_status: booking.payment_status,
      });
    }

    await db.query(
      `
      UPDATE bookings
      SET status = 'completed'
      WHERE id = ?
      `,
      [id]
    );

    await createNotification(
      booking.customer_id,
      "Booking Completed",
      "Your service has been completed. Thank you for choosing us!"
    );

    if (global.io) {
      global.io
        .to(`user_${booking.customer_id}`)
        .emit("receive_notification", {
          type: "booking",
          title: "Booking Completed",
          message: "Your service has been completed.",
          booking_id: parseInt(id),
        });
    }

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully",
    });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// CANCEL BOOKING
// ========================================

exports.cancelBooking = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { id } = req.params;

    const [bookings] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      booking.status !== "pending" &&
      booking.status !== "accepted"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`,
      });
    }

    await db.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [id]
    );

    await createNotification(
      booking.provider_id,
      "Booking Cancelled",
      `Customer cancelled booking for ${booking.booking_date} at ${booking.booking_time}`
    );

    if (global.io) {
      global.io
        .to(`provider_${booking.provider_id}`)
        .emit("receive_notification", {
          type: "booking",
          title: "Booking Cancelled",
          message: "Customer cancelled booking.",
          booking_id: parseInt(id),
        });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ========================================
// UPDATE BOOKING STATUS - ADMIN
// ========================================

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "declined",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const [bookings] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await db.query(
      `
      UPDATE bookings
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};