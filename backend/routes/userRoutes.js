const express = require("express")

const router = express.Router()

const upload =
require("../middleware/uploadMiddleware")

const {
  getAllUsers,
  getUserById,
  getProviderProfile,
  updateProfile,
  deleteUser,
} = require("../controllers/userController")

const {
  protect,
} = require("../middleware/authMiddleware")

const db =
require("../config/db")

// ========================================
// GET ALL USERS (ADMIN)
// ========================================

router.get(
  "/",
  protect,
  getAllUsers
)

// ========================================
// GET SINGLE USER
// ========================================

router.get(
  "/:id",
  protect,
  getUserById
)

// ========================================
// PROVIDER PROFILE
// ========================================

router.get(
  "/provider/profile",
  protect,
  getProviderProfile
)

// ========================================
// UPDATE PROFILE
// ========================================

router.put(
  "/profile",
  protect,
  updateProfile
)

// ========================================
// UPLOAD AVATAR
// ========================================

router.post(
  "/upload-avatar",
  protect,
  upload.single("avatar"),

  async (req, res) => {

    try {

      // CHECK FILE
      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "No image uploaded",
        })
      }

      // CLOUDINARY IMAGE URL
      const avatarUrl =
        req.file.path

      // UPDATE USER IN DATABASE
      await db.query(

        `
        UPDATE users
        SET avatar = ?
        WHERE id = ?
        `,

        [
          avatarUrl,
          req.user.id,
        ]
      )

      // GET UPDATED USER
      const [users] =
        await db.query(

          `
          SELECT *
          FROM users
          WHERE id = ?
          `,

          [req.user.id]
        )

      const updatedUser =
        users[0]

      // RESPONSE
      res.status(200).json({

        success: true,

        message:
          "Avatar uploaded successfully",

        avatar:
          avatarUrl,

        user:
          updatedUser,
      })

    } catch (error) {

      console.error(
        "Avatar upload error:",
        error
      )

      res.status(500).json({

        success: false,

        message:
          "Server error",
      })
    }
  }
)

// ========================================
// DELETE USER
// ========================================

router.delete(
  "/:id",
  protect,
  deleteUser
)

module.exports = router