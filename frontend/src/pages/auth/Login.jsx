import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(formData);
    setLoading(false);

    if (res.success) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "provider") {
        navigate("/provider/dashboard");
      } else if (user.role === "customer") {
        navigate("/customer/dashboard");
      }
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      {/* Background Decorations */}
      <div className="auth-bg-decoration">
        <div className="auth-bg-blur-1" />
        <div className="auth-bg-blur-2" />
        <div className="auth-bg-blur-3" />
      </div>

      {/* Auth Card */}
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Login to continue managing your MultiServe account
            </p>
          </div>

          {/* Error Alert */}
          {error && <div className="auth-alert">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input auth-input-with-icon"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <LockKeyhole className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input auth-input-with-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="forgot-password-wrapper">
              <button type="button" className="forgot-password-btn">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <span className="auth-loading">
                  <div className="loading-spinner-small" />
                  Signing In...
                </span>
              ) : (
                <>
                  Login
                  <ArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
