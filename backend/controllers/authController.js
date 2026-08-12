const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const db = require("../config/database");

const nodemailer = require("nodemailer");

// ========================================
// EMAIL TRANSPORTER
// ========================================

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

// ========================================
// REGISTER
// ========================================

exports.register = async (
  req,
  res
) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role,
    } = req.body;

    // ================================
    // CHECK EXISTING USER
    // ================================

    const [existingUser] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (
      existingUser.length > 0
    ) {
      return res.status(400).json({
        message:
          "Email already exists",
      });
    }

    // ================================
    // HASH PASSWORD
    // ================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ================================
    // GENERATE OTP
    // ================================

    const otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    // OTP EXPIRES IN 10 MINUTES
    const otpExpiry =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    // ================================
    // CREATE USER
    // ================================

    await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        phone,
        password,
        role,
        email_otp,
        otp_expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        full_name,
        email,
        phone,
        hashedPassword,
        role,
        otp,
        otpExpiry,
      ]
    );

    // ================================
    // SEND OTP EMAIL
    // ================================

    await transporter.sendMail({
      from:
        process.env.EMAIL_USER,

      to: email,

      subject:
        "MultiServe Email Verification OTP",

      html: `
        <div style="
          font-family: Arial;
          padding: 20px;
        ">
          <h2>
            Welcome to MultiServe
          </h2>

          <p>
            Verify your email
            using this OTP:
          </p>

          <h1 style="
            color: #3b82f6;
            letter-spacing: 5px;
          ">
            ${otp}
          </h1>

          <p>
            This OTP expires
            in 10 minutes.
          </p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,

      message:
        "Account created successfully. OTP sent to email.",

      email,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Server Error",
    });
  }
};

// ========================================
// LOGIN
// ========================================

exports.login = async (
  req,
  res
) => {
  try {

    const {
      email,
      password,
    } = req.body;

    // ================================
    // FIND USER
    // ================================

    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (
      users.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    const user = users[0];

    // ================================
    // CHECK PASSWORD
    // ================================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    // ================================
    // CHECK EMAIL VERIFIED
    // ================================

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,

        message:
          "Please verify your email with OTP first",

        email: user.email,
      });
    }

    // ================================
    // GENERATE JWT
    // ================================

    const token = jwt.sign(
      {
        id: user.id,

        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn:
          process.env.JWT_EXPIRES_IN,
      }
    );

    // ================================
    // SUCCESS RESPONSE
    // ================================

    res.status(200).json({
      success: true,

      token,

      user: {
        id: user.id,

        full_name:
          user.full_name,

        email:
          user.email,

        role:
          user.role,

        profile_image:
          user.profile_image,

        is_verified:
          user.is_verified,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Server Error",
    });
  }
};

// ========================================
// VERIFY OTP
// ========================================

exports.verifyOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    // ================================
    // FIND USER
    // ================================

    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (
      users.length === 0
    ) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const user = users[0];

    // ================================
    // INVALID OTP
    // ================================

    if (
      user.email_otp !== otp
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    // ================================
    // EXPIRED OTP
    // ================================

    if (
      new Date() >
      new Date(
        user.otp_expires_at
      )
    ) {
      return res.status(400).json({
        message:
          "OTP expired",
      });
    }

    // ================================
    // VERIFY USER
    // ================================

    await db.query(
      `
      UPDATE users
      SET
        is_verified = true,
        email_otp = NULL,
        otp_expires_at = NULL
      WHERE id = ?
      `,
      [user.id]
    );

    res.status(200).json({
      success: true,

      message:
        "Email verified successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Verification failed",
    });
  }
};

// ========================================
// RESEND OTP
// ========================================

exports.resendOTP = async (
  req,
  res
) => {
  try {

    const { email } =
      req.body;

    // ================================
    // FIND USER
    // ================================

    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (
      users.length === 0
    ) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const user = users[0];

    // ================================
    // GENERATE NEW OTP
    // ================================

    const otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    const otpExpiry =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    // ================================
    // UPDATE OTP
    // ================================

    await db.query(
      `
      UPDATE users
      SET
        email_otp = ?,
        otp_expires_at = ?
      WHERE id = ?
      `,
      [
        otp,
        otpExpiry,
        user.id,
      ]
    );

    // ================================
    // SEND EMAIL
    // ================================

    await transporter.sendMail({
      from:
        process.env.EMAIL_USER,

      to: email,

      subject:
        "MultiServe OTP Code",

      html: `
        <div style="
          font-family: Arial;
          padding: 20px;
        ">
          <h2>
            Your New OTP
          </h2>

          <h1 style="
            color: #3b82f6;
            letter-spacing: 5px;
          ">
            ${otp}
          </h1>

          <p>
            OTP expires
            in 10 minutes.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,

      message:
        "OTP resent successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to resend OTP",
    });
  }
};