import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Confetti from "react-confetti";

import API from "../../api/axios";

import {

  CheckCircle,

  ArrowLeft,

  Home,

  Loader2,

  CreditCard,

  BadgeCheck,

  Receipt,

  CalendarDays,

  Wallet,

  ShieldCheck,

} from "lucide-react";

import "../../styles/PaymentSuccess.css";

function PaymentSuccess() {

  const navigate =
  useNavigate();

  const [searchParams] =
  useSearchParams();

  const session_id =
  searchParams.get(
    "session_id"
  );

  const [loading, setLoading] =
  useState(true);

  const [payment, setPayment] =
  useState(null);

  const [countdown, setCountdown] =
  useState(5);

  // ========================================
  // VERIFY PAYMENT
  // ========================================

  useEffect(() => {

    const verifyPayment =
    async () => {

      try {

        const res =
        await API.post(
          "/payments/verify-stripe",
          {
            session_id,
          }
        );

        setPayment(
          res.data
        );

      } catch (error) {

        console.error(
          "Payment verification error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

    if (session_id) {
      verifyPayment();
    }

  }, [session_id]);

  // ========================================
  // AUTO REDIRECT
  // ========================================

  useEffect(() => {

    if (!loading) {

      const timer =
      setInterval(() => {

        setCountdown(
          (prev) => {

            if (prev <= 1) {

              clearInterval(
                timer
              );

              navigate(
                "/customer/bookings"
              );

              return 0;
            }

            return prev - 1;
          }
        );

      }, 1000);

      return () =>
        clearInterval(timer);
    }

  }, [loading, navigate]);

  // ========================================
  // DOWNLOAD RECEIPT
  // ========================================

  const downloadReceipt =
  async () => {

    try {

      window.open(
        `http://localhost:5000/api/payments/receipt/${payment?.payment_id}`,
        "_blank"
      );

    } catch (error) {

      console.error(
        "Receipt download error:",
        error
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="payment-success-loading">

        <Loader2
          size={55}
          className="spinner"
        />

        <h2>
          Verifying Payment...
        </h2>

        <p>
          Please wait while we confirm your transaction.
        </p>

      </div>
    );
  }

  // ========================================
  // SUCCESS PAGE
  // ========================================

  return (

    <div className="payment-success-container">

      {/* CONFETTI */}

      <Confetti />

      <div className="payment-success-card">

        {/* SUCCESS ICON */}

        <div className="success-animation-header">

          <div className="success-icon-wrapper">

            <CheckCircle
              className="success-icon"
            />

          </div>

        </div>

        {/* CONTENT */}

        <div className="payment-success-content">

          <div className="success-badge">

            <ShieldCheck size={16} />

            Secure Stripe Payment

          </div>

          <h1 className="success-title">
            Payment Successful 🎉
          </h1>

          <p className="success-message">

            Your payment has been
            processed successfully.
            Your booking is now confirmed.

          </p>

          {/* PAYMENT DETAILS */}

          <div className="payment-details-card">

            <h2 className="payment-details-title">
              Payment Summary
            </h2>

            <div className="payment-detail-row">

              <span>

                <CreditCard size={16} />

                Payment Method

              </span>

              <strong>
                Stripe
              </strong>

            </div>

            <div className="payment-detail-row">

              <span>

                <BadgeCheck size={16} />

                Status

              </span>

              <strong className="paid-status">
                Paid
              </strong>

            </div>

            <div className="payment-detail-row">

              <span>

                <Wallet size={16} />

                Amount

              </span>

              <strong>
                R{payment?.amount || 0}
              </strong>

            </div>

            <div className="payment-detail-row">

              <span>

                <CalendarDays size={16} />

                Booking ID

              </span>

              <strong>
                #{payment?.booking_id}
              </strong>

            </div>

            <div className="payment-detail-row">

              <span>
                Transaction ID
              </span>

              <strong className="transaction-id">
                {payment?.transaction_id}
              </strong>

            </div>

          </div>

          {/* AUTO REDIRECT */}

          <div className="redirect-message">

            Redirecting to your bookings
            in {countdown}s...

          </div>

          {/* ACTION BUTTONS */}

          <div className="action-buttons">

            <button
              onClick={
                downloadReceipt
              }
              className="btn btn-primary"
            >

              <Receipt className="btn-icon" />

              Download Receipt

            </button>

            <button
              onClick={() =>
                navigate(
                  "/customer/bookings"
                )
              }
              className="btn btn-secondary"
            >

              <ArrowLeft className="btn-icon" />

              View Bookings

            </button>

            <button
              onClick={() =>
                navigate("/")
              }
              className="btn btn-text"
            >

              <Home className="btn-icon" />

              Back Home

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PaymentSuccess;