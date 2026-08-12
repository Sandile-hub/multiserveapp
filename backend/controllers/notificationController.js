const db = require("../config/database");

// ========================================
// CREATE NOTIFICATION
// ========================================

exports.createNotification =
async (
  user_id,
  title,
  message
) => {

  try {

    const [result] =
    await db.query(`
      INSERT INTO notifications
      (
        user_id,
        title,
        message
      )
      VALUES (?, ?, ?)
    `, [
      user_id,
      title,
      message,
    ])

    // REALTIME SOCKET EVENT

    if (global.io) {

      global.io.emit(
        "receive_notification",
        {
          id:
          result.insertId,

          user_id,

          title,

          message,

          is_read:
          false,

          created_at:
          new Date(),
        }
      )
    }

    return result.insertId

  } catch (error) {

    console.log(
      "CREATE NOTIFICATION ERROR:",
      error
    )
  }
}

// ========================================
// GET USER NOTIFICATIONS
// ========================================

exports.getNotifications =
async (req, res) => {

  try {

    const user_id =
      req.user.id

    const [notifications] =
    await db.query(`
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [user_id])

    // UNREAD COUNT

    const [[unread]] =
    await db.query(`
      SELECT COUNT(*) AS totalUnread
      FROM notifications
      WHERE
      user_id = ?
      AND is_read = FALSE
    `, [user_id])

    res.status(200).json({

      notifications,

      unread:
      unread.totalUnread,
    })

  } catch (error) {

    console.log(
      "GET NOTIFICATIONS ERROR:",
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
// MARK AS READ
// ========================================

exports.markAsRead =
async (req, res) => {

  try {

    const { id } =
      req.params

    await db.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
    `, [id])

    res.status(200).json({
      message:
      "Notification updated",
    })

  } catch (error) {

    console.log(
      "MARK AS READ ERROR:",
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
// MARK ALL AS READ
// ========================================

exports.markAllAsRead =
async (req, res) => {

  try {

    const user_id =
      req.user.id

    await db.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
    `, [user_id])

    res.status(200).json({
      message:
      "All notifications marked as read",
    })

  } catch (error) {

    console.log(
      "MARK ALL AS READ ERROR:",
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
// DELETE NOTIFICATION
// ========================================

exports.deleteNotification =
async (req, res) => {

  try {

    const { id } =
      req.params

    await db.query(`
      DELETE FROM notifications
      WHERE id = ?
    `, [id])

    res.status(200).json({
      message:
      "Notification deleted successfully",
    })

  } catch (error) {

    console.log(
      "DELETE NOTIFICATION ERROR:",
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
// ADMIN GET ALL NOTIFICATIONS
// ========================================

exports.getAllNotifications =
async (req, res) => {

  try {

    const [notifications] =
    await db.query(`
      SELECT

        notifications.*,

        users.full_name,

        users.role

      FROM notifications

      JOIN users
      ON notifications.user_id =
      users.id

      ORDER BY
      notifications.created_at DESC
    `)

    res.status(200)
    .json(notifications)

  } catch (error) {

    console.log(
      "GET ALL NOTIFICATIONS ERROR:",
      error
    )

    res.status(500)
    .json({
      message:
      "Server Error",
    })
  }
}