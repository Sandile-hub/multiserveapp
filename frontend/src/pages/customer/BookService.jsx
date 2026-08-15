import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import API from "../../api/axios";

import {
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Wallet,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building2,
  Star,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

import "../../styles/Customer.css";

function BookService() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.state;

  // ========================================
  // FORM DATA
  // ========================================

  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",

    // PAY ON SITE ONLY
    payment_method: "onsite",

    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // TODAY
  // ========================================

  const today = useMemo(() => {
    const date = new Date();

    return date.toISOString().split("T")[0];
  }, []);

  // ========================================
  // HANDLE CHANGE
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // ========================================
  // SUBMIT BOOKING
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ========================================
    // VALIDATE SERVICE
    // ========================================

    if (!service) {
      setError(
        "Service information is missing. Please select a service again.",
      );

      return;
    }

    // ========================================
    // VALIDATE DATE
    // ========================================

    if (!formData.booking_date) {
      setError("Please select a booking date.");

      return;
    }

    if (formData.booking_date < today) {
      setError("Please select a future date.");

      return;
    }

    // ========================================
    // VALIDATE TIME
    // ========================================

    if (!formData.booking_time) {
      setError("Please select a booking time.");

      return;
    }

    // ========================================
    // FORCE ONSITE PAYMENT
    // ========================================

    const bookingData = {
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,

      // IMPORTANT:
      // Online/Card payments are currently disabled.
      payment_method: "onsite",

      notes: formData.notes,

      provider_id: service.provider_id,
      business_id: service.business_id,
      service_id: service.id,
    };

    console.log("Creating booking:", bookingData);

    try {
      setLoading(true);

      await API.post(
        "/bookings/create",
        bookingData,
      );

      alert(
        "Booking submitted successfully! Please wait for the provider to accept your booking.",
      );

      navigate("/customer/bookings");

    } catch (error) {
      console.error(
        "Error creating booking:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to create booking. Please try again.",
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // NO SERVICE
  // ========================================

  if (!service) {
    return (
      <div className="booking-error-container">

        <div className="booking-error-card">

          <h1 className="booking-error-title">
            Service Not Found
          </h1>

          <p className="booking-error-text">
            The selected service could not be loaded.
          </p>

          <button
            onClick={() =>
              navigate("/services")
            }
            className="booking-error-btn"
          >
            Browse Services
          </button>

        </div>

      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="booking-container">

      {/* ========================================
          BACKGROUND EFFECTS
      ======================================== */}

      <div className="booking-bg">

        <div className="booking-bg-1" />

        <div className="booking-bg-2" />

      </div>

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="booking-content">

        {/* ========================================
            TOP BAR
        ======================================== */}

        <div className="booking-top-bar">

          <button
            onClick={() => navigate(-1)}
            className="booking-back-btn"
          >
            <ArrowLeft size={20} />

            Back
          </button>

          <div className="booking-badge">

            <ShieldCheck size={16} />

            Secure Booking

          </div>

        </div>

        {/* ========================================
            MAIN GRID
        ======================================== */}

        <div className="booking-grid">

          {/* ========================================
              LEFT SIDE
          ======================================== */}

          <div className="booking-service-card">

            {/* HERO */}

            <div className="booking-service-hero">

              <div className="booking-service-overlay" />

              <div className="booking-service-hero-content">

                <div className="booking-service-badge">

                  <Sparkles size={16} />

                  Premium Service

                </div>

                <h1 className="booking-service-title">
                  {service.service_name}
                </h1>

                <p className="booking-service-business">
                  {service.business_name}
                </p>

              </div>

            </div>

            {/* DETAILS */}

            <div className="booking-service-details">

              {/* SERVICE STATS */}

              <div className="booking-service-stats">

                <div className="booking-stat">

                  <Wallet
                    size={20}
                    className="booking-stat-icon cyan"
                  />

                  <h3 className="booking-stat-label">
                    Price
                  </h3>

                  <p className="booking-stat-value">
                    R
                    {Number(
                      service.price || 0,
                    ).toFixed(2)}
                  </p>

                </div>

                <div className="booking-stat">

                  <Clock3
                    size={20}
                    className="booking-stat-icon indigo"
                  />

                  <h3 className="booking-stat-label">
                    Duration
                  </h3>

                  <p className="booking-stat-value">
                    {service.duration_minutes ||
                      60}{" "}
                    min
                  </p>

                </div>

              </div>

              {/* BUSINESS DETAILS */}

              <div className="booking-business-info">

                <div className="booking-business-header">

                  <MapPin
                    size={18}
                    className="booking-business-icon"
                  />

                  <h3 className="booking-business-title">
                    Business Details
                  </h3>

                </div>

                <div className="booking-business-grid">

                  <div className="booking-info-row">

                    <span className="booking-info-label">

                      <Building2 size={14} />

                      Business

                    </span>

                    <span className="booking-info-value">
                      {service.business_name}
                    </span>

                  </div>

                  <div className="booking-info-row">

                    <span className="booking-info-label">

                      <Sparkles size={14} />

                      Category

                    </span>

                    <span className="booking-info-value">
                      {service.category ||
                        "Professional Service"}
                    </span>

                  </div>

                  <div className="booking-info-row">

                    <span className="booking-info-label">

                      <MapPin size={14} />

                      Location

                    </span>

                    <span className="booking-info-value">
                      {service.city ||
                        "South Africa"}
                    </span>

                  </div>

                  <div className="booking-info-row">

                    <span className="booking-info-label">

                      <Star size={14} />

                      Rating

                    </span>

                    <span className="booking-info-value">

                      ⭐{" "}
                      {service.average_rating ||
                        "5.0"}{" "}

                      (
                      {service.total_reviews ||
                        0}{" "}
                      reviews)

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ========================================
              RIGHT SIDE - BOOKING FORM
          ======================================== */}

          <div className="booking-form-card">

            <div className="booking-form-header">

              <div className="booking-form-icon">

                <CheckCircle2 size={28} />

              </div>

              <div>

                <h2 className="booking-form-title">
                  Complete Booking
                </h2>

                <p className="booking-form-subtitle">
                  Fill in your booking details
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="booking-form"
            >

              {/* ========================================
                  ERROR
              ======================================== */}

              {error && (

                <div className="booking-error-alert">

                  <AlertCircle size={18} />

                  {error}

                </div>

              )}

              {/* ========================================
                  DATE
              ======================================== */}

              <div className="form-group">

                <label className="form-label">

                  <CalendarDays size={16} />

                  Booking Date

                </label>

                <input
                  type="date"
                  min={today}
                  name="booking_date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  required
                  className="form-input"
                />

              </div>

              {/* ========================================
                  TIME
              ======================================== */}

              <div className="form-group">

                <label className="form-label">

                  <Clock3 size={16} />

                  Booking Time

                </label>

                <input
                  type="time"
                  name="booking_time"
                  value={formData.booking_time}
                  onChange={handleChange}
                  required
                  className="form-input"
                />

              </div>

              {/* ========================================
                  PAYMENT METHOD
              ======================================== */}

              <div className="form-group">

                <label className="form-label">

                  <CreditCard size={16} />

                  Payment Method

                </label>

                {/* PAY ON SITE */}

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border:
                      "1px solid rgba(16, 185, 129, 0.35)",
                    background:
                      "rgba(16, 185, 129, 0.08)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >

                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        background:
                          "rgba(16, 185, 129, 0.15)",
                      }}
                    >

                      <CheckCircle2
                        size={22}
                        style={{
                          color: "#10b981",
                        }}
                      />

                    </div>

                    <div>

                      <strong>
                        Pay On Site
                      </strong>

                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          fontSize:
                            "13px",
                          opacity: 0.7,
                        }}
                      >
                        Pay the service provider
                        at the business location.
                      </p>

                    </div>

                  </div>

                </div>

                {/* COMING SOON */}

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      opacity: 0.55,
                    }}
                  >

                    <LockKeyhole size={14} />

                    Card / Online Payments — Coming Soon

                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      opacity: 0.55,
                    }}
                  >

                    <Wallet size={14} />

                    MultiServe Wallet — Coming Soon

                  </div>

                </div>

              </div>

              {/* ========================================
                  NOTES
              ======================================== */}

              <div className="form-group">

                <label className="form-label">

                  <NotebookPen size={16} />

                  Additional Notes (Optional)

                </label>

                <textarea
                  name="notes"
                  placeholder="Any special requests or additional information..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={4}
                />

              </div>

              {/* ========================================
                  PAYMENT NOTICE
              ======================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background:
                    "rgba(59, 130, 246, 0.08)",
                  border:
                    "1px solid rgba(59, 130, 246, 0.2)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >

                <strong>
                  Payment Information
                </strong>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    opacity: 0.7,
                  }}
                >
                  Your booking will be created
                  with Pay On Site selected.
                  Payment is made directly at
                  the business location after
                  your booking is accepted.
                </p>

              </div>

              {/* ========================================
                  SUBMIT
              ======================================== */}

              <button
                type="submit"
                disabled={loading}
                className="booking-submit-btn"
              >

                {loading ? (

                  <>
                    <Loader2
                      size={20}
                      className="spinner"
                    />

                    Processing...
                  </>

                ) : (

                  <>
                    <CheckCircle2 size={20} />

                    Confirm Booking
                  </>

                )}

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default BookService;