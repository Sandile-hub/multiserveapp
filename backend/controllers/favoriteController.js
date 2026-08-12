const db = require("../config/database");

// ========================================
// ADD FAVORITE
// ========================================

exports.addFavorite =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

    const {
      service_id,
    } = req.body

    // VALIDATION

    if (!service_id) {

      return res.status(400).json({
        message:
          "Service ID is required",
      })
    }

    // CHECK SERVICE

    const [services] =
    await db.query(
      `
      SELECT *
      FROM services
      WHERE id = ?
      `,
      [service_id]
    )

    if (
      services.length === 0
    ) {

      return res.status(404).json({
        message:
          "Service not found",
      })
    }

    // PREVENT DUPLICATES

    const [existing] =
    await db.query(
      `
      SELECT *
      FROM favorites
      WHERE customer_id = ?
      AND service_id = ?
      `,
      [
        customer_id,
        service_id,
      ]
    )

    if (
      existing.length > 0
    ) {

      return res.status(400).json({
        message:
          "Service already added to favorites",
      })
    }

    // ADD FAVORITE

    await db.query(
      `
      INSERT INTO favorites
      (
        customer_id,
        service_id
      )
      VALUES (?, ?)
      `,
      [
        customer_id,
        service_id,
      ]
    )

    res.status(201).json({

      success: true,

      message:
        "Added to favorites",
    })

  } catch (error) {

    console.log(
      "ADD FAVORITE ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ========================================
// GET FAVORITES
// ========================================

exports.getFavorites =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

const [favorites] = await db.query(`
  SELECT

    favorites.id,
    favorites.customer_id,
    favorites.service_id,
    favorites.created_at,

    services.service_name,
    services.description,
    services.price,
    services.duration_minutes,
    services.image,

    businesses.business_name,
    businesses.category,
    businesses.city,

    provider.full_name AS provider_name,

    COALESCE(
      AVG(reviews.rating),
      5
    ) AS rating,

    COUNT(reviews.id) AS total_reviews

  FROM favorites

  JOIN services
  ON favorites.service_id = services.id

  JOIN businesses
  ON services.business_id = businesses.id

  JOIN users provider
  ON services.provider_id = provider.id

  LEFT JOIN bookings
  ON bookings.service_id = services.id

  LEFT JOIN reviews
  ON reviews.booking_id = bookings.id

  WHERE favorites.customer_id = ?

  GROUP BY
    favorites.id,
    favorites.customer_id,
    favorites.service_id,
    favorites.created_at,
    services.id,
    services.service_name,
    services.description,
    services.price,
    services.duration_minutes,
    services.image,
    businesses.business_name,
    businesses.category,
    businesses.city,
    provider.full_name

  ORDER BY favorites.created_at DESC
`, [req.user.id])

    res.status(200).json(
      favorites
    )

  } catch (error) {

    console.log(
      "GET FAVORITES ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ========================================
// REMOVE FAVORITE
// ========================================

exports.removeFavorite =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

    const { id } =
      req.params

    // CHECK FAVORITE

    const [favorite] =
    await db.query(
      `
      SELECT *
      FROM favorites
      WHERE id = ?
      AND customer_id = ?
      `,
      [
        id,
        customer_id,
      ]
    )

    if (
      favorite.length === 0
    ) {

      return res.status(404).json({
        message:
          "Favorite not found",
      })
    }

    // DELETE FAVORITE

    await db.query(
      `
      DELETE FROM favorites
      WHERE id = ?
      `,
      [id]
    )

    res.status(200).json({

      success: true,

      message:
        "Favorite removed successfully",
    })

  } catch (error) {

    console.log(
      "REMOVE FAVORITE ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ========================================
// CHECK FAVORITE
// ========================================

exports.checkFavorite =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

    const { service_id } =
      req.params

    const [favorite] =
    await db.query(
      `
      SELECT *
      FROM favorites
      WHERE customer_id = ?
      AND service_id = ?
      `,
      [
        customer_id,
        service_id,
      ]
    )

    res.status(200).json({

      isFavorite:
        favorite.length > 0,
    })

  } catch (error) {

    console.log(
      "CHECK FAVORITE ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// ========================================
// FAVORITES COUNT
// ========================================

exports.getFavoritesCount =
async (req, res) => {

  try {

    const customer_id =
      req.user.id

    const [[count]] =
    await db.query(
      `
      SELECT
        COUNT(*) AS total
      FROM favorites
      WHERE customer_id = ?
      `,
      [customer_id]
    )

    res.status(200).json({

      total:
        count.total || 0,
    })

  } catch (error) {

    console.log(
      "FAVORITES COUNT ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}