import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import "../../styles/Auth.css";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  const [email, setEmail] = useState(
    localStorage.getItem("verifyEmail") || ""
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

  // ========================================
  // AUTO FOCUS OTP
  // ========================================

  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  // ========================================
  // RESEND COUNTDOWN
  // ========================================

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ========================================
  // HANDLE OTP INPUT
  // ========================================

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ========================================
  // VERIFY OTP
  // ========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // EMAIL VALIDATION
    // ========================================

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // ========================================
    // OTP VALIDATION
    // ========================================

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/verify-otp",
        {
          email: normalizedEmail,
          otp,
        }
      );

      // ========================================
      // SUCCESS
      // ========================================

      setSuccess(
        response.data?.message ||
          "Email verified successfully."
      );

      localStorage.removeItem("verifyEmail");

      // ========================================
      // REDIRECT TO LOGIN
      // ========================================

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setOtp("");

      setError(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );

      // Focus OTP again
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESEND OTP
  // ========================================

  const resendOtp = async () => {
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (resendCooldown > 0) {
      return;
    }

    try {
      setResending(true);

      const response = await API.post(
        "/auth/resend-otp",
        {
          email: normalizedEmail,
        }
      );

      setSuccess(
        response.data?.message ||
          "A new OTP has been sent to your email."
      );

      setOtp("");

      // ========================================
      // START 60 SECOND COOLDOWN
      // ========================================

      setResendCooldown(60);

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  // ========================================
  // FORMAT COOLDOWN
  // ========================================

  const resendText =
    resendCooldown > 0
      ? `Resend OTP in ${resendCooldown}s`
      : "Resend OTP";

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="auth-container">

      {/* ====================================
          BACKGROUND
      ==================================== */}

      <div className="auth-bg">
        <div className="auth-blur-1" />
        <div className="auth-blur-2" />
        <div className="auth-blur-3" />
      </div>

      {/* ====================================
          CARD
      ==================================== */}

      <div className="auth-card-wrapper">
        <div className="auth-card">

          {/* ==================================
              LOGO
          ================================== */}

          <div className="auth-logo-wrapper">
            <div className="auth-logo-icon">
              <ShieldCheck />
            </div>
          </div>

          {/* ==================================
              HEADER
          ================================== */}

          <div className="auth-header">

            <h1 className="auth-title">
              Verify Your Email
            </h1>

            <p className="auth-subtitle">
              Enter the 6-digit verification code
              sent to your email address.
            </p>

          </div>

          {/* ==================================
              ERROR ALERT
          ================================== */}

          {error && (
            <div className="auth-alert">

              <svg
                className="alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293 1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>

              <span>{error}</span>

            </div>
          )}

          {/* ==================================
              SUCCESS ALERT
          ================================== */}

          {success && (
            <div
              className="auth-alert"
              style={{
                color: "#166534",
                background: "#dcfce7",
                borderColor: "#86efac",
              }}
            >
              <CheckCircle2
                size={20}
                className="alert-icon"
              />

              <span>{success}</span>
            </div>
          )}

          {/* ==================================
              FORM
          ================================== */}

          <form
            onSubmit={handleVerify}
            className="auth-form"
          >

            {/* ==================================
                EMAIL
            ================================== */}

            <div className="form-group">

              <label className="form-label">
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail className="input-icon" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="auth-input"
                />

              </div>

            </div>

            {/* ==================================
                OTP
            ================================== */}

            <div className="form-group">

              <label className="form-label">
                Verification Code
              </label>

              <div className="input-wrapper">

                <KeyRound className="input-icon" />

                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="auth-input"
                  style={{
                    letterSpacing: "6px",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                />

              </div>

              <p className="otp-hint">
                Enter the 6-digit code sent to your
                email. The code expires after 10
                minutes.
              </p>

            </div>

            {/* ==================================
                VERIFY BUTTON
            ================================== */}

            <button
              type="submit"
              disabled={
                loading ||
                resending ||
                otp.length !== 6
              }
              className="auth-submit-btn otp-btn"
            >

              {loading ? (
                <span className="auth-loading">

                  <Loader2
                    size={20}
                    className="spinner"
                  />

                  Verifying...

                </span>
              ) : (
                <>
                  Verify Email

                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>

          {/* ==================================
              RESEND
          ================================== */}

          <div className="otp-resend">

            <p className="otp-resend-text">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={resendOtp}
              disabled={
                loading ||
                resending ||
                resendCooldown > 0
              }
              className="otp-resend-btn"
            >

              {resending ? (
                <span
                  className="auth-loading"
                >
                  <Loader2
                    size={16}
                    className="spinner"
                  />

                  Sending...
                </span>
              ) : (
                resendText
              )}

            </button>

          </div>

          {/* ==================================
              FOOTER
          ================================== */}

          <div className="auth-footer">

            <p className="auth-footer-text">

              <Link
                to="/login"
                className="auth-link"
              >
                Back to Login
              </Link>

            </p>

          </div>

        </div>
      </div>
    </div>
  );
}