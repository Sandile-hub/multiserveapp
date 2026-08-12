const db = require("../config/database");

// CREATE BUSINESS
exports.createBusiness = async (req, res) => {

  try {

    const {
      business_name,
      category,
      description,
      address,
      city,
      province,
      postal_code,
      business_phone,
      business_email,
    } = req.body

    const provider_id = req.user.id

    // CHECK EXISTING BUSINESS
    const [existing] = await db.query(
      "SELECT * FROM businesses WHERE provider_id = ?",
      [provider_id]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message:
          "Provider already has a business",
      })
    }

    await db.query(
      `
      INSERT INTO businesses
      (
        provider_id,
        business_name,
        category,
        description,
        address,
        city,
        province,
        postal_code,
        business_phone,
        business_email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        provider_id,
        business_name,
        category,
        description,
        address,
        city,
        province,
        postal_code,
        business_phone,
        business_email,
      ]
    )

    res.status(201).json({
      message:
        "Business registered successfully. Waiting for admin approval.",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// GET PROVIDER BUSINESS
exports.getProviderBusiness = async (
  req,
  res
) => {

  try {

    const provider_id = req.user.id

    const [business] = await db.query(
      "SELECT * FROM businesses WHERE provider_id = ?",
      [provider_id]
    )

    res.status(200).json(
      business[0] || null
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// ADMIN GET ALL BUSINESSES
exports.getAllBusinesses = async (
  req,
  res
) => {

  try {

    const [businesses] = await db.query(`
      SELECT
        businesses.*,
        users.full_name,
        users.email
      FROM businesses
      JOIN users
      ON businesses.provider_id = users.id
      ORDER BY businesses.created_at DESC
    `)

    res.status(200).json(businesses)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// APPROVE BUSINESS
exports.approveBusiness = async (
  req,
  res
) => {

  try {

    const { id } = req.params

    await db.query(
      `
      UPDATE businesses
      SET
        status = 'approved',
        verified_at = NOW()
      WHERE id = ?
      `,
      [id]
    )

    res.status(200).json({
      message:
        "Business approved successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

// REJECT BUSINESS
exports.rejectBusiness = async (
  req,
  res
) => {

  try {

    const { id } = req.params

    const { rejection_reason } = req.body

    await db.query(
      `
      UPDATE businesses
      SET
        status = 'rejected',
        rejection_reason = ?
      WHERE id = ?
      `,
      [rejection_reason, id]
    )

    res.status(200).json({
      message:
        "Business rejected successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}