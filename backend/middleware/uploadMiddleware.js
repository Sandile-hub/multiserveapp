const multer = require("multer");

const {
  storage,
} = require("../config/cloudinary");

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  // ALLOW IMAGES ONLY
  if (
    file.mimetype.startsWith(
      "image/"
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed"
      ),
      false
    );
  }
};

// ========================================
// MULTER CONFIG
// ========================================

const upload = multer({
  storage,

  limits: {
    // 5MB LIMIT
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter,
});

// ========================================
// ERROR HANDLER MIDDLEWARE
// ========================================

upload.handleUploadErrors = (
  err,
  req,
  res,
  next
) => {
  // MULTER SIZE ERROR
  if (
    err instanceof multer.MulterError
  ) {
    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Image size must be less than 5MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // CUSTOM FILE FILTER ERROR
  if (err) {
    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Upload failed",
    });
  }

  next();
};

module.exports = upload;