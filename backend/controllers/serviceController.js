const db = require("../config/database");

// CREATE SERVICE
exports.createService = async (
  req,
  res
) => {

  try {

    const {
      business_id,
      service_name,
      description,
      price,
      duration_minutes,
    } = req.body

    const [business] = await db.query(
      `
      SELECT *
      FROM businesses
      WHERE id = ?
      `,
      [business_id]
    )

    if (business.length === 0) {

      return res.status(404).json({
        message: "Business not found",
      })
    }

    await db.query(
      `
      INSERT INTO services
      (
        business_id,
        service_name,
        description,
        price,
        duration_minutes
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        business_id,
        service_name,
        description,
        price,
        duration_minutes,
      ]
    )

    res.status(201).json({
      message:
        "Service created successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// GET PROVIDER SERVICES
exports.getProviderServices = async (
  req,
  res
) => {

  try {

    const provider_id = req.user.id

    const [services] = await db.query(
      `
      SELECT
        services.*,
        businesses.business_name
      FROM services
      JOIN businesses
      ON services.business_id =
      businesses.id
      WHERE businesses.provider_id = ?
      ORDER BY services.created_at DESC
      `,
      [provider_id]
    )

    res.status(200).json(services)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// GET ALL SERVICES
exports.getAllServices = async (
  req,
  res
) => {

  try {

    const [services] = await db.query(
      `
      SELECT
        services.*,
        businesses.business_name,
        businesses.city,
        businesses.provider_id,
        users.full_name AS provider_name,

        (
          SELECT
            ROUND(AVG(reviews.rating), 1)
          FROM reviews
          WHERE reviews.business_id =
          businesses.id
        ) AS average_rating,

        (
          SELECT
            COUNT(reviews.id)
          FROM reviews
          WHERE reviews.business_id =
          businesses.id
        ) AS total_reviews

      FROM services

      JOIN businesses
      ON services.business_id =
      businesses.id

      JOIN users
      ON businesses.provider_id =
      users.id

      WHERE businesses.status =
      'approved'

      ORDER BY services.created_at DESC
      `
    )

    res.status(200).json(services)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// UPDATE SERVICE
exports.updateService = async (
  req,
  res
) => {

  try {

    const { id } = req.params

    const {
      service_name,
      description,
      price,
      duration_minutes,
    } = req.body

    await db.query(
      `
      UPDATE services
      SET
        service_name = ?,
        description = ?,
        price = ?,
        duration_minutes = ?
      WHERE id = ?
      `,
      [
        service_name,
        description,
        price,
        duration_minutes,
        id,
      ]
    )

    res.status(200).json({
      message:
        "Service updated successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// DELETE SERVICE
exports.deleteService = async (
  req,
  res
) => {

  try {

    const { id } = req.params

    await db.query(
      `
      DELETE FROM services
      WHERE id = ?
      `,
      [id]
    )

    res.status(200).json({
      message:
        "Service deleted successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}