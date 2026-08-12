const db = require("../config/database");

const {
  createNotification,
} = require("./notificationController")

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
      payment_method,
      notes,
    } = req.body;

    // VALIDATION
    if (!provider_id || !business_id || !service_id || !booking_date || !booking_time) {
      return res.status(400).json({
        message: "All required fields are required",
      });
    }

    // CHECK SERVICE
    const [services] = await db.query(`
      SELECT *
      FROM services
      WHERE id = ?
    `, [service_id]);

    if (services.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const service = services[0];

    // CHECK CONFLICT
    const [conflicts] = await db.query(`
      SELECT *
      FROM bookings
      WHERE provider_id = ?
      AND booking_date = ?
      AND booking_time = ?
      AND status IN ('pending', 'accepted')
    `, [provider_id, booking_date, booking_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Selected slot unavailable",
      });
    }

    // FIXED: Use valid payment_status values from ENUM: 'pending', 'paid', 'failed'
    // For new bookings, always use 'pending' until payment is confirmed
    const payment_status = 'pending';  // NOT 'unpaid'
    
    // Validate payment_method against ENUM: 'online' or 'onsite'
    const validPaymentMethod = payment_method === 'online' ? 'online' : 'onsite';

    // CREATE BOOKING
// In your createBooking function, add total_amount from service price
const [result] = await db.query(`
  INSERT INTO bookings
  (
    customer_id, provider_id, business_id, service_id,
    booking_date, booking_time, payment_method,
    payment_status, notes, total_amount
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  customer_id,
  provider_id,
  business_id,
  service_id,
  booking_date,
  booking_time,
  payment_method || "onsite",
  'pending',  // Changed from 'unpaid' to 'pending'
  notes || null,
  service.price  // This sets total_amount from service price
]);

    // ========================================
    // AUTO CREATE CHAT CONVERSATION
    // ========================================
    
    // CHECK IF CONVERSATION EXISTS
    const [existingConversation] = await db.query(`
      SELECT *
      FROM conversations
      WHERE customer_id = ?
      AND provider_id = ?
    `, [customer_id, provider_id]);

    let conversation_id;

    // CREATE NEW CONVERSATION IF NOT EXISTS
    if (existingConversation.length === 0) {
      const [conversationResult] = await db.query(`
        INSERT INTO conversations (customer_id, provider_id)
        VALUES (?, ?)
      `, [customer_id, provider_id]);

      conversation_id = conversationResult.insertId;

      // CREATE FIRST CHAT MESSAGE
      await db.query(`
        INSERT INTO messages (conversation_id, sender_id, receiver_id, message)
        VALUES (?, ?, ?, ?)
      `, [conversation_id, provider_id, customer_id, "Booking confirmed. You can now chat here."]);
    } else {
      conversation_id = existingConversation[0].id;
    }

    // DATABASE NOTIFICATION
    await createNotification(
      provider_id,
      "New Booking Request",
      `New booking request for ${service.service_name} on ${booking_date} at ${booking_time}`
    );

    // REALTIME NOTIFICATION
    if (global.io) {
      global.io.to(`provider_${provider_id}`).emit("receive_notification", {
        type: "booking",
        title: "New Booking Request",
        message: `New booking request for ${service.service_name}`,
        booking_id: result.insertId,
      });
    }

    res.status(201).json({
      message: "Booking submitted successfully",
      booking_id: result.insertId,
      conversation_id: conversation_id,
    });

  } catch (error) {
    console.log("CREATE BOOKING ERROR:", error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
      SELECT
        bookings.*,
        services.service_name,
        services.price,
        businesses.business_name,
        users.full_name AS provider_name
      FROM bookings
      JOIN services ON bookings.service_id = services.id
      JOIN businesses ON bookings.business_id = businesses.id
      JOIN users ON bookings.provider_id = users.id
      WHERE bookings.customer_id = ?
      ORDER BY bookings.created_at DESC
    `, [customer_id]);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
      SELECT
        bookings.*,
        services.service_name,
        users.full_name AS customer_name,
        users.email AS customer_email,
        users.phone AS customer_phone,
        businesses.business_name
      FROM bookings
      JOIN services ON bookings.service_id = services.id
      JOIN users ON bookings.customer_id = users.id
      JOIN businesses ON bookings.business_id = businesses.id
      WHERE bookings.provider_id = ?
      ORDER BY bookings.created_at DESC
    `, [provider_id]);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({
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
      JOIN users ON bookings.customer_id = users.id
      JOIN services ON bookings.service_id = services.id
      JOIN businesses ON bookings.business_id = businesses.id
      ORDER BY bookings.created_at DESC
    `);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
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
      JOIN services ON bookings.service_id = services.id
      JOIN businesses ON bookings.business_id = businesses.id
      JOIN users AS customer ON bookings.customer_id = customer.id
      JOIN users AS provider ON bookings.provider_id = provider.id
      WHERE bookings.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Check authorization
    if (user_role !== 'admin' && 
        booking.customer_id !== user_id && 
        booking.provider_id !== user_id) {
      return res.status(403).json({
        message: "Unauthorized to view this booking",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await db.query(`
      UPDATE bookings
      SET status = 'accepted'
      WHERE id = ?
    `, [id]);

    await createNotification(
      booking.customer_id,
      "Booking Accepted",
      `Your booking for ${booking.booking_date} at ${booking.booking_time} has been accepted.`
    );

    if (global.io) {
      global.io.to(`user_${booking.customer_id}`).emit("receive_notification", {
        type: "booking",
        title: "Booking Accepted",
        message: "Your booking has been accepted.",
        booking_id: parseInt(id),
      });
    }

    res.status(200).json({
      message: "Booking accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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
        message: "Decline reason required",
      });
    }

    const [bookings] = await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await db.query(`
      UPDATE bookings
      SET status = 'declined', decline_reason = ?
      WHERE id = ?
    `, [decline_reason, id]);

    await createNotification(
      booking.customer_id,
      "Booking Declined",
      `Your booking has been declined. Reason: ${decline_reason}`
    );

    if (global.io) {
      global.io.to(`user_${booking.customer_id}`).emit("receive_notification", {
        type: "booking",
        title: "Booking Declined",
        message: decline_reason,
        booking_id: parseInt(id),
      });
    }

    res.status(200).json({
      message: "Booking declined successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.provider_id !== provider_id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await db.query(`
      UPDATE bookings
      SET status = 'completed'
      WHERE id = ?
    `, [id]);

    await createNotification(
      booking.customer_id,
      "Booking Completed",
      "Your service has been completed. Thank you for choosing us!"
    );

    if (global.io) {
      global.io.to(`user_${booking.customer_id}`).emit("receive_notification", {
        type: "booking",
        title: "Booking Completed",
        message: "Your service has been completed.",
        booking_id: parseInt(id),
      });
    }

    res.status(200).json({
      message: "Booking completed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

    const [bookings] = await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (booking.customer_id !== customer_id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Check if booking can be cancelled (only pending or accepted)
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      return res.status(400).json({
        message: `Cannot cancel booking with status: ${booking.status}`,
      });
    }

    await db.query(`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ?
    `, [id]);

    await createNotification(
      booking.provider_id,
      "Booking Cancelled",
      `Customer cancelled booking for ${booking.booking_date} at ${booking.booking_time}`
    );

    if (global.io) {
      global.io.to(`provider_${booking.provider_id}`).emit("receive_notification", {
        type: "booking",
        title: "Booking Cancelled",
        message: "Customer cancelled booking.",
        booking_id: parseInt(id),
      });
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// UPDATE BOOKING STATUS (ADMIN)
// ========================================

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const [bookings] = await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await db.query(`
      UPDATE bookings
      SET status = ?
      WHERE id = ?
    `, [status, id]);

    res.status(200).json({
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};