import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

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
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // HANDLE REGISTER
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setError("");

    setSuccess("");

    try {
      const res = await register(formData);

      // ================================
      // SUCCESS
      // ================================

      if (res.success) {
        // SAVE EMAIL
        localStorage.setItem("verifyEmail", formData.email);

        setSuccess("OTP sent to your email");

        // REDIRECT TO OTP PAGE
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500);
      } else {
        setError(res.message);
      }
    } catch (error) {
      console.log(error);

      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Background Gradient */}
      <div className="register-bg-gradient" />

      {/* Navbar */}
      <header className="register-navbar">
        <div className="register-navbar-container">
          <Link to="/" className="register-logo">
            MultiServe
          </Link>

          <div className="register-nav-links">
            <Link to="/login" className="register-nav-link">
              Login
            </Link>

            <Link to="/" className="register-nav-btn">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="register-main">
        <div className="register-grid">
          {/* Left Side */}
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
            <div className="register-badge">Trusted Local Marketplace</div>

            <h1 className="register-title">
              Discover
              <br />
              Trusted
              <span className="register-title-highlight"> Local Services</span>
            </h1>

            <p className="register-description">
              Book salons, barbershops, laundry hubs, shoe wash services and car
              wash providers all in one professional platform.
            </p>

            {/* Services */}
            <div className="register-services-grid">
              {["Salon", "Barbershop", "Shoe Wash", "Car Wash"].map(
                (service) => (
                  <div key={service} className="register-service-card">
                    <h3 className="register-service-title">{service}</h3>

                    <p className="register-service-desc">
                      Trusted verified providers
                    </p>
                  </div>
                ),
              )}
            </div>
          </motion.div>

          {/* Right Side */}
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
              {/* Header */}
              <div className="register-card-header">
                <h2 className="register-card-title">Create Account</h2>

                <p className="register-card-subtitle">Join MultiServe today</p>
              </div>

              {/* Alerts */}
              {error && <div className="auth-alert">{error}</div>}

              {success && <div className="auth-success-alert">{success}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} className="register-form">
                {/* Full Name */}
                <div className="register-form-group">
                  <label className="register-label">Full Name</label>

                  <div className="register-input-wrapper">
                    <User className="register-input-icon" />

                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Full Name as per ID"
                      required
                      className="register-input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="register-form-group">
                  <label className="register-label">Email Address</label>

                  <div className="register-input-wrapper">
                    <Mail className="register-input-icon" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="register-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="register-form-group">
                  <label className="register-label">Phone Number</label>

                  <div className="register-input-wrapper">
                    <Phone className="register-input-icon" />

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 123 456 789"
                      required
                      className="register-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="register-form-group">
                  <label className="register-label">Password</label>

                  <div className="register-input-wrapper">
                    <Lock className="register-input-icon" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      required
                      className="
                        register-input
                        register-input-with-password
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        register-password-toggle
                      "
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div className="register-form-group">
                  <label className="register-label">Account Type</label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="register-select"
                  >
                    <option value="customer">Customer</option>

                    <option value="provider">Provider</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="register-submit-btn"
                >
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="register-footer">
                <p className="register-footer-text">
                  Already have an account?{" "}
                  <Link to="/login" className="register-link">
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
