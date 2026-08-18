const axios = require("axios");

// ========================================
// BREVO CONFIGURATION
// ========================================

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// ========================================
// SEND VERIFICATION OTP
// ========================================

const sendVerificationOTP = async ({ to, otp, type }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!to || !otp) {
    throw new Error("Recipient email and OTP are required");
  }

  // ========================================
  // EMAIL SUBJECT
  // ========================================

  const subject =
    type === "resend"
      ? "Your MultiServe verification code"
      : "Verify your MultiServe account";

  // ========================================
  // EMAIL CONTENT
  // ========================================

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          "
        >

          <!-- HEADER -->

          <div
            style="
              padding: 30px;
              background: #111827;
              text-align: center;
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
              "
            >
              MultiServe
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #d1d5db;
                font-size: 14px;
              "
            >
              Services made simple
            </p>
          </div>

          <!-- CONTENT -->

          <div style="padding: 40px 30px;">

            <h2
              style="
                margin-top: 0;
                color: #111827;
                font-size: 22px;
              "
            >
              Verify your email address
            </h2>

            <p
              style="
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Thank you for creating your MultiServe account.
              Please use the verification code below to verify your email address.
            </p>

            <!-- OTP -->

            <div
              style="
                margin: 30px 0;
                padding: 25px;
                background: #f3f4f6;
                border-radius: 10px;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0 0 10px;
                  color: #6b7280;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
              >
                Your verification code
              </p>

              <div
                style="
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #111827;
                "
              >
                ${otp}
              </div>

            </div>

            <p
              style="
                color: #4b5563;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p
              style="
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              If you did not create a MultiServe account, you can safely
              ignore this email.
            </p>

          </div>

          <!-- FOOTER -->

          <div
            style="
              padding: 20px 30px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0;
                color: #9ca3af;
                font-size: 12px;
              "
            >
              © ${new Date().getFullYear()} MultiServe. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  // ========================================
  // SEND THROUGH BREVO HTTP API
  // ========================================

  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: "MultiServe",
          email:
            process.env.BREVO_SENDER_EMAIL ||
            "sandiledr100@gmail.com",
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },

        timeout: 15000,
      },
    );

    console.log("BREVO EMAIL SENT:", {
      to,
      messageId: response.data?.messageId,
    });

    return response.data;
  } catch (error) {
    const brevoError = error.response?.data;

    console.error("BREVO EMAIL ERROR:", {
      status: error.response?.status,
      message: brevoError?.message || error.message,
      code: brevoError?.code,
    });

    throw new Error(
      brevoError?.message ||
        "Failed to send verification email through Brevo",
    );
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  sendVerificationOTP,
};