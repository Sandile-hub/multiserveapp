const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

// ========================================
// OTP SETTINGS
// ========================================

const OTP_LENGTH = 6;

// OTP expires after 10 minutes
const OTP_EXPIRY_MINUTES = 10;

// Maximum verification attempts
const MAX_ATTEMPTS = 5;

// bcrypt hashing rounds
const SALT_ROUNDS = 10;

// ========================================
// GENERATE OTP
// ========================================

const generateOtp = () => {
  // Generate a cryptographically secure 6-digit OTP
  const min = 100000;
  const max = 999999;

  const otp =
    crypto.randomInt(min, max + 1).toString();

  return otp;
};

// ========================================
// HASH OTP
// ========================================

const hashOtp = async (otp) => {
  return await bcrypt.hash(
    otp,
    SALT_ROUNDS
  );
};

// ========================================
// VERIFY OTP HASH
// ========================================

const compareOtp = async (
  otp,
  otpHash
) => {
  return await bcrypt.compare(
    otp,
    otpHash
  );
};

// ========================================
// INVALIDATE PREVIOUS OTPs
// ========================================

const invalidatePreviousOtps = async (
  userId
) => {
  await db.query(
    `
    UPDATE email_verification_tokens
    SET used = 1
    WHERE user_id = ?
    AND used = 0
    `,
    [userId]
  );
};

// ========================================
// CREATE OTP
// ========================================

const createOtp = async (userId) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required to create OTP."
      );
    }

    // ====================================
    // INVALIDATE OLD OTPs
    // ====================================

    await invalidatePreviousOtps(userId);

    // ====================================
    // GENERATE OTP
    // ====================================

    const otp = generateOtp();

    // ====================================
    // HASH OTP
    // ====================================

    const otpHash = await hashOtp(otp);

    // ====================================
    // EXPIRATION
    // ====================================

    const expiresAt = new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

    // ====================================
    // STORE OTP HASH
    // ====================================

    const [result] = await db.query(
      `
      INSERT INTO email_verification_tokens
      (
        user_id,
        otp_hash,
        expires_at,
        attempts,
        used
      )
      VALUES (?, ?, ?, 0, 0)
      `,
      [
        userId,
        otpHash,
        expiresAt,
      ]
    );

    console.log(
      "========================================"
    );

    console.log(
      "EMAIL VERIFICATION OTP CREATED"
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "OTP ID:",
      result.insertId
    );

    console.log(
      "Expires:",
      expiresAt
    );

    console.log(
      "========================================"
    );

    return {
      success: true,

      otpId: result.insertId,

      // IMPORTANT:
      // This is returned to the controller
      // so it can be sent by email.
      otp,

      expiresAt,
    };
  } catch (error) {
    console.error(
      "CREATE OTP ERROR:",
      error
    );

    throw error;
  }
};

// ========================================
// GET ACTIVE OTP
// ========================================

const getActiveOtp = async (
  userId
) => {
  const [tokens] = await db.query(
    `
    SELECT
      id,
      user_id,
      otp_hash,
      expires_at,
      attempts,
      used,
      created_at
    FROM email_verification_tokens
    WHERE user_id = ?
    AND used = 0
    ORDER BY id DESC
    LIMIT 1
    `,
    [userId]
  );

  if (tokens.length === 0) {
    return null;
  }

  return tokens[0];
};

// ========================================
// VERIFY OTP
// ========================================

const verifyOtp = async (
  userId,
  submittedOtp
) => {
  try {
    // ====================================
    // VALIDATE INPUT
    // ====================================

    if (!userId) {
      return {
        success: false,
        message: "User ID is required.",
      };
    }

    if (!submittedOtp) {
      return {
        success: false,
        message: "OTP is required.",
      };
    }

    // ====================================
    // NORMALIZE OTP
    // ====================================

    const otp = String(
      submittedOtp
    ).trim();

    // OTP must be exactly 6 digits
    if (!/^\d{6}$/.test(otp)) {
      return {
        success: false,
        message:
          "OTP must be a 6-digit number.",
      };
    }

    // ====================================
    // FIND ACTIVE OTP
    // ====================================

    const token =
      await getActiveOtp(userId);

    if (!token) {
      return {
        success: false,
        message:
          "No active verification code found. Please request a new OTP.",
        code: "OTP_NOT_FOUND",
      };
    }

    // ====================================
    // CHECK ATTEMPTS
    // ====================================

    if (
      Number(token.attempts) >=
      MAX_ATTEMPTS
    ) {
      // Invalidate OTP
      await db.query(
        `
        UPDATE email_verification_tokens
        SET used = 1
        WHERE id = ?
        `,
        [token.id]
      );

      return {
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
        code: "OTP_MAX_ATTEMPTS",
      };
    }

    // ====================================
    // CHECK EXPIRATION
    // ====================================

    const expiresAt =
      new Date(token.expires_at);

    const now = new Date();

    if (now >= expiresAt) {
      // Invalidate expired OTP
      await db.query(
        `
        UPDATE email_verification_tokens
        SET used = 1
        WHERE id = ?
        `,
        [token.id]
      );

      return {
        success: false,
        message:
          "This OTP has expired. Please request a new one.",
        code: "OTP_EXPIRED",
      };
    }

    // ====================================
    // COMPARE OTP
    // ====================================

    const isValid =
      await compareOtp(
        otp,
        token.otp_hash
      );

    // ====================================
    // INVALID OTP
    // ====================================

    if (!isValid) {
      await db.query(
        `
        UPDATE email_verification_tokens
        SET attempts = attempts + 1
        WHERE id = ?
        `,
        [token.id]
      );

      const attemptsUsed =
        Number(token.attempts) + 1;

      const attemptsRemaining =
        Math.max(
          MAX_ATTEMPTS -
            attemptsUsed,
          0
        );

      return {
        success: false,

        message:
          attemptsRemaining > 0
            ? "Invalid verification code."
            : "Too many incorrect attempts. Please request a new OTP.",

        code:
          attemptsRemaining > 0
            ? "INVALID_OTP"
            : "OTP_MAX_ATTEMPTS",

        attempts_remaining:
          attemptsRemaining,
      };
    }

    // ====================================
    // OTP SUCCESS
    // ====================================

    await db.query(
      `
      UPDATE email_verification_tokens
      SET used = 1
      WHERE id = ?
      `,
      [token.id]
    );

    console.log(
      "========================================"
    );

    console.log(
      "EMAIL OTP VERIFIED"
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "OTP ID:",
      token.id
    );

    console.log(
      "========================================"
    );

    return {
      success: true,

      message:
        "Email verification successful.",

      userId: Number(userId),

      otpId: token.id,
    };
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    throw error;
  }
};

// ========================================
// RESEND OTP
// ========================================

const resendOtp = async (
  userId
) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    // ====================================
    // CREATE NEW OTP
    // ====================================

    const result =
      await createOtp(userId);

    return result;
  } catch (error) {
    console.error(
      "RESEND OTP ERROR:",
      error
    );

    throw error;
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  createOtp,
  verifyOtp,
  resendOtp,
  getActiveOtp,
  invalidatePreviousOtps,
};