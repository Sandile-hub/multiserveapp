const db = require("../config/database");

// ========================================
// GET ALL USERS (ADMIN)
// ========================================

exports.getAllUsers =
async (req, res) => {

  try {

    const [users] =
    await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        avatar,
        created_at
      FROM users
      ORDER BY created_at DESC
      `
    )

    res.status(200).json(
      users
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// GET SINGLE USER
// ========================================

exports.getUserById =
async (req, res) => {

  try {

    const { id } =
    req.params

    const [users] =
    await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        address,
        bio,
        role,
        avatar,
        created_at
      FROM users
      WHERE id = ?
      `,
      [id]
    )

    if (
      users.length === 0
    ) {

      return res.status(404).json({
        message:
        "User not found",
      })
    }

    res.status(200).json(
      users[0]
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// GET PROVIDER PROFILE
// ========================================

exports.getProviderProfile =
async (req, res) => {

  try {

    const provider_id =
    req.user.id

    // ====================================
    // USER INFO
    // ====================================

    const [users] =
    await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        address,
        bio,
        role,
        avatar,
        created_at
      FROM users
      WHERE id = ?
      `,
      [provider_id]
    )

    if (
      users.length === 0
    ) {

      return res.status(404).json({
        message:
        "User not found",
      })
    }

    // ====================================
    // SERVICES COUNT
    // ====================================

    const [[services]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalServices
      FROM services
      WHERE provider_id = ?
      `,
      [provider_id]
    )

    // ====================================
    // COMPLETED BOOKINGS
    // ====================================

    const [[bookings]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS totalBookings
      FROM bookings
      WHERE provider_id = ?
      AND status = 'completed'
      `,
      [provider_id]
    )

    // ====================================
    // AVERAGE RATING
    // ====================================

    const [[ratings]] =
    await db.query(
      `
      SELECT
        AVG(rating)
        AS averageRating
      FROM reviews
      WHERE provider_id = ?
      `,
      [provider_id]
    )

    // ====================================
    // TOTAL REVENUE
    // ====================================

const [[revenue]] =
await db.query(
  `
  SELECT

    COALESCE(
      SUM(
        payments.provider_earnings
      ),
      0
    ) AS totalRevenue,

    COALESCE(
      SUM(
        payments.commission_amount
      ),
      0
    ) AS totalCommission,

    COALESCE(
      AVG(
        payments.commission_percentage
      ),
      0
    ) AS averageCommission

  FROM payments

  JOIN bookings
  ON payments.booking_id =
  bookings.id

  WHERE bookings.provider_id = ?
  AND payments.status =
  'successful'
  `,
  [provider_id]
)

    // ====================================
    // RESPONSE
    // ====================================

    res.status(200).json({

      user:
      users[0],

stats: {

  services:
  services.totalServices || 0,

  completedBookings:
  bookings.totalBookings || 0,

  rating:
  ratings.averageRating || 0,

  revenue:
  revenue.totalRevenue || 0,

  commission:
  revenue.totalCommission || 0,

  commissionRate:
  revenue.averageCommission || 0,
},
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// UPDATE PROFILE
// ========================================

exports.updateProfile =
async (req, res) => {

  try {

    const user_id =
    req.user.id

    const {

      full_name,

      email,

      phone,

      address,

      bio,

    } = req.body

    // ====================================
    // VALIDATION
    // ====================================

    if (
      !full_name ||
      !email
    ) {

      return res.status(400).json({
        message:
        "Full name and email are required",
      })
    }

    // ====================================
    // CHECK EMAIL
    // ====================================

    const [existingEmail] =
    await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      AND id != ?
      `,
      [
        email,
        user_id,
      ]
    )

    if (
      existingEmail.length > 0
    ) {

      return res.status(400).json({
        message:
        "Email already exists",
      })
    }

    // ====================================
    // UPDATE USER
    // ====================================

    await db.query(
      `
      UPDATE users
      SET
        full_name = ?,
        email = ?,
        phone = ?,
        address = ?,
        bio = ?
      WHERE id = ?
      `,
      [

        full_name,

        email,

        phone || null,

        address || null,

        bio || null,

        user_id,
      ]
    )

    // ====================================
    // GET UPDATED USER
    // ====================================

    const [updatedUser] =
    await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        address,
        bio,
        role,
        avatar,
        created_at
      FROM users
      WHERE id = ?
      `,
      [user_id]
    )

    res.status(200).json({

      message:
      "Profile updated successfully",

      user:
      updatedUser[0],
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// DELETE USER (ADMIN)
// ========================================

exports.deleteUser =
async (req, res) => {

  try {

    const { id } =
    req.params

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    )

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