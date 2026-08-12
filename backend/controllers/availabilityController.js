const db = require("../config/database");

// SET AVAILABILITY
exports.setAvailability =
async (req, res) => {

  try {

    const provider_id =
      req.user.id

    const {
      day_of_week,
      start_time,
      end_time,
    } = req.body

    await db.query(
      `
      INSERT INTO provider_availability
      (
        provider_id,
        day_of_week,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        provider_id,
        day_of_week,
        start_time,
        end_time,
      ]
    )

    res.status(201).json({
      message:
        "Availability added",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}

// GET AVAILABILITY
exports.getAvailability =
async (req, res) => {

  try {

    const provider_id =
      req.user.id

    const [availability] =
    await db.query(
      `
      SELECT *
      FROM provider_availability
      WHERE provider_id = ?
      `,
      [provider_id]
    )

    res.status(200).json(
      availability
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        "Server Error",
    })
  }
}