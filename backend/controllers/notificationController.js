const db = require("../config/database");

// ========================================
// CREATE NOTIFICATION
// ========================================

exports.createNotification = async (
  user_id,
  title,
  message,
  type = "system"
) => {
  try {
    const [result] = await db.query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        type,
        is_read
      )
      VALUES (?, ?, ?, FALSE)
      `,
      [
        user_id,
        title,
        message,
      ]
    );

    const notificationId = result.insertId;

    // ========================================
    // REALTIME SOCKET NOTIFICATION
    // ========================================

    if (global.io) {
      global.io
        .to(`user_${user_id}`)
        .emit("receive_notification", {
          id: notificationId,
          user_id,
          title,
          message,
          is_read: false,
          created_at: new Date(),
        });
    }

    return notificationId;
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    throw error;
  }
};

// ========================================
// GET USER NOTIFICATIONS
// ========================================

exports.getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [notifications] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    const [[unread]] = await db.query(
      `
      SELECT COUNT(*) AS totalUnread
      FROM notifications
      WHERE user_id = ?
      AND is_read = FALSE
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      notifications,
      unread: Number(unread.totalUnread || 0),
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};

// ========================================
// MARK AS READ
// ========================================

exports.markAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
      AND user_id = ?
      `,
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "MARK AS READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// ========================================
// MARK ALL AS READ
// ========================================

exports.markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;

    await db.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
      AND is_read = FALSE
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "MARK ALL AS READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// ========================================
// DELETE NOTIFICATION
// ========================================

exports.deleteNotification = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM notifications
      WHERE id = ?
      AND user_id = ?
      `,
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

// ========================================
// ADMIN GET ALL NOTIFICATIONS
// ========================================

exports.getAllNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `
      SELECT
        notifications.*,
        users.full_name,
        users.role
      FROM notifications
      JOIN users
        ON notifications.user_id = users.id
      ORDER BY notifications.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "GET ALL NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};