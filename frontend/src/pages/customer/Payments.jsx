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
} from "lucide-react";
import "../../styles/Customer.css";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH PAYMENTS
  const fetchPayments = async () => {
    try {
      const res = await API.get("/payments/customer");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // STATUS STYLE
  const getStatusClass = (status) => {
    switch (status) {
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

  // TOTALS
  const stats = useMemo(() => {
    const totalSpent = payments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );
    const successful = payments.filter((item) => item.status === "paid").length;
    const pending = payments.filter((item) => item.status === "pending").length;
    return { totalSpent, successful, pending };
  }, [payments]);

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={50} className="spinner text-cyan" />
          <p className="loading-text">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <div className="customer-main">
        <CustomerNavbar />

        <div className="customer-main-content">
          {/* HEADER */}
          <div className="payments-header">
            <div>
              <div className="payments-badge">
                <Sparkles size={16} />
                Secure Transactions
              </div>
              <h1 className="payments-title">Payment History</h1>
              <p className="payments-subtitle">
                Track all your payments and transactions.
              </p>
            </div>

            {/* STATS */}
            <div className="payments-stats">
              <div className="payment-stat-card">
                <div className="payment-stat-header">
                  <Wallet className="payment-stat-icon-cyan" />
                  <ArrowUpRight className="payment-stat-arrow" />
                </div>
                <p className="payment-stat-label">Total Spent</p>
                <h2 className="payment-stat-value">
                  R{stats.totalSpent.toLocaleString()}
                </h2>
              </div>

              <div className="payment-stat-card">
                <div className="payment-stat-header">
                  <BadgeCheck className="payment-stat-icon-green" />
                </div>
                <p className="payment-stat-label">Successful</p>
                <h2 className="payment-stat-value green">{stats.successful}</h2>
              </div>

              <div className="payment-stat-card">
                <div className="payment-stat-header">
                  <Clock3 className="payment-stat-icon-yellow" />
                </div>
                <p className="payment-stat-label">Pending</p>
                <h2 className="payment-stat-value yellow">{stats.pending}</h2>
              </div>
            </div>
          </div>

          {/* EMPTY STATE */}
          {payments.length === 0 && (
            <div className="payments-empty">
              <AlertCircle size={80} className="payments-empty-icon" />
              <h2 className="payments-empty-title">No Payments Yet</h2>
              <p className="payments-empty-text">
                Your completed transactions and payment history will appear
                here.
              </p>
            </div>
          )}

          {/* PAYMENTS GRID */}
          <div className="payments-grid">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="payment-card-content">
                  {/* TOP SECTION */}
                  <div className="payment-card-header">
                    <div>
                      <div className="payment-card-icon">
                        <CreditCard size={30} />
                      </div>
                      <h2 className="payment-card-title">
                        {payment.service_name || "Service Payment"}
                      </h2>
                      <p className="payment-card-subtitle">
                        Payment Transaction
                      </p>
                    </div>
                    <div
                      className={`payment-status ${getStatusClass(payment.status)}`}
                    >
                      {payment.status}
                    </div>
                  </div>

                  {/* AMOUNT */}
                  <div className="payment-amount-card">
                    <p className="payment-amount-label">Amount Paid</p>
                    <h3 className="payment-amount-value">R{payment.amount}</h3>
                  </div>

                  {/* DETAILS */}
                  <div className="payment-details">
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">
                        <Wallet size={16} /> Method
                      </span>
                      <span className="payment-detail-value capitalize">
                        {payment.payment_method || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">
                        <CalendarDays size={16} /> Date
                      </span>
                      <span className="payment-detail-value">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">
                        <User2 size={16} /> Provider
                      </span>
                      <span className="payment-detail-value">
                        {payment.provider_name || "Unknown"}
                      </span>
                    </div>
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">
                        <Building2 size={16} /> Business
                      </span>
                      <span className="payment-detail-value">
                        {payment.business_name || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* TRANSACTION ID */}
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

                  {/* SUCCESS BADGE */}
                  {payment.status === "paid" && (
                    <div className="payment-success-badge">
                      <CheckCircle2 size={18} />
                      Payment Successful
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
