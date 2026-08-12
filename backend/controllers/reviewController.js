const db = require("../config/database");

const {
  createNotification,
} = require(
  "./notificationController"
)

// ========================================
// CREATE REVIEW
// ========================================

exports.createReview =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

    const {
      booking_id,
      provider_id,
      business_id,
      rating,
      comment,
    } = req.body

    // ====================================
    // VALIDATION
    // ====================================

    if (
      !booking_id ||
      !provider_id ||
      !business_id ||
      !rating
    ) {

      return res.status(400)
      .json({
        message:
        "Required fields missing",
      })
    }

    // RATING RANGE

    if (
      rating < 1 ||
      rating > 5
    ) {

      return res.status(400)
      .json({
        message:
        "Rating must be between 1 and 5",
      })
    }

    // ====================================
    // CHECK BOOKING
    // ====================================

    const [bookings] =
    await db.query(`
      SELECT *
      FROM bookings
      WHERE id = ?
    `, [booking_id])

    if (
      bookings.length === 0
    ) {

      return res.status(404)
      .json({
        message:
        "Booking not found",
      })
    }

    const booking =
      bookings[0]

    // ====================================
    // CUSTOMER OWNERSHIP
    // ====================================

    if (
      booking.customer_id !==
      customer_id
    ) {

      return res.status(403)
      .json({
        message:
        "Unauthorized action",
      })
    }

    // ====================================
    // ONLY COMPLETED BOOKINGS
    // ====================================

    if (
      booking.status !==
      "completed"
    ) {

      return res.status(400)
      .json({
        message:
        "Only completed bookings can be reviewed",
      })
    }

    // ====================================
    // DUPLICATE REVIEW CHECK
    // ====================================

    const [existingReview] =
    await db.query(`
      SELECT *
      FROM reviews
      WHERE booking_id = ?
    `, [booking_id])

    if (
      existingReview.length > 0
    ) {

      return res.status(400)
      .json({
        message:
        "Review already exists",
      })
    }

    // ====================================
    // CREATE REVIEW
    // ====================================

    const [result] =
    await db.query(`
      INSERT INTO reviews
      (
        booking_id,
        customer_id,
        provider_id,
        business_id,
        rating,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      booking_id,
      customer_id,
      provider_id,
      business_id,
      rating,
      comment || null,
    ])

    // ====================================
    // CREATE NOTIFICATION
    // ====================================

    await createNotification(
      provider_id,
      "New Review",
      "You received a new customer review."
    )

    // ====================================
    // REALTIME SOCKET EVENT
    // ====================================

    if (global.io) {

      global.io.emit(
        "new_review",
        {
          review_id:
          result.insertId,

          provider_id,

          business_id,

          rating,

          comment,
        }
      )
    }

    // ====================================
    // RESPONSE
    // ====================================

    res.status(201).json({

      message:
      "Review submitted successfully",

      review: {

        id:
        result.insertId,

        booking_id,

        rating,

        comment,
      },
    })

  } catch (error) {

    console.log(
      "CREATE REVIEW ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// GET BUSINESS REVIEWS
// ========================================

exports.getBusinessReviews =
async (req, res) => {

  try {

    const {
      business_id,
    } = req.params

    const [reviews] =
    await db.query(`
      SELECT

        reviews.*,

        users.full_name,

        users.profile_image

      FROM reviews

      JOIN users
      ON reviews.customer_id =
      users.id

      WHERE reviews.business_id = ?

      ORDER BY
      reviews.created_at DESC
    `, [business_id])

    res.status(200)
    .json(reviews)

  } catch (error) {

    console.log(
      "GET BUSINESS REVIEWS ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// PROVIDER REVIEWS
// ========================================

exports.getProviderReviews =
async (req, res) => {

  try {

    const provider_id =
      req.user.id

    const [reviews] =
    await db.query(`
      SELECT

        reviews.*,

        users.full_name,

        users.profile_image,

        businesses.business_name,

        services.service_name

      FROM reviews

      JOIN users
      ON reviews.customer_id =
      users.id

      JOIN businesses
      ON reviews.business_id =
      businesses.id

      JOIN bookings
      ON reviews.booking_id =
      bookings.id

      JOIN services
      ON bookings.service_id =
      services.id

      WHERE reviews.provider_id = ?

      ORDER BY
      reviews.created_at DESC
    `, [provider_id])

    res.status(200)
    .json(reviews)

  } catch (error) {

    console.log(
      "GET PROVIDER REVIEWS ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// ADMIN REVIEWS
// ========================================

exports.getAdminReviews =
async (req, res) => {

  try {

    const [reviews] =
    await db.query(`
      SELECT

        reviews.*,

        users.full_name
        AS customer_name,

        businesses.business_name,

        services.service_name

      FROM reviews

      JOIN users
      ON reviews.customer_id =
      users.id

      JOIN businesses
      ON reviews.business_id =
      businesses.id

      JOIN bookings
      ON reviews.booking_id =
      bookings.id

      JOIN services
      ON bookings.service_id =
      services.id

      ORDER BY
      reviews.created_at DESC
    `)

    res.status(200)
    .json(reviews)

  } catch (error) {

    console.log(
      "GET ADMIN REVIEWS ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// BUSINESS RATING
// ========================================

exports.getBusinessRating =
async (req, res) => {

  try {

    const {
      business_id,
    } = req.params

    const [[ratingData]] =
    await db.query(`
      SELECT

        ROUND(
          AVG(rating),
          1
        ) AS average_rating,

        COUNT(id)
        AS total_reviews

      FROM reviews

      WHERE business_id = ?
    `, [business_id])

    res.status(200).json({

      average_rating:
      ratingData.average_rating || 0,

      total_reviews:
      ratingData.total_reviews || 0,
    })

  } catch (error) {

    console.log(
      "GET RATING ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}

// ========================================
// DELETE REVIEW
// ========================================

exports.deleteReview =
async (req, res) => {

  try {

    const { id } =
      req.params

    await db.query(`
      DELETE FROM reviews
      WHERE id = ?
    `, [id])

    res.status(200).json({
      message:
      "Review deleted successfully",
    })

  } catch (error) {

    console.log(
      "DELETE REVIEW ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}