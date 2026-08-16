const nodemailer = require("nodemailer");

// ========================================
// GMAIL SMTP TRANSPORTER
// ========================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ========================================
// VERIFY SMTP CONNECTION
// ========================================

const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();

    console.log("========================================");
    console.log("GMAIL SMTP CONNECTION SUCCESSFUL");
    console.log("SMTP USER:", process.env.GMAIL_USER);
    console.log("========================================");

    return true;
  } catch (error) {
    console.error("========================================");
    console.error("GMAIL SMTP CONNECTION FAILED");
    console.error(error.message);
    console.error("========================================");

    return false;
  }
};

// ========================================
// SEND VERIFICATION OTP
// ========================================

const sendVerificationOTP = async ({
  to,
  otp,
  type = "registration",
}) => {
  let subject = "Your MultiServe Verification Code";

  let title = "Welcome to MultiServe";

  let message =
    "Thank you for creating your MultiServe account.";

  if (type === "resend") {
    subject = "Your New MultiServe Verification Code";
    title = "MultiServe Email Verification";
    message =
      "Here is your new MultiServe verification code.";
  }

  const mailOptions = {
    from: `"MultiServe" <${process.env.GMAIL_USER}>`,

    to,

    subject,

    html: `
      <!DOCTYPE html>

      <html>

      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
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
            ${title}
          </h1>

          <p
            style="
              color:#4b5563;
              font-size:16px;
              line-height:1.6;
            "
          >
            ${message}
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
            in <strong>10 minutes</strong>.
          </p>

          <p
            style="
              color:#6b7280;
              font-size:14px;
            "
          >
            If you did not request this code,
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
  };

  return await transporter.sendMail(mailOptions);
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  transporter,
  verifyEmailTransporter,
  sendVerificationOTP,
};