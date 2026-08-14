const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/database");
const { Resend } = require("resend");

// ========================================
// RESEND EMAIL SERVICE
// ========================================

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "MultiServe <onboarding@resend.dev>";

// ========================================
// GENERATE SECURE OTP
// ========================================

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ========================================
// REGISTER
// ========================================

exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role,
    } = req.body;

    // ========================================
    // VALIDATE INPUT
    // ========================================

    if (
      !full_name ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ========================================
    // NORMALIZE EMAIL
    // ========================================

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ========================================
    // VALIDATE ROLE
    // ========================================

    const allowedRoles = [
      "customer",
      "provider",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      });
    }

    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const [existingUsers] = await db.query(
      `
      SELECT
        id,
        email_verified
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {

      const existingUser = existingUsers[0];

      // ========================================
      // EXISTING VERIFIED ACCOUNT
      // ========================================

      if (Number(existingUser.email_verified) === 1) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      // ========================================
      // REMOVE OLD UNVERIFIED ACCOUNT
      // ========================================

      await db.query(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [existingUser.id]
      );
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // ========================================
    // GENERATE OTP
    // ========================================

    const otp = generateOTP();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ========================================
    // CREATE USER
    // ========================================

    const [result] = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        phone,
        password,
        role,
        email_verified,
        email_otp,
        otp_expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        full_name.trim(),
        normalizedEmail,
        phone.trim(),
        hashedPassword,
        role,
        0,
        otp,
        otpExpiry,
      ]
    );

    const userId = result.insertId;

    // ========================================
    // SEND OTP THROUGH RESEND
    // ========================================

    const { data, error } =
      await resend.emails.send({
        from: FROM_EMAIL,

        to: [normalizedEmail],

        subject:
          "Your MultiServe Verification Code",

        html: `
          <!DOCTYPE html>

          <html>

          <head>
            <meta charset="UTF-8">
          </head>

          <body
            style="
              margin:0;
              padding:0;
              background:#f4f4f5;
              font-family:Arial,Helvetica,sans-serif;
            "
          >

            <div
              style="
                max-width:600px;
                margin:40px auto;
                background:#ffffff;
                padding:40px;
                border-radius:16px;
              "
            >

              <h1
                style="
                  margin:0 0 10px;
                  color:#111827;
                "
              >
                Welcome to MultiServe
              </h1>

              <p
                style="
                  color:#4b5563;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Thank you for creating your MultiServe
                account.
              </p>

              <p
                style="
                  color:#4b5563;
                  font-size:16px;
                "
              >
                Use the verification code below
                to verify your email address:
              </p>

              <div
                style="
                  margin:30px 0;
                  padding:25px;
                  text-align:center;
                  background:#f3f4f6;
                  border-radius:12px;
                "
              >

                <div
                  style="
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:10px;
                    color:#2563eb;
                  "
                >
                  ${otp}
                </div>

              </div>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                "
              >
                This verification code expires
                in 10 minutes.
              </p>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                "
              >
                If you did not create this account,
                you can safely ignore this email.
              </p>

              <hr
                style="
                  margin:30px 0;
                  border:none;
                  border-top:1px solid #e5e7eb;
                "
              >

              <p
                style="
                  color:#9ca3af;
                  font-size:12px;
                  text-align:center;
                "
              >
                © ${new Date().getFullYear()}
                MultiServe. All rights reserved.
              </p>

            </div>

          </body>

          </html>
        `,
      });

    // ========================================
    // EMAIL FAILED
    // ========================================

    if (error) {

      console.error(
        "RESEND EMAIL ERROR:",
        error
      );

      // ========================================
      // REMOVE USER THAT WAS JUST CREATED
      // ========================================

      try {
        await db.query(
          `
          DELETE FROM users
          WHERE id = ?
          `,
          [userId]
        );
      } catch (deleteError) {

        console.error(
          "FAILED TO ROLLBACK USER:",
          deleteError
        );
      }

      return res.status(503).json({
        success: false,
        message:
          "We could not send the verification email. Please try again.",
      });
    }

    // ========================================
    // SUCCESS
    // ========================================

    console.log(
      "OTP EMAIL SENT:",
      normalizedEmail,
      data?.id || ""
    );

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully. Verification OTP sent to your email.",

      email: normalizedEmail,
    });

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again.",
    });
  }
};

// ========================================
// LOGIN
// ========================================

exports.login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ========================================
    // FIND USER
    // ========================================

    const [users] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ========================================
    // CHECK EMAIL VERIFICATION
    // ========================================

    if (Number(user.email_verified) !== 1) {

      return res.status(403).json({
        success: false,

        message:
          "Please verify your email before logging in.",

        email: user.email,

        requiresVerification: true,
      });
    }

    // ========================================
    // CREATE JWT
    // ========================================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // ========================================
    // UPDATE LAST LOGIN
    // ========================================

    await db.query(
      `
      UPDATE users
      SET last_login = NOW()
      WHERE id = ?
      `,
      [user.id]
    );

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      token,

      user: {
        id: user.id,

        full_name:
          user.full_name,

        email:
          user.email,

        phone:
          user.phone,

        role:
          user.role,

        profile_image:
          user.profile_image,

        email_verified:
          user.email_verified,
      },
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
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

    // ========================================
    // VALIDATE
    // ========================================

    if (!email || !otp) {

      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {

      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ========================================
    // FIND USER
    // ========================================

    const [users] = await db.query(
      `
      SELECT
        id,
        email,
        email_verified,
        email_otp,
        otp_expires_at
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // ========================================
    // ALREADY VERIFIED
    // ========================================

    if (
      Number(user.email_verified) === 1
    ) {

      return res.status(200).json({
        success: true,
        message:
          "Email is already verified",
      });
    }

    // ========================================
    // CHECK OTP EXISTS
    // ========================================

    if (!user.email_otp) {

      return res.status(400).json({
        success: false,
        message:
          "No active OTP. Please request a new OTP.",
      });
    }

    // ========================================
    // CHECK EXPIRATION
    // ========================================

    if (
      !user.otp_expires_at ||
      new Date() >
        new Date(user.otp_expires_at)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ========================================
    // CHECK OTP
    // ========================================

    if (
      String(user.email_otp) !==
      String(otp)
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ========================================
    // VERIFY EMAIL
    // ========================================

    await db.query(
      `
      UPDATE users
      SET
        email_verified = 1,
        email_otp = NULL,
        otp_expires_at = NULL
      WHERE id = ?
      `,
      [user.id]
    );

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now log in.",
    });

  } catch (error) {

    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Verification failed. Please try again.",
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

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ========================================
    // FIND USER
    // ========================================

    const [users] = await db.query(
      `
      SELECT
        id,
        email,
        email_verified
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // ========================================
    // ALREADY VERIFIED
    // ========================================

    if (
      Number(user.email_verified) === 1
    ) {

      return res.status(400).json({
        success: false,
        message:
          "This email is already verified.",
      });
    }

    // ========================================
    // GENERATE NEW OTP
    // ========================================

    const otp = generateOTP();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ========================================
    // UPDATE OTP
    // ========================================

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

    // ========================================
    // SEND OTP
    // ========================================

    const { data, error } =
      await resend.emails.send({

        from: FROM_EMAIL,

        to: [normalizedEmail],

        subject:
          "Your New MultiServe Verification Code",

        html: `
          <div
            style="
              font-family:Arial,Helvetica,sans-serif;
              max-width:600px;
              margin:auto;
              padding:40px;
              background:#ffffff;
            "
          >

            <h2>
              MultiServe Email Verification
            </h2>

            <p>
              Here is your new verification code:
            </p>

            <div
              style="
                margin:25px 0;
                padding:20px;
                text-align:center;
                background:#f3f4f6;
                border-radius:10px;
              "
            >

              <strong
                style="
                  font-size:36px;
                  letter-spacing:10px;
                  color:#2563eb;
                "
              >
                ${otp}
              </strong>

            </div>

            <p>
              This code expires in 10 minutes.
            </p>

            <p
              style="
                color:#6b7280;
                font-size:13px;
              "
            >
              If you did not request this code,
              please ignore this email.
            </p>

          </div>
        `,
      });

    // ========================================
    // RESEND FAILED
    // ========================================

    if (error) {

      console.error(
        "RESEND OTP EMAIL ERROR:",
        error
      );

      return res.status(503).json({
        success: false,
        message:
          "We could not send the OTP. Please try again.",
      });
    }

    console.log(
      "OTP RESENT:",
      normalizedEmail,
      data?.id || ""
    );

    return res.status(200).json({
      success: true,
      message:
        "A new OTP has been sent to your email.",
    });

  } catch (error) {

    console.error(
      "RESEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resend OTP.",
    });
  }
};