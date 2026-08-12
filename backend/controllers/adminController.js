const db = require("../config/database");

// ============================================
// DASHBOARD STATS
// ============================================

exports.getDashboardStats =
async (req, res) => {

  try {

    // =========================
    // TOTAL USERS
    // =========================

    const [[users]] =
    await db.query(`
      SELECT COUNT(*) AS totalUsers
      FROM users
    `)

    // =========================
    // TOTAL BUSINESSES
    // =========================

    const [[businesses]] =
    await db.query(`
      SELECT COUNT(*) AS totalBusinesses
      FROM businesses
    `)

    // =========================
    // TOTAL BOOKINGS
    // =========================

    const [[bookings]] =
    await db.query(`
      SELECT COUNT(*) AS totalBookings
      FROM bookings
    `)

    // =========================
    // TOTAL REVENUE
    // =========================

    const [[revenue]] =
    await db.query(`
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS totalRevenue
      FROM payments
      WHERE status =
      'successful'
    `)

    // =========================
    // TOTAL PROVIDERS
    // =========================

    const [[providers]] =
    await db.query(`
      SELECT COUNT(*) AS totalProviders
      FROM users
      WHERE role =
      'provider'
    `)

    // =========================
    // TOTAL CUSTOMERS
    // =========================

    const [[customers]] =
    await db.query(`
      SELECT COUNT(*) AS totalCustomers
      FROM users
      WHERE role =
      'customer'
    `)

    // =========================
    // PENDING BUSINESSES
    // =========================

    const [[pendingBusinesses]] =
    await db.query(`
      SELECT COUNT(*) AS pending
      FROM businesses
      WHERE status =
      'pending'
    `)

    // =========================
    // SUCCESSFUL PAYMENTS
    // =========================

    const [[successfulPayments]] =
    await db.query(`
      SELECT COUNT(*) AS total
      FROM payments
      WHERE status =
      'successful'
    `)

    // =========================
    // RECENT BOOKINGS
    // =========================

    const [recentBookings] =
    await db.query(`
      SELECT
        bookings.id,
        bookings.status,
        bookings.booking_date,
        bookings.booking_time,
        bookings.total_amount,
        bookings.created_at,

        users.full_name
        AS customer_name,

        services.service_name,

        businesses.business_name

      FROM bookings

      JOIN users
      ON bookings.customer_id =
      users.id

      JOIN services
      ON bookings.service_id =
      services.id

      JOIN businesses
      ON bookings.business_id =
      businesses.id

      ORDER BY
      bookings.created_at DESC

      LIMIT 5
    `)

    // =========================
    // RECENT USERS
    // =========================

    const [recentUsers] =
    await db.query(`
      SELECT
        id,
        full_name,
        email,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `)

    // =========================
    // MONTHLY REVENUE
    // =========================

const [monthlyRevenue] =
await db.query(`
  SELECT
    MONTH(created_at)
    AS monthNumber,

    DATE_FORMAT(
      MIN(created_at),
      '%b'
    ) AS month,

    SUM(amount)
    AS revenue

  FROM payments

  WHERE status =
  'successful'

  GROUP BY
  MONTH(created_at)

  ORDER BY
  monthNumber ASC
`)

    // =========================
    // RESPONSE
    // =========================

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

        pendingBusinesses:
          pendingBusinesses.pending,

        bookings:
          bookings.totalBookings,

        revenue:
          revenue.totalRevenue,

        successfulPayments:
          successfulPayments.total,
      },

      recentBookings,

      recentUsers,

      monthlyRevenue,
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// USERS
// ============================================

exports.getAllUsers =
async (req, res) => {

  try {

    const [users] =
    await db.query(`
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `)

    res.status(200).json(users)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// UPDATE USER STATUS
// ============================================

exports.updateUserStatus =
async (req, res) => {

  try {

    const { id } =
    req.params

    const {
      is_active,
    } = req.body

    await db.query(`
      UPDATE users
      SET is_active = ?
      WHERE id = ?
    `, [
      is_active,
      id,
    ])

    res.status(200).json({
      message:
        "User updated successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// DELETE USER
// ============================================

exports.deleteUser =
async (req, res) => {

  try {

    const { id } =
    req.params

    await db.query(`
      DELETE FROM users
      WHERE id = ?
    `, [id])

    res.status(200).json({
      message:
        "User deleted successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// BOOKINGS
// ============================================

exports.getAllBookings =
async (req, res) => {

  try {

    const [bookings] =
    await db.query(`
      SELECT
        bookings.*,

        users.full_name
        AS customer_name,

        services.service_name,

        businesses.business_name

      FROM bookings

      JOIN users
      ON bookings.customer_id =
      users.id

      JOIN services
      ON bookings.service_id =
      services.id

      JOIN businesses
      ON bookings.business_id =
      businesses.id

      ORDER BY
      bookings.created_at DESC
    `)

    res.status(200).json(
      bookings
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// PAYMENTS
// ============================================

exports.getAllPayments =
async (req, res) => {

  try {

    const [payments] =
    await db.query(`
      SELECT
        payments.*,

        users.full_name
        AS customer_name,

        businesses.business_name

      FROM payments

      JOIN bookings
      ON payments.booking_id =
      bookings.id

      JOIN users
      ON bookings.customer_id =
      users.id

      JOIN businesses
      ON bookings.business_id =
      businesses.id

      ORDER BY
      payments.created_at DESC
    `)

    res.status(200).json(
      payments
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// REVIEWS
// ============================================

exports.getAllReviews =
async (req, res) => {

  try {

    const [reviews] =
    await db.query(`
      SELECT
        reviews.*,

        users.full_name
        AS customer_name,

        businesses.business_name

      FROM reviews

      JOIN users
      ON reviews.customer_id =
      users.id

      JOIN businesses
      ON reviews.business_id =
      businesses.id

      ORDER BY
      reviews.created_at DESC
    `)

    res.status(200).json(
      reviews
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

exports.getAllNotifications =
async (req, res) => {

  try {

    const [notifications] =
    await db.query(`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
    `)

    res.status(200).json(
      notifications
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// BUSINESSES
// ============================================

exports.getAllBusinesses =
async (req, res) => {

  try {

    const [businesses] =
    await db.query(`
      SELECT
        businesses.*,

        users.full_name
        AS provider_name,

        users.email
        AS provider_email

      FROM businesses

      JOIN users
      ON businesses.provider_id =
      users.id

      ORDER BY
      businesses.created_at DESC
    `)

    res.status(200).json(
      businesses
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// APPROVE BUSINESS
// ============================================

exports.approveBusiness =
async (req, res) => {

  try {

    const { id } =
    req.params

    await db.query(`
      UPDATE businesses
      SET
        status = 'approved',
        verified_at = NOW()
      WHERE id = ?
    `, [id])

    res.status(200).json({
      message:
        "Business approved successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// REJECT BUSINESS
// ============================================

exports.rejectBusiness =
async (req, res) => {

  try {

    const { id } =
    req.params

    const {
      rejection_reason,
    } = req.body

    await db.query(`
      UPDATE businesses
      SET
        status = 'rejected',
        rejection_reason = ?
      WHERE id = ?
    `, [
      rejection_reason,
      id,
    ])

    res.status(200).json({
      message:
        "Business rejected successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// SETTINGS
// ============================================

exports.getPlatformSettings =
async (req, res) => {

  try {

    res.status(200).json({

      platform_name:
        "MultiServe",

      support_email:
        "support@multiserve.com",

      currency:
        "ZAR",

      timezone:
        "Africa/Johannesburg",

      maintenance_mode:
        false,

      enable_notifications:
        true,

      enable_reviews:
        true,
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ============================================
// UPDATE SETTINGS
// ============================================

exports.updatePlatformSettings =
async (req, res) => {

  try {

    res.status(200).json({
      message:
        "Settings updated successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}