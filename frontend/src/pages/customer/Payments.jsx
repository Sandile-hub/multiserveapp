import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";

import {
  CreditCard,
  Wallet,
  BadgeCheck,
  Loader2,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Building2,
  User2,
  MapPin,
} from "lucide-react";

import "../../styles/Customer.css";

function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH PAYMENTS
  // ========================================

  const fetchPayments = async () => {
    try {
      const res = await API.get("/payments/customer");

      // Support both:
      // { payments: [...] }
      // and
      // [...]
      const data = res.data;

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data?.payments)) {
        setPayments(data.payments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusClass = (status) => {
    switch (String(status).toLowerCase()) {
      case "successful":
      case "paid":
        return "payment-status-paid";

      case "pending":
        return "payment-status-pending";

      case "failed":
        return "payment-status-failed";

      default:
        return "payment-status-default";
    }
  };

  // ========================================
  // STATUS LABEL
  // ========================================

  const getStatusLabel = (status) => {
    switch (String(status).toLowerCase()) {
      case "successful":
      case "paid":
        return "Paid";

      case "pending":
        return "Pending";

      case "failed":
        return "Failed";

      default:
        return status || "Unknown";
    }
  };

  // ========================================
  // PAYMENT METHOD LABEL
  // ========================================

  const getPaymentMethodLabel = (method) => {
    switch (String(method).toLowerCase()) {
      case "onsite":
        return "Pay on Site";

      case "stripe":
        return "Card";

      case "wallet":
        return "Wallet";

      default:
        return method || "N/A";
    }
  };

  // ========================================
  // TOTALS
  // ========================================

  const stats = useMemo(() => {
    const totalPaid = payments.reduce((sum, item) => {
      const status = String(item.status || "").toLowerCase();

      if (status === "paid" || status === "successful") {
        return sum + Number(item.amount || 0);
      }

      return sum;
    }, 0);

    const successful = payments.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      return status === "paid" || status === "successful";
    }).length;

    const pending = payments.filter((item) => {
      return String(item.status || "").toLowerCase() === "pending";
    }).length;

    return {
      totalPaid,
      successful,
      pending,
    };
  }, [payments]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={50} className="spinner text-cyan" />

          <p className="loading-text">
            Loading payments...
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

      <CustomerSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      <div className="customer-main">

        <CustomerNavbar
  toggleSidebar={() =>
    setSidebarOpen((previous) => !previous)
  }
/>

        <div className="customer-main-content">

          {/* ========================================
              HEADER
          ======================================== */}

          <div className="payments-header">

            <div>

              <div className="payments-badge">
                <Sparkles size={16} />

                Secure Payments
              </div>

              <h1 className="payments-title">
                Payment History
              </h1>

              <p className="payments-subtitle">
                View your payment history and payment status.
              </p>

            </div>

            {/* ========================================
                STATS
            ======================================== */}

            <div className="payments-stats">

              {/* TOTAL PAID */}

              <div className="payment-stat-card">

                <div className="payment-stat-header">

                  <Wallet className="payment-stat-icon-cyan" />

                  <ArrowUpRight className="payment-stat-arrow" />

                </div>

                <p className="payment-stat-label">
                  Total Paid
                </p>

                <h2 className="payment-stat-value">
                  R
                  {stats.totalPaid.toLocaleString(
                    "en-ZA",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </h2>

              </div>

              {/* SUCCESSFUL */}

              <div className="payment-stat-card">

                <div className="payment-stat-header">

                  <BadgeCheck className="payment-stat-icon-green" />

                </div>

                <p className="payment-stat-label">
                  Successful
                </p>

                <h2 className="payment-stat-value green">
                  {stats.successful}
                </h2>

              </div>

              {/* PENDING */}

              <div className="payment-stat-card">

                <div className="payment-stat-header">

                  <Clock3 className="payment-stat-icon-yellow" />

                </div>

                <p className="payment-stat-label">
                  Pending
                </p>

                <h2 className="payment-stat-value yellow">
                  {stats.pending}
                </h2>

              </div>

            </div>

          </div>

          {/* ========================================
              PAYMENT OPTIONS INFO
          ======================================== */}

          <div className="payment-options-info">

            <div className="payment-option-info active">

              <MapPin size={22} />

              <div>

                <strong>
                  Pay on Site
                </strong>

                <p>
                  Pay directly at the service provider's location.
                </p>

              </div>

            </div>

            <div className="payment-option-info disabled">

              <CreditCard size={22} />

              <div>

                <strong>
                  Pay with Card
                </strong>

                <p>
                  Coming Soon
                </p>

              </div>

            </div>

            <div className="payment-option-info disabled">

              <Wallet size={22} />

              <div>

                <strong>
                  Wallet
                </strong>

                <p>
                  Coming Soon
                </p>

              </div>

            </div>

          </div>

          {/* ========================================
              EMPTY STATE
          ======================================== */}

          {payments.length === 0 && (

            <div className="payments-empty">

              <AlertCircle
                size={80}
                className="payments-empty-icon"
              />

              <h2 className="payments-empty-title">
                No Payments Yet
              </h2>

              <p className="payments-empty-text">
                Your payment history will appear here after
                you make a payment for a booking.
              </p>

            </div>

          )}

          {/* ========================================
              PAYMENTS GRID
          ======================================== */}

          {payments.length > 0 && (

            <div className="payments-grid">

              {payments.map((payment) => {

                const status = String(
                  payment.status || ""
                ).toLowerCase();

                const isOnsite =
                  String(
                    payment.payment_method || ""
                  ).toLowerCase() === "onsite";

                const isPaid =
                  status === "paid" ||
                  status === "successful";

                return (

                  <div
                    key={payment.id}
                    className="payment-card"
                  >

                    <div className="payment-card-content">

                      {/* ========================================
                          TOP SECTION
                      ======================================== */}

                      <div className="payment-card-header">

                        <div>

                          <div className="payment-card-icon">

                            {isOnsite ? (
                              <MapPin size={30} />
                            ) : (
                              <CreditCard size={30} />
                            )}

                          </div>

                          <h2 className="payment-card-title">

                            {payment.service_name ||
                              "Service Payment"}

                          </h2>

                          <p className="payment-card-subtitle">

                            {isOnsite
                              ? "Pay on Site"
                              : "Payment Transaction"}

                          </p>

                        </div>

                        <div
                          className={`payment-status ${getStatusClass(
                            payment.status
                          )}`}
                        >

                          {getStatusLabel(payment.status)}

                        </div>

                      </div>

                      {/* ========================================
                          AMOUNT
                      ======================================== */}

                      <div className="payment-amount-card">

                        <p className="payment-amount-label">

                          {isPaid
                            ? "Amount Paid"
                            : "Amount Due"}

                        </p>

                        <h3 className="payment-amount-value">

                          R
                          {Number(
                            payment.amount || 0
                          ).toLocaleString(
                            "en-ZA",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}

                        </h3>

                      </div>

                      {/* ========================================
                          ONSITE NOTICE
                      ======================================== */}

                      {isOnsite && status === "pending" && (

                        <div className="payment-onsite-notice">

                          <MapPin size={20} />

                          <div>

                            <strong>
                              Payment due at the business
                            </strong>

                            <p>
                              Please pay the provider directly
                              when you arrive for your appointment.
                            </p>

                          </div>

                        </div>

                      )}

                      {/* ========================================
                          DETAILS
                      ======================================== */}

                      <div className="payment-details">

                        {/* METHOD */}

                        <div className="payment-detail-row">

                          <span className="payment-detail-label">

                            <Wallet size={16} />

                            Method

                          </span>

                          <span className="payment-detail-value capitalize">

                            {getPaymentMethodLabel(
                              payment.payment_method
                            )}

                          </span>

                        </div>

                        {/* DATE */}

                        <div className="payment-detail-row">

                          <span className="payment-detail-label">

                            <CalendarDays size={16} />

                            Date

                          </span>

                          <span className="payment-detail-value">

                            {payment.created_at
                              ? new Date(
                                  payment.created_at
                                ).toLocaleDateString(
                                  "en-ZA",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}

                          </span>

                        </div>

                        {/* PROVIDER */}

                        <div className="payment-detail-row">

                          <span className="payment-detail-label">

                            <User2 size={16} />

                            Provider

                          </span>

                          <span className="payment-detail-value">

                            {payment.provider_name ||
                              "Unknown"}

                          </span>

                        </div>

                        {/* BUSINESS */}

                        <div className="payment-detail-row">

                          <span className="payment-detail-label">

                            <Building2 size={16} />

                            Business

                          </span>

                          <span className="payment-detail-value">

                            {payment.business_name ||
                              "Unknown"}

                          </span>

                        </div>

                      </div>

                      {/* ========================================
                          TRANSACTION ID
                      ======================================== */}

                      {payment.transaction_id && (

                        <div className="payment-transaction">

                          <div className="payment-transaction-header">

                            <Receipt
                              size={16}
                              className="payment-transaction-icon"
                            />

                            <h3 className="payment-transaction-title">

                              Transaction ID

                            </h3>

                          </div>

                          <p className="payment-transaction-id">

                            {payment.transaction_id}

                          </p>

                        </div>

                      )}

                      {/* ========================================
                          SUCCESS
                      ======================================== */}

                      {isPaid && (

                        <div className="payment-success-badge">

                          <CheckCircle2 size={18} />

                          Payment Successful

                        </div>

                      )}

                      {/* ========================================
                          PENDING
                      ======================================== */}

                      {isOnsite &&
                        status === "pending" && (

                          <div className="payment-pending-badge">

                            <Clock3 size={18} />

                            Awaiting payment at business

                          </div>

                        )}

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Payments;