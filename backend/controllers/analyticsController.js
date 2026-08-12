const db = require("../config/database");

// ========================================
// ADMIN PLATFORM ANALYTICS
// ========================================

exports.getAnalytics =
async (req, res) => {

  try {

    // ====================================
    // TOTAL USERS
    // ====================================

    const [[users]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalUsers
      FROM users
      `
    )

    // ====================================
    // TOTAL BUSINESSES
    // ====================================

    const [[businesses]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalBusinesses
      FROM businesses
      `
    )

    // ====================================
    // TOTAL BOOKINGS
    // ====================================

    const [[bookings]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalBookings
      FROM bookings
      `
    )

    // ====================================
    // COMPLETED BOOKINGS
    // ====================================

    const [[completedBookings]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS completed
      FROM bookings
      WHERE status =
      'completed'
      `
    )

    // ====================================
    // PENDING BOOKINGS
    // ====================================

    const [[pendingBookings]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS pending
      FROM bookings
      WHERE status =
      'pending'
      `
    )

    // ====================================
    // TOTAL REVENUE
    // ====================================

    const [[revenue]] =
    await db.query(
      `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS totalRevenue

      FROM payments

      WHERE status =
      'successful'
      `
    )

    // ====================================
    // TOTAL PROVIDERS
    // ====================================

    const [[providers]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalProviders
      FROM users
      WHERE role =
      'provider'
      `
    )

    // ====================================
    // TOTAL CUSTOMERS
    // ====================================

    const [[customers]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalCustomers
      FROM users
      WHERE role =
      'customer'
      `
    )

    // ====================================
    // RECENT BOOKINGS
    // ====================================

    const [recentBookings] =
    await db.query(
      `
      SELECT

        bookings.id,

        bookings.status,

        bookings.created_at,

        services.service_name,

        customer.full_name
        AS customer_name,

        provider.full_name
        AS provider_name

      FROM bookings

      JOIN services
      ON bookings.service_id =
      services.id

      JOIN users customer
      ON bookings.customer_id =
      customer.id

      JOIN users provider
      ON bookings.provider_id =
      provider.id

      ORDER BY bookings.created_at DESC

      LIMIT 5
      `
    )

    // ====================================
    // RECENT PAYMENTS
    // ====================================

    const [recentPayments] =
    await db.query(
      `
      SELECT

        payments.id,

        payments.amount,

        payments.status,

        payments.payment_method,

        payments.created_at,

        customer.full_name
        AS customer_name

      FROM payments

      JOIN bookings
      ON payments.booking_id =
      bookings.id

      JOIN users customer
      ON bookings.customer_id =
      customer.id

      ORDER BY payments.created_at DESC

      LIMIT 5
      `
    )

    // ====================================
    // RESPONSE
    // ====================================

    res.status(200).json({

      stats: {

        users:
        users.totalUsers,

        providers:
        providers.totalProviders,

        customers:
        customers.totalCustomers,

        businesses:
        businesses.totalBusinesses,

        bookings:
        bookings.totalBookings,

        completed:
        completedBookings.completed,

        pending:
        pendingBookings.pending,

        revenue:
        revenue.totalRevenue,
      },

      recentBookings,

      recentPayments,
    })

  } catch (error) {

    console.log(
      "ANALYTICS ERROR:",
      error
    )

    res.status(500).json({

      success: false,

      message:
      "Server Error",
    })
  }
}

// ========================================
// CUSTOMER ANALYTICS
// ========================================

exports.getCustomerAnalytics =
async (req, res) => {

  try {

    const customer_id =
    req.user.id

    // ====================================
    // TOTAL BOOKINGS
    // ====================================

    const [[bookings]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalBookings
      FROM bookings
      WHERE customer_id = ?
      `,
      [customer_id]
    )

    // ====================================
    // COMPLETED BOOKINGS
    // ====================================

    const [[completed]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS completedBookings
      FROM bookings
      WHERE customer_id = ?
      AND status = 'completed'
      `,
      [customer_id]
    )

    // ====================================
    // PENDING BOOKINGS
    // ====================================

    const [[pending]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS pendingBookings
      FROM bookings
      WHERE customer_id = ?
      AND status = 'pending'
      `,
      [customer_id]
    )

    // ====================================
    // TOTAL PAYMENTS
    // ====================================

    const [[payments]] =
    await db.query(
      `
      SELECT
        COALESCE(
          SUM(payments.amount),
          0
        ) AS totalPayments

      FROM payments

      JOIN bookings
      ON payments.booking_id =
      bookings.id

      WHERE bookings.customer_id = ?
      AND payments.status =
      'successful'
      `,
      [customer_id]
    )

    // ====================================
    // RECENT BOOKINGS
    // ====================================

    const [recentBookings] =
    await db.query(
      `
      SELECT

        bookings.id,

        bookings.status,

        bookings.created_at,

        services.service_name,

        users.full_name
        AS provider_name

      FROM bookings

      JOIN services
      ON bookings.service_id =
      services.id

      JOIN users
      ON bookings.provider_id =
      users.id

      WHERE bookings.customer_id = ?

      ORDER BY bookings.created_at DESC

      LIMIT 5
      `,
      [customer_id]
    )

    // ====================================
    // RESPONSE
    // ====================================

    res.status(200).json({

      stats: {

        bookings:
        bookings.totalBookings,

        completed:
        completed.completedBookings,

        pending:
        pending.pendingBookings,

        payments:
        payments.totalPayments,
      },

      recentBookings,
    })

  } catch (error) {

    console.log(
      "CUSTOMER ANALYTICS ERROR:",
      error
    )

    res.status(500).json({

      success: false,

      message:
      "Server Error",
    })
  }
}