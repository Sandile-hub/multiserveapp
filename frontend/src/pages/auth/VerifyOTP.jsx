import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { ShieldCheck, Mail, KeyRound, ArrowRight, Loader2, Sparkles } from "lucide-react";
import "../../styles/Auth.css";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("verifyEmail") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    // Validate OTP length
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/verify-otp", {
        email,
        otp,
      });
      alert(response.data.message);
      localStorage.removeItem("verifyEmail");
      navigate("/login");
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) {
      setError("Email address is required");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/resend-otp", { email });
      alert(response.data.message);
    } catch (error) {
      console.error("Resend error:", error);
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-blur-1" />
        <div className="auth-blur-2" />
        <div className="auth-blur-3" />
      </div>

      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo-wrapper">
            <div className="auth-logo-icon">
              <ShieldCheck />
            </div>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Verify OTP</h1>
            <p className="auth-subtitle">Enter the verification code sent to your email</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="auth-alert">
              <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            {/* OTP Field */}
            <div className="form-group">
              <label className="form-label">Verification Code (OTP)</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="auth-input"
                />
              </div>
              <p className="otp-hint">Please check your email for the 6-digit verification code.</p>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="auth-submit-btn otp-btn">
              {loading ? (
                <span className="auth-loading">
                  <Loader2 size={20} className="spinner" />
                  Verifying...
                </span>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="otp-resend">
            <p className="otp-resend-text">Didn't receive the code?</p>
            <button onClick={resendOtp} disabled={loading} className="otp-resend-btn">
              Resend OTP
            </button>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}