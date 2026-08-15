import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";

import {
  CalendarDays,
  Clock3,
  CreditCard,
  Loader2,
  Wallet,
  XCircle,
  Star,
  Sparkles,
  MessageSquareText,
  BadgeCheck,
  AlertCircle,
  CheckCircle,
  Shield,
  LockKeyhole,
} from "lucide-react";

import "../../styles/Customer.css";

function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payingId, setPayingId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [reviewModal, setReviewModal] = useState(null);

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  const [paymentError, setPaymentError] = useState(null);

  // ========================================
  // FETCH BOOKINGS
  // ========================================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await API.get("/bookings/customer");

      setBookings(
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.bookings)
            ? res.data.bookings
            : [],
      );

      setPaymentError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);

      setPaymentError(
        error.response?.data?.message ||
          "Unable to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ========================================
  // PAY ON SITE
  // ========================================

  const handlePayment = async (booking) => {
    try {
      setPayingId(booking.id);
      setProcessingPayment(true);
      setPaymentError(null);

      console.log("Processing onsite payment:", {
        booking_id: booking.id,
        amount: booking.total_amount,
      });

      // ====================================
      // IMPORTANT
      // ALWAYS SEND ONSITE
      // ====================================

      const requestData = {
        booking_id: booking.id,
        amount: parseFloat(booking.total_amount),
        payment_method: "onsite",
      };

      const res = await API.post(
        "/payments/create",
        requestData,
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            "Unable to select onsite payment.",
        );
      }

      // ====================================
      // SUCCESS
      // ====================================

      alert(
        res.data.message ||
          "Pay On Site selected. Please pay at the business location.",
      );

      await fetchBookings();
    } catch (error) {
      console.error("Onsite payment error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment failed.";

      setPaymentError(errorMessage);

      alert(errorMessage);
    } finally {
      setPayingId(null);
      setProcessingPayment(false);
    }
  };

  // ========================================
  // SUBMIT REVIEW
  // ========================================

  const submitReview = async () => {
    try {
      await API.post("/reviews/create", {
        booking_id: reviewModal.id,
        provider_id: reviewModal.provider_id,
        business_id: reviewModal.business_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      alert("Review submitted successfully.");

      setReviewModal(null);

      setReviewData({
        rating: 5,
        comment: "",
      });

      fetchBookings();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to submit review.",
      );
    }
  };

  // ========================================
  // CHECK PAYMENT DUE
  // ========================================

  const isPaymentDue = (booking) => {
    return (
      booking.status === "accepted" &&
      booking.payment_status !== "paid"
    );
  };

  // ========================================
  // STATUS COLOR
  // ========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";

      case "accepted":
        return "#10b981";

      case "completed":
        return "#3b82f6";

      case "cancelled":
        return "#ef4444";

      case "declined":
        return "#dc2626";

      default:
        return "#6b7280";
    }
  };

  // ========================================
  // TOTAL STATS
  // ========================================

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      completed: bookings.filter(
        (b) => b.status === "completed",
      ).length,

      pending: bookings.filter(
        (b) => b.status === "pending",
      ).length,

      accepted: bookings.filter(
        (b) => b.status === "accepted",
      ).length,

      totalSpent: bookings
        .filter(
          (b) => b.payment_status === "paid",
        )
        .reduce(
          (sum, b) =>
            sum + parseFloat(b.total_amount || 0),
          0,
        ),
    };
  }, [bookings]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2
            size={50}
            className="spinner text-cyan"
          />

          <p className="loading-text">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <div className="customer-main">
        <CustomerNavbar />

        <div className="customer-main-content">

          {/* ========================================
              HEADER
          ======================================== */}

          <div className="bookings-header">

            <div>
              <div className="bookings-badge">
                <Sparkles size={16} />

                Booking Management
              </div>

              <h1 className="bookings-title">
                My Bookings
              </h1>

              <p className="bookings-subtitle">
                Manage and track your service bookings.
              </p>
            </div>

            {/* ========================================
                STATS
            ======================================== */}

            <div className="bookings-stats">

              <div className="booking-stat-card">
                <p className="booking-stat-label">
                  Total
                </p>

                <h2 className="booking-stat-value">
                  {stats.total}
                </h2>
              </div>

              <div className="booking-stat-card">
                <p className="booking-stat-label">
                  Pending
                </p>

                <h2 className="booking-stat-value pending">
                  {stats.pending}
                </h2>
              </div>

              <div className="booking-stat-card">
                <p className="booking-stat-label">
                  Accepted
                </p>

                <h2 className="booking-stat-value accepted">
                  {stats.accepted}
                </h2>
              </div>

              <div className="booking-stat-card">
                <p className="booking-stat-label">
                  Completed
                </p>

                <h2 className="booking-stat-value completed">
                  {stats.completed}
                </h2>
              </div>

              <div className="booking-stat-card">
                <p className="booking-stat-label">
                  Total Spent
                </p>

                <h2 className="booking-stat-value">
                  R{stats.totalSpent.toFixed(2)}
                </h2>
              </div>

            </div>
          </div>

          {/* ========================================
              PAYMENT INFORMATION
          ======================================== */}

          <div
            style={{
              marginBottom: "25px",
              padding: "18px 22px",
              borderRadius: "16px",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              background:
                "rgba(34, 211, 238, 0.05)",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <Shield
                size={22}
                style={{ color: "#22d3ee" }}
              />

              <div>

                <strong>
                  Payment Method
                </strong>

                <p
                  style={{
                    margin: "4px 0 0",
                    opacity: 0.7,
                    fontSize: "14px",
                  }}
                >
                  For now, MultiServe accepts
                  <strong> Pay On Site </strong>
                  only.
                </p>

              </div>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "14px",
              }}
            >

              <span
                style={{
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background:
                    "rgba(16, 185, 129, 0.12)",
                  color: "#10b981",
                  fontSize: "13px",
                }}
              >
                ✓ Pay On Site
              </span>

              <span
                style={{
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background:
                    "rgba(107, 114, 128, 0.12)",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                <LockKeyhole
                  size={12}
                  style={{
                    display: "inline",
                    marginRight: "5px",
                  }}
                />

                Card Payments — Coming Soon
              </span>

              <span
                style={{
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background:
                    "rgba(107, 114, 128, 0.12)",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                <Wallet
                  size={13}
                  style={{
                    display: "inline",
                    marginRight: "5px",
                  }}
                />

                Wallet — Coming Soon
              </span>

            </div>
          </div>

          {/* ========================================
              EMPTY STATE
          ======================================== */}

          {bookings.length === 0 && (
            <div className="bookings-empty-state">

              <AlertCircle
                size={80}
                className="bookings-empty-icon"
              />

              <h2 className="bookings-empty-title">
                No Bookings Yet
              </h2>

              <p className="bookings-empty-text">
                Your bookings will appear here once
                you book a service.
              </p>

            </div>
          )}

          {/* ========================================
              BOOKINGS GRID
          ======================================== */}

          <div className="bookings-grid">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="booking-card"
              >

                <div className="booking-card-content">

                  {/* HEADER */}

                  <div className="booking-card-header">

                    <div>

                      <h2 className="booking-service-name">
                        {booking.service_name}
                      </h2>

                      <p className="booking-business-name">
                        {booking.business_name}
                      </p>

                    </div>

                    <div
                      className={`booking-status booking-status-${booking.status}`}
                      style={{
                        backgroundColor:
                          getStatusColor(
                            booking.status,
                          ) + "20",

                        color:
                          getStatusColor(
                            booking.status,
                          ),
                      }}
                    >
                      {booking.status.toUpperCase()}
                    </div>

                  </div>

                  {/* INFO */}

                  <div className="booking-info">

                    <div className="booking-info-row">

                      <span className="booking-info-label">
                        <CalendarDays size={16} />

                        Date
                      </span>

                      <span className="booking-info-value">
                        {new Date(
                          booking.booking_date,
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    <div className="booking-info-row">

                      <span className="booking-info-label">
                        <Clock3 size={16} />

                        Time
                      </span>

                      <span className="booking-info-value">
                        {booking.booking_time}
                      </span>

                    </div>

                    <div className="booking-info-row">

                      <span className="booking-info-label">
                        <Wallet size={16} />

                        Amount
                      </span>

                      <span className="booking-amount">
                        R
                        {parseFloat(
                          booking.total_amount || 0,
                        ).toFixed(2)}
                      </span>

                    </div>

                    {/* PAYMENT METHOD */}

                    <div className="booking-info-row">

                      <span className="booking-info-label">
                        <CreditCard size={16} />

                        Payment
                      </span>

                      <span className="booking-info-value">
                        Pay On Site
                      </span>

                    </div>

                    {/* PAYMENT STATUS */}

                    {booking.payment_status === "paid" && (

                      <div className="booking-info-row">

                        <span className="booking-info-label">

                          <CheckCircle size={16} />

                          Payment Status

                        </span>

                        <span className="booking-paid-badge">

                          <BadgeCheck size={14} />

                          Paid

                        </span>

                      </div>

                    )}

                    {booking.payment_status === "pending" && (

                      <div className="booking-info-row">

                        <span className="booking-info-label">

                          <Clock3 size={16} />

                          Payment Status

                        </span>

                        <span
                          style={{
                            color: "#f59e0b",
                            fontWeight: 600,
                          }}
                        >
                          Pay On Site
                        </span>

                      </div>

                    )}

                  </div>

                  {/* NOTES */}

                  {booking.notes && (

                    <div className="booking-notes">

                      <div className="booking-notes-header">

                        <MessageSquareText
                          size={16}
                          className="booking-notes-icon"
                        />

                        <h3 className="booking-notes-title">
                          Notes
                        </h3>

                      </div>

                      <p className="booking-notes-text">
                        {booking.notes}
                      </p>

                    </div>

                  )}

                  {/* DECLINE REASON */}

                  {booking.status === "declined" && (

                    <div className="booking-declined">

                      <div className="booking-declined-header">

                        <XCircle
                          size={18}
                          className="booking-declined-icon"
                        />

                        <h3 className="booking-declined-title">
                          Decline Reason
                        </h3>

                      </div>

                      <p className="booking-declined-text">
                        {booking.decline_reason}
                      </p>

                    </div>

                  )}

                  {/* PAYMENT ERROR */}

                  {paymentError &&
                    payingId === booking.id && (

                      <div className="booking-payment-error">

                        <AlertCircle size={16} />

                        <span>
                          {paymentError}
                        </span>

                      </div>

                    )}

                  {/* ========================================
                      PAY ON SITE BUTTON
                  ======================================== */}

                  {isPaymentDue(booking) && (

                    <div className="booking-payment-section">

                      <button
                        onClick={() =>
                          handlePayment(booking)
                        }
                        disabled={
                          payingId === booking.id ||
                          processingPayment
                        }
                        className="booking-pay-btn onsite-payment"
                      >

                        {payingId === booking.id ? (

                          <>
                            <Loader2
                              size={18}
                              className="spinner"
                            />

                            Processing...

                          </>

                        ) : (

                          <>
                            <Shield size={18} />

                            Pay On Site

                          </>

                        )}

                      </button>

                      <p className="payment-note">
                        📍 Pay the service provider
                        at the business location.
                      </p>

                    </div>

                  )}

                  {/* REVIEW */}

                  {booking.status === "completed" &&
                    !booking.review_given && (

                      <button
                        onClick={() =>
                          setReviewModal(booking)
                        }
                        className="booking-review-btn"
                      >

                        <Star size={18} />

                        Leave a Review

                      </button>

                    )}

                  {booking.status === "completed" &&
                    booking.review_given && (

                      <div className="review-given">

                        <Star size={16} />

                        Review Submitted

                      </div>

                    )}

                </div>

              </div>

            ))}

          </div>

        </div>
      </div>

      {/* ========================================
          REVIEW MODAL
      ======================================== */}

      {reviewModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setReviewModal(null)
          }
        >

          <div
            className="modal-container"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2 className="modal-title">
              Review Your Experience
            </h2>

            {/* RATING */}

            <div className="review-rating">

              <label className="review-label">
                Rating
              </label>

              <div className="review-stars">

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      onClick={() =>
                        setReviewData({
                          ...reviewData,
                          rating: star,
                        })
                      }
                      className={`review-star ${
                        reviewData.rating >= star
                          ? "review-star-active"
                          : ""
                      }`}
                    >

                      <Star size={22} />

                    </button>

                  ),
                )}

              </div>

            </div>

            {/* COMMENT */}

            <div className="review-comment">

              <label className="review-label">
                Your Review
              </label>

              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({
                    ...reviewData,
                    comment: e.target.value,
                  })
                }
                placeholder="Share your experience with this service..."
                className="review-textarea"
                rows="4"
              />

            </div>

            {/* ACTIONS */}

            <div className="modal-actions">

              <button
                onClick={() =>
                  setReviewModal(null)
                }
                className="modal-btn-cancel"
              >
                Cancel
              </button>

              <button
                onClick={submitReview}
                className="modal-btn-submit"
              >
                Submit Review
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CustomerBookings;