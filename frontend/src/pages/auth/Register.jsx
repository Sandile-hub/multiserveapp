import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

import "../../styles/Auth.css";

function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear messages when user starts editing
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ========================================
  // HANDLE REGISTER
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) {
      return;
    }

    setLoading(true);

    setError("");
    setSuccess("");

    // ========================================
    // NORMALIZE FORM DATA
    // ========================================

    const normalizedEmail = formData.email
      .trim()
      .toLowerCase();

    const normalizedFormData = {
      ...formData,
      full_name: formData.full_name.trim(),
      email: normalizedEmail,
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role,
    };

    // ========================================
    // BASIC FRONTEND VALIDATION
    // ========================================

    if (!normalizedFormData.full_name) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (!normalizedFormData.phone) {
      setError("Please enter your phone number.");
      setLoading(false);
      return;
    }

    if (!normalizedFormData.password) {
      setError("Please enter a password.");
      setLoading(false);
      return;
    }

    if (normalizedFormData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      setLoading(false);
      return;
    }

    try {
      // ========================================
      // REGISTER USER
      // ========================================

      const res = await register(
        normalizedFormData
      );

      // ========================================
      // REGISTRATION SUCCESSFUL
      // ========================================

      if (res?.success) {
        // ======================================
        // SAVE EMAIL FOR OTP VERIFICATION
        // ======================================

        localStorage.setItem(
          "verifyEmail",
          normalizedEmail
        );

        // ======================================
        // SHOW SUCCESS
        // ======================================

        setSuccess(
          "Account created successfully! We sent a 6-digit verification code to your email."
        );

        // ======================================
        // REDIRECT TO OTP PAGE
        // ======================================

        setTimeout(() => {
          navigate("/verify-otp", {
            replace: true,
          });
        }, 1200);

        return;
      }

      // ========================================
      // REGISTRATION FAILED
      // ========================================

      setError(
        res?.message ||
          "Registration failed. Please try again."
      );
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      // ========================================
      // BACKEND ERROR
      // ========================================

      const backendMessage =
        error?.response?.data?.message;

      if (backendMessage) {
        setError(backendMessage);
      } else {
        setError(
          "Registration failed. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="register-container">

      {/* ======================================
          BACKGROUND GRADIENT
      ====================================== */}

      <div className="register-bg-gradient" />

      {/* ======================================
          NAVBAR
      ====================================== */}

      <header className="register-navbar">

        <div className="register-navbar-container">

          <Link
            to="/"
            className="register-logo"
          >
            MultiServe
          </Link>

          <div className="register-nav-links">

            <Link
              to="/login"
              className="register-nav-link"
            >
              Login
            </Link>

            <Link
              to="/"
              className="register-nav-btn"
            >
              Home
            </Link>

          </div>

        </div>

      </header>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="register-main">

        <div className="register-grid">

          {/* ==================================
              LEFT SIDE
          ================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="register-info"
          >

            <div className="register-badge">
              Trusted Local Marketplace
            </div>

            <h1 className="register-title">
              Discover
              <br />
              Trusted
              <span className="register-title-highlight">
                {" "}
                Local Services
              </span>
            </h1>

            <p className="register-description">
              Book salons, barbershops, laundry
              hubs, shoe wash services and car
              wash providers all in one professional
              platform.
            </p>

            {/* ==================================
                SERVICES
            ================================== */}

            <div className="register-services-grid">

              {[
                "Salon",
                "Barbershop",
                "Shoe Wash",
                "Car Wash",
              ].map((service) => (
                <div
                  key={service}
                  className="register-service-card"
                >

                  <h3 className="register-service-title">
                    {service}
                  </h3>

                  <p className="register-service-desc">
                    Trusted verified providers
                  </p>

                </div>
              ))}

            </div>

          </motion.div>

          {/* ==================================
              RIGHT SIDE
          ================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="register-card-wrapper"
          >

            <div className="register-card">

              {/* =================================
                  HEADER
              ================================= */}

              <div className="register-card-header">

                <h2 className="register-card-title">
                  Create Account
                </h2>

                <p className="register-card-subtitle">
                  Join MultiServe today
                </p>

              </div>

              {/* =================================
                  ERROR
              ================================= */}

              {error && (
                <div className="auth-alert">
                  {error}
                </div>
              )}

              {/* =================================
                  SUCCESS
              ================================= */}

              {success && (
                <div className="auth-success-alert">
                  {success}
                </div>
              )}

              {/* =================================
                  FORM
              ================================= */}

              <form
                onSubmit={handleSubmit}
                className="register-form"
              >

                {/* =================================
                    FULL NAME
                ================================= */}

                <div className="register-form-group">

                  <label className="register-label">
                    Full Name
                  </label>

                  <div className="register-input-wrapper">

                    <User className="register-input-icon" />

                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Full Name as per ID"
                      required
                      autoComplete="name"
                      className="register-input"
                    />

                  </div>

                </div>

                {/* =================================
                    EMAIL
                ================================= */}

                <div className="register-form-group">

                  <label className="register-label">
                    Email Address
                  </label>

                  <div className="register-input-wrapper">

                    <Mail className="register-input-icon" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="register-input"
                    />

                  </div>

                </div>

                {/* =================================
                    PHONE
                ================================= */}

                <div className="register-form-group">

                  <label className="register-label">
                    Phone Number
                  </label>

                  <div className="register-input-wrapper">

                    <Phone className="register-input-icon" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 123 456 789"
                      required
                      autoComplete="tel"
                      className="register-input"
                    />

                  </div>

                </div>

                {/* =================================
                    PASSWORD
                ================================= */}

                <div className="register-form-group">

                  <label className="register-label">
                    Password
                  </label>

                  <div className="register-input-wrapper">

                    <Lock className="register-input-icon" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="
                        register-input
                        register-input-with-password
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                        register-password-toggle
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>

                {/* =================================
                    ROLE
                ================================= */}

                <div className="register-form-group">

                  <label className="register-label">
                    Account Type
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="register-select"
                  >

                    <option value="customer">
                      Customer
                    </option>

                    <option value="provider">
                      Provider
                    </option>

                  </select>

                </div>

                {/* =================================
                    SUBMIT
                ================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="register-submit-btn"
                >

                  {loading ? (
                    <span className="auth-loading">

                      <Loader2
                        size={20}
                        className="spinner"
                      />

                      Creating Account...

                    </span>
                  ) : (
                    <>
                      Create Account

                      <ArrowRight size={18} />
                    </>
                  )}

                </button>

              </form>

              {/* =================================
                  FOOTER
              ================================= */}

              <div className="register-footer">

                <p className="register-footer-text">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="register-link"
                  >
                    Login
                  </Link>

                </p>

              </div>

            </div>

          </motion.div>

        </div>

      </main>

    </div>
  );
}

export default Register;