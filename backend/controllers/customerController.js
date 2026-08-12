const db = require("../config/database");

const bcrypt = require("bcryptjs");

// ======================================
// GET PROFILE
// ======================================

exports.getCustomerProfile = async (
  req,
  res
) => {
  try {
    const [users] = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        city,
        bio,
        profession,
        profile_image,
        is_verified,
        created_at
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: users[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// UPDATE PROFILE
// ======================================

exports.updateCustomerProfile =
  async (req, res) => {
    try {
      const {
        full_name,
        email,
        phone,
        city,
        bio,
        profession,
      } = req.body;

      await db.query(
        `
        UPDATE users
        SET
          full_name = ?,
          email = ?,
          phone = ?,
          city = ?,
          bio = ?,
          profession = ?
        WHERE id = ?
        `,
        [
          full_name,
          email,
          phone,
          city,
          bio,
          profession,
          req.user.id,
        ]
      );

      const [updatedUser] =
        await db.query(
          `
          SELECT
            id,
            full_name,
            email,
            phone,
            city,
            bio,
            profession,
            profile_image,
            is_verified,
            created_at
          FROM users
          WHERE id = ?
          `,
          [req.user.id]
        );

      res.json({
        message:
          "Profile updated successfully",
        user: updatedUser[0],
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Update failed",
      });
    }
  };

// ======================================
// CHANGE PASSWORD
// ======================================

exports.changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const [users] = await db.query(
      `
      SELECT password
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    const user = users[0];

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, req.user.id]
    );

    res.json({
      message:
        "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to update password",
    });
  }
};

// ======================================
// UPLOAD PROFILE IMAGE
// ======================================
exports.uploadProfileImage =
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      // CLOUDINARY URL
      const imageUrl = req.file.path;

      await db.query(
        `
        UPDATE users
        SET profile_image = ?
        WHERE id = ?
        `,
        [imageUrl, req.user.id]
      );

      res.json({
        message:
          "Profile image updated",
        profile_image: imageUrl,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Failed to upload image",
      });
    }
  };